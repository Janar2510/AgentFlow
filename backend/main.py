"""
AgentFlow Backend - Main FastAPI Application

A comprehensive backend API for the AgentFlow visual workflow designer,
providing endpoints for workflow management, agent execution, and real-time monitoring.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import structlog
from prometheus_client import make_asgi_app, Counter, Histogram, Gauge
from typing import Dict, List
import json
import asyncio

from app.core.config import settings
from app.core.database import create_tables
from app.api.v1 import api_router
from app.core.websocket_manager import WebSocketManager

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.dev.ConsoleRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger(__name__)

# Prometheus metrics
REQUEST_COUNT = Counter('agentflow_requests_total', 'Total requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('agentflow_request_duration_seconds', 'Request duration')
ACTIVE_WORKFLOWS = Gauge('agentflow_active_workflows', 'Number of active workflows')
AGENT_EXECUTIONS = Counter('agentflow_agent_executions_total', 'Total agent executions', ['agent_type', 'status'])

# WebSocket manager for real-time communication
websocket_manager = WebSocketManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("Starting AgentFlow backend...")
    
    # Initialize database
    await create_tables()
    
    # Start background tasks
    asyncio.create_task(websocket_manager.broadcast_system_status())
    
    logger.info("AgentFlow backend started successfully")
    yield
    
    logger.info("Shutting down AgentFlow backend...")

# Create FastAPI application
app = FastAPI(
    title="AgentFlow API",
    description="Visual Multi-Agent Workflow Designer Backend",
    version="1.0.0",
    docs_url="/docs" if settings.API_DEBUG else None,
    redoc_url="/redoc" if settings.API_DEBUG else None,
    lifespan=lifespan,
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.DEV_CORS_ORIGINS if settings.API_DEBUG else ["https://agentflow.dev"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Add Prometheus metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Serve static files in production
if not settings.API_DEBUG:
    app.mount("/", StaticFiles(directory="static", html=True), name="static")

@app.middleware("http")
async def add_process_time_header(request, call_next):
    """Add request processing time to response headers"""
    import time
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    
    # Update Prometheus metrics
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path
    ).inc()
    REQUEST_DURATION.observe(process_time)
    
    return response

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error("Unhandled exception", exc_info=exc, path=request.url.path)
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred. Please try again later.",
            "request_id": getattr(request.state, "request_id", None)
        }
    )

# WebSocket endpoints
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Main WebSocket endpoint for real-time communication"""
    await websocket_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "subscribe":
                await websocket_manager.subscribe(websocket, message.get("channels", []))
            elif message.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong", "timestamp": message.get("timestamp")}))
            
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)
    except Exception as e:
        logger.error("WebSocket error", exc_info=e)
        websocket_manager.disconnect(websocket)

@app.websocket("/ws/workflow/{workflow_id}")
async def workflow_websocket(websocket: WebSocket, workflow_id: str):
    """WebSocket endpoint for workflow-specific real-time updates"""
    await websocket_manager.connect(websocket, f"workflow:{workflow_id}")
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Broadcast to all clients subscribed to this workflow
            await websocket_manager.broadcast_to_channel(
                f"workflow:{workflow_id}",
                message,
                exclude=websocket
            )
            
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)

# Health check endpoints
@app.get("/health")
async def health_check():
    """Application health check"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": "development" if settings.API_DEBUG else "production"
    }

@app.get("/health/ready")
async def readiness_check():
    """Kubernetes readiness probe"""
    try:
        # Check database connection
        from app.core.database import get_db
        async for db in get_db():
            await db.execute("SELECT 1")
            break
        
        return {"status": "ready"}
    except Exception as e:
        logger.error("Readiness check failed", exc_info=e)
        return JSONResponse(
            status_code=503,
            content={"status": "not_ready", "error": str(e)}
        )

# Root endpoint
@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "Welcome to AgentFlow API",
        "version": "1.0.0",
        "docs": "/docs" if settings.API_DEBUG else None,
        "status": "operational"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_DEBUG,
        log_level="debug" if settings.API_DEBUG else "info"
    )