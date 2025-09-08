"""
API v1 router configuration.

Consolidates all v1 API endpoints and provides centralized routing,
middleware, and error handling for the AgentFlow API.
"""

from fastapi import APIRouter

from .endpoints import workflows, agents, executions, auth, users

api_router = APIRouter()

# Authentication routes
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])

# User management routes
api_router.include_router(users.router, prefix="/users", tags=["users"])

# Core feature routes
api_router.include_router(workflows.router, prefix="/workflows", tags=["workflows"])
api_router.include_router(agents.router, prefix="/agents", tags=["agents"])
api_router.include_router(executions.router, prefix="/executions", tags=["executions"])

# Health check for API v1
@api_router.get("/health")
async def api_health():
    """API v1 health check"""
    return {"status": "healthy", "version": "1.0.0", "api": "v1"}