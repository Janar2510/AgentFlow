"""
Agent marketplace and management endpoints.
"""

from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_agents():
    """List available agents"""
    # TODO: Implement agent listing
    return {"message": "Agent list - TODO: implement"}

@router.get("/{agent_id}")
async def get_agent(agent_id: str):
    """Get specific agent details"""
    # TODO: Implement agent retrieval
    return {"message": f"Agent {agent_id} - TODO: implement"}