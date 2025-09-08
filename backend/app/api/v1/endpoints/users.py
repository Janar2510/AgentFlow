"""
User management endpoints.
"""

from fastapi import APIRouter

router = APIRouter()

@router.get("/me")
async def get_current_user():
    """Get current user profile"""
    # TODO: Implement user profile retrieval
    return {"message": "User profile - TODO: implement"}