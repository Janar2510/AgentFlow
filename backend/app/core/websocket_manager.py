"""
WebSocket connection manager for real-time communication.

Handles WebSocket connections, message broadcasting, and channel subscriptions
for collaborative editing and live workflow execution monitoring.
"""

from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List, Set, Any, Optional
import json
import asyncio
import structlog
from datetime import datetime
import uuid

logger = structlog.get_logger(__name__)


class WebSocketManager:
    """Manages WebSocket connections and message broadcasting"""
    
    def __init__(self):
        # Active connections: {connection_id: websocket}
        self.active_connections: Dict[str, WebSocket] = {}
        
        # Channel subscriptions: {channel: set(connection_ids)}
        self.channel_subscriptions: Dict[str, Set[str]] = {}
        
        # Connection metadata: {connection_id: metadata}
        self.connection_metadata: Dict[str, Dict[str, Any]] = {}
        
        # Connection to channels mapping: {connection_id: set(channels)}
        self.connection_channels: Dict[str, Set[str]] = {}
    
    async def connect(self, websocket: WebSocket, initial_channel: Optional[str] = None) -> str:
        """
        Accept a new WebSocket connection.
        
        Args:
            websocket: WebSocket connection
            initial_channel: Optional channel to subscribe to immediately
            
        Returns:
            str: Connection ID
        """
        await websocket.accept()
        
        connection_id = str(uuid.uuid4())
        self.active_connections[connection_id] = websocket
        self.connection_metadata[connection_id] = {
            "connected_at": datetime.utcnow(),
            "user_id": None,  # Will be set after authentication
            "ip_address": websocket.client.host if websocket.client else None,
        }
        self.connection_channels[connection_id] = set()
        
        # Subscribe to initial channel if provided
        if initial_channel:
            await self.subscribe_connection(connection_id, initial_channel)
        
        logger.info(
            "WebSocket connection established",
            connection_id=connection_id,
            channel=initial_channel,
            total_connections=len(self.active_connections)
        )
        
        # Send welcome message
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "connection_id": connection_id,
            "timestamp": datetime.utcnow().isoformat(),
        }))
        
        return connection_id
    
    def disconnect(self, websocket: WebSocket):
        """
        Remove a WebSocket connection.
        
        Args:
            websocket: WebSocket connection to remove
        """
        # Find connection ID by websocket
        connection_id = None
        for conn_id, ws in self.active_connections.items():
            if ws == websocket:
                connection_id = conn_id
                break
        
        if connection_id:
            self._remove_connection(connection_id)
    
    def disconnect_by_id(self, connection_id: str):
        """
        Remove a WebSocket connection by ID.
        
        Args:
            connection_id: Connection ID to remove
        """
        self._remove_connection(connection_id)
    
    def _remove_connection(self, connection_id: str):
        """Internal method to remove a connection"""
        # Remove from active connections
        if connection_id in self.active_connections:
            del self.active_connections[connection_id]
        
        # Remove from all channel subscriptions
        channels_to_cleanup = []
        for channel, subscribers in self.channel_subscriptions.items():
            subscribers.discard(connection_id)
            if not subscribers:
                channels_to_cleanup.append(channel)
        
        # Clean up empty channels
        for channel in channels_to_cleanup:
            del self.channel_subscriptions[channel]
        
        # Remove metadata and channel mappings
        self.connection_metadata.pop(connection_id, None)
        self.connection_channels.pop(connection_id, None)
        
        logger.info(
            "WebSocket connection removed",
            connection_id=connection_id,
            remaining_connections=len(self.active_connections)
        )
    
    async def subscribe_connection(self, connection_id: str, channel: str):
        """
        Subscribe a connection to a channel.
        
        Args:
            connection_id: Connection ID
            channel: Channel name
        """
        if channel not in self.channel_subscriptions:
            self.channel_subscriptions[channel] = set()
        
        self.channel_subscriptions[channel].add(connection_id)
        self.connection_channels[connection_id].add(channel)
        
        logger.debug(
            "Connection subscribed to channel",
            connection_id=connection_id,
            channel=channel
        )
    
    async def unsubscribe_connection(self, connection_id: str, channel: str):
        """
        Unsubscribe a connection from a channel.
        
        Args:
            connection_id: Connection ID
            channel: Channel name
        """
        if channel in self.channel_subscriptions:
            self.channel_subscriptions[channel].discard(connection_id)
            if not self.channel_subscriptions[channel]:
                del self.channel_subscriptions[channel]
        
        if connection_id in self.connection_channels:
            self.connection_channels[connection_id].discard(channel)
    
    async def subscribe(self, websocket: WebSocket, channels: List[str]):
        """
        Subscribe a WebSocket to multiple channels.
        
        Args:
            websocket: WebSocket connection
            channels: List of channel names
        """
        # Find connection ID
        connection_id = None
        for conn_id, ws in self.active_connections.items():
            if ws == websocket:
                connection_id = conn_id
                break
        
        if not connection_id:
            logger.warning("Attempted to subscribe unknown WebSocket connection")
            return
        
        for channel in channels:
            await self.subscribe_connection(connection_id, channel)
        
        # Send confirmation
        await websocket.send_text(json.dumps({
            "type": "subscription_confirmed",
            "channels": channels,
            "timestamp": datetime.utcnow().isoformat(),
        }))
    
    async def broadcast_to_channel(self, channel: str, message: Dict[str, Any], exclude: Optional[WebSocket] = None):
        """
        Broadcast a message to all connections in a channel.
        
        Args:
            channel: Channel name
            message: Message to broadcast
            exclude: Optional WebSocket to exclude from broadcast
        """
        if channel not in self.channel_subscriptions:
            return
        
        exclude_id = None
        if exclude:
            for conn_id, ws in self.active_connections.items():
                if ws == exclude:
                    exclude_id = conn_id
                    break
        
        # Add metadata to message
        message.update({
            "channel": channel,
            "timestamp": datetime.utcnow().isoformat(),
        })
        
        message_text = json.dumps(message)
        failed_connections = []
        
        for connection_id in self.channel_subscriptions[channel]:
            if connection_id == exclude_id:
                continue
            
            websocket = self.active_connections.get(connection_id)
            if websocket:
                try:
                    await websocket.send_text(message_text)
                except Exception as e:
                    logger.error(
                        "Failed to send message to WebSocket",
                        connection_id=connection_id,
                        channel=channel,
                        error=str(e)
                    )
                    failed_connections.append(connection_id)
        
        # Clean up failed connections
        for connection_id in failed_connections:
            self._remove_connection(connection_id)
        
        logger.debug(
            "Message broadcasted to channel",
            channel=channel,
            recipients=len(self.channel_subscriptions[channel]) - (1 if exclude_id else 0),
            failed=len(failed_connections)
        )
    
    async def send_to_connection(self, connection_id: str, message: Dict[str, Any]):
        """
        Send a message to a specific connection.
        
        Args:
            connection_id: Target connection ID
            message: Message to send
        """
        websocket = self.active_connections.get(connection_id)
        if not websocket:
            logger.warning("Attempted to send message to unknown connection", connection_id=connection_id)
            return False
        
        message.update({
            "timestamp": datetime.utcnow().isoformat(),
        })
        
        try:
            await websocket.send_text(json.dumps(message))
            return True
        except Exception as e:
            logger.error(
                "Failed to send message to connection",
                connection_id=connection_id,
                error=str(e)
            )
            self._remove_connection(connection_id)
            return False
    
    async def broadcast_system_status(self):
        """Broadcast system status periodically"""
        while True:
            try:
                status_message = {
                    "type": "system_status",
                    "data": {
                        "active_connections": len(self.active_connections),
                        "active_channels": len(self.channel_subscriptions),
                        "server_time": datetime.utcnow().isoformat(),
                    }
                }
                
                await self.broadcast_to_channel("system", status_message)
                await asyncio.sleep(30)  # Broadcast every 30 seconds
                
            except Exception as e:
                logger.error("Error in system status broadcast", exc_info=e)
                await asyncio.sleep(60)  # Wait longer on error
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Get connection statistics"""
        return {
            "total_connections": len(self.active_connections),
            "total_channels": len(self.channel_subscriptions),
            "channel_stats": {
                channel: len(subscribers)
                for channel, subscribers in self.channel_subscriptions.items()
            },
            "connections_by_channel": {
                conn_id: list(channels)
                for conn_id, channels in self.connection_channels.items()
            }
        }