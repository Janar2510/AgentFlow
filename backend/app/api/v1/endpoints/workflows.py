"""
Workflow management endpoints.

Provides CRUD operations for workflows, including creation, modification,
execution, and collaborative editing features.
"""

from fastapi import APIRouter, Depends, HTTPException, status, WebSocket
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import uuid
import structlog

from app.core.database import get_db
from app.models.workflow import Workflow
from app.schemas.workflow import (
    WorkflowCreate,
    WorkflowUpdate,
    WorkflowResponse,
    WorkflowListResponse,
    WorkflowExecutionRequest,
    WorkflowExecutionResponse,
)
from app.services.workflow_service import WorkflowService
from app.services.execution_service import ExecutionService
from app.core.websocket_manager import WebSocketManager

logger = structlog.get_logger(__name__)
router = APIRouter()

# Dependency injection
def get_workflow_service(db: AsyncSession = Depends(get_db)) -> WorkflowService:
    return WorkflowService(db)

def get_execution_service(db: AsyncSession = Depends(get_db)) -> ExecutionService:
    return ExecutionService(db)

# Global WebSocket manager (in production, this would be injected)
websocket_manager = WebSocketManager()

@router.get("/", response_model=WorkflowListResponse)
async def list_workflows(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    tag: Optional[str] = None,
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """
    Retrieve a list of workflows with optional filtering.
    
    Args:
        skip: Number of workflows to skip (pagination)
        limit: Maximum number of workflows to return
        search: Optional search query for workflow names/descriptions
        tag: Optional tag filter
        workflow_service: Injected workflow service
    
    Returns:
        WorkflowListResponse: List of workflows with metadata
    """
    try:
        workflows = await workflow_service.list_workflows(
            skip=skip,
            limit=limit,
            search=search,
            tag=tag
        )
        
        total = await workflow_service.count_workflows(search=search, tag=tag)
        
        return WorkflowListResponse(
            workflows=workflows,
            total=total,
            skip=skip,
            limit=limit
        )
        
    except Exception as e:
        logger.error("Failed to list workflows", exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve workflows"
        )

@router.get("/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(
    workflow_id: str,
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """
    Retrieve a specific workflow by ID.
    
    Args:
        workflow_id: Unique workflow identifier
        workflow_service: Injected workflow service
    
    Returns:
        WorkflowResponse: Complete workflow data
    """
    try:
        workflow = await workflow_service.get_workflow(workflow_id)
        
        if not workflow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workflow {workflow_id} not found"
            )
        
        return WorkflowResponse.from_orm(workflow)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get workflow", workflow_id=workflow_id, exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve workflow"
        )

@router.post("/", response_model=WorkflowResponse, status_code=status.HTTP_201_CREATED)
async def create_workflow(
    workflow_data: WorkflowCreate,
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """
    Create a new workflow.
    
    Args:
        workflow_data: Workflow creation data
        workflow_service: Injected workflow service
    
    Returns:
        WorkflowResponse: Created workflow data
    """
    try:
        workflow = await workflow_service.create_workflow(workflow_data)
        
        # Broadcast workflow creation to subscribers
        await websocket_manager.broadcast_to_channel(
            "workflows",
            {
                "type": "workflow_created",
                "data": WorkflowResponse.from_orm(workflow).dict()
            }
        )
        
        logger.info("Workflow created", workflow_id=workflow.id, name=workflow.name)
        
        return WorkflowResponse.from_orm(workflow)
        
    except Exception as e:
        logger.error("Failed to create workflow", exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create workflow"
        )

@router.put("/{workflow_id}", response_model=WorkflowResponse)
async def update_workflow(
    workflow_id: str,
    workflow_data: WorkflowUpdate,
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """
    Update an existing workflow.
    
    Args:
        workflow_id: Unique workflow identifier
        workflow_data: Workflow update data
        workflow_service: Injected workflow service
    
    Returns:
        WorkflowResponse: Updated workflow data
    """
    try:
        workflow = await workflow_service.update_workflow(workflow_id, workflow_data)
        
        if not workflow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workflow {workflow_id} not found"
            )
        
        # Broadcast workflow update to subscribers
        await websocket_manager.broadcast_to_channel(
            f"workflow:{workflow_id}",
            {
                "type": "workflow_updated",
                "data": WorkflowResponse.from_orm(workflow).dict()
            }
        )
        
        logger.info("Workflow updated", workflow_id=workflow_id, name=workflow.name)
        
        return WorkflowResponse.from_orm(workflow)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update workflow", workflow_id=workflow_id, exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update workflow"
        )

@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workflow(
    workflow_id: str,
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """
    Delete a workflow.
    
    Args:
        workflow_id: Unique workflow identifier
        workflow_service: Injected workflow service
    """
    try:
        success = await workflow_service.delete_workflow(workflow_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workflow {workflow_id} not found"
            )
        
        # Broadcast workflow deletion to subscribers
        await websocket_manager.broadcast_to_channel(
            "workflows",
            {
                "type": "workflow_deleted",
                "data": {"workflow_id": workflow_id}
            }
        )
        
        logger.info("Workflow deleted", workflow_id=workflow_id)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete workflow", workflow_id=workflow_id, exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete workflow"
        )

@router.post("/{workflow_id}/execute", response_model=WorkflowExecutionResponse)
async def execute_workflow(
    workflow_id: str,
    execution_request: WorkflowExecutionRequest,
    execution_service: ExecutionService = Depends(get_execution_service),
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """
    Execute a workflow with provided inputs.
    
    Args:
        workflow_id: Unique workflow identifier
        execution_request: Execution parameters and inputs
        execution_service: Injected execution service
        workflow_service: Injected workflow service
    
    Returns:
        WorkflowExecutionResponse: Execution result and metadata
    """
    try:
        # Verify workflow exists
        workflow = await workflow_service.get_workflow(workflow_id)
        if not workflow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workflow {workflow_id} not found"
            )
        
        # Start execution
        execution = await execution_service.start_execution(
            workflow_id=workflow_id,
            inputs=execution_request.inputs,
            parameters=execution_request.parameters
        )
        
        # Broadcast execution started
        await websocket_manager.broadcast_to_channel(
            f"workflow:{workflow_id}",
            {
                "type": "execution_started",
                "data": {
                    "execution_id": execution.id,
                    "workflow_id": workflow_id,
                    "status": execution.status
                }
            }
        )
        
        logger.info(
            "Workflow execution started",
            workflow_id=workflow_id,
            execution_id=execution.id
        )
        
        return WorkflowExecutionResponse.from_orm(execution)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to execute workflow",
            workflow_id=workflow_id,
            exc_info=e
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to execute workflow"
        )

@router.get("/{workflow_id}/executions")
async def get_workflow_executions(
    workflow_id: str,
    skip: int = 0,
    limit: int = 50,
    execution_service: ExecutionService = Depends(get_execution_service)
):
    """
    Get execution history for a workflow.
    
    Args:
        workflow_id: Unique workflow identifier
        skip: Number of executions to skip
        limit: Maximum number of executions to return
        execution_service: Injected execution service
    
    Returns:
        List of workflow executions
    """
    try:
        executions = await execution_service.get_workflow_executions(
            workflow_id=workflow_id,
            skip=skip,
            limit=limit
        )
        
        return {
            "executions": executions,
            "workflow_id": workflow_id,
            "skip": skip,
            "limit": limit
        }
        
    except Exception as e:
        logger.error(
            "Failed to get workflow executions",
            workflow_id=workflow_id,
            exc_info=e
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve execution history"
        )

@router.post("/{workflow_id}/duplicate", response_model=WorkflowResponse)
async def duplicate_workflow(
    workflow_id: str,
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """
    Create a duplicate of an existing workflow.
    
    Args:
        workflow_id: Unique workflow identifier to duplicate
        workflow_service: Injected workflow service
    
    Returns:
        WorkflowResponse: Duplicated workflow data
    """
    try:
        workflow = await workflow_service.duplicate_workflow(workflow_id)
        
        if not workflow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workflow {workflow_id} not found"
            )
        
        logger.info(
            "Workflow duplicated",
            original_id=workflow_id,
            duplicate_id=workflow.id
        )
        
        return WorkflowResponse.from_orm(workflow)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Failed to duplicate workflow",
            workflow_id=workflow_id,
            exc_info=e
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to duplicate workflow"
        )