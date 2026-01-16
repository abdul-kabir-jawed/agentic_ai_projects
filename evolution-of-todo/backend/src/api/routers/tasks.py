"""Tasks API router."""
from typing import Annotated, Optional, List

from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session

from src.api.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskListResponse,
)
from src.auth.dependencies import get_current_user
from src.db.database import get_session
from src.models.user import User
from src.services.task_service import TaskService

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    """Create a new task for the current user.

    Args:
        task_data: Task creation data
        current_user: Authenticated user from token
        session: Database session

    Returns:
        Created task
    """
    task_service = TaskService(session)
    task = task_service.create_task(current_user.id, task_data)

    return TaskResponse.model_validate(task)


@router.get("/daily/all", response_model=List[TaskResponse])
async def get_daily_tasks(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    """Get all daily tasks for the current user.

    IMPORTANT: This route must be BEFORE /{task_id} to prevent routing conflicts.

    Args:
        current_user: Authenticated user from token
        session: Database session

    Returns:
        List of daily tasks
    """
    task_service = TaskService(session)
    return task_service.get_daily_tasks(current_user.id)


@router.get("", response_model=TaskListResponse)
async def get_tasks(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    is_completed: Optional[bool] = Query(None, description="Filter by completion status"),
    priority: Optional[str] = Query(None, pattern="^(low|medium|high)$", description="Filter by priority"),
    search: Optional[str] = Query(None, description="Search in task description"),
):
    """Get tasks for the current user with pagination and filtering.

    Args:
        current_user: Authenticated user from token
        session: Database session
        page: Page number (1-indexed)
        page_size: Number of items per page
        is_completed: Filter by completion status
        priority: Filter by priority level
        search: Search in task description

    Returns:
        Paginated task list
    """
    task_service = TaskService(session)
    return task_service.get_tasks(
        user_id=current_user.id,
        page=page,
        page_size=page_size,
        is_completed=is_completed,
        priority=priority,
        search=search,
    )


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    """Get a specific task by ID.

    Args:
        task_id: Task ID to retrieve
        current_user: Authenticated user from token
        session: Database session

    Returns:
        Task data

    Raises:
        HTTPException: If task not found
    """
    task_service = TaskService(session)
    task = task_service.get_task(task_id, current_user.id)

    return TaskResponse.model_validate(task)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    """Update a task.

    Args:
        task_id: Task ID to update
        task_data: Updated task data
        current_user: Authenticated user from token
        session: Database session

    Returns:
        Updated task

    Raises:
        HTTPException: If task not found
    """
    task_service = TaskService(session)
    task = task_service.update_task(task_id, current_user.id, task_data)

    return TaskResponse.model_validate(task)


@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def complete_task(
    task_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    """Mark a task as completed.

    Args:
        task_id: Task ID to complete
        current_user: Authenticated user from token
        session: Database session

    Returns:
        Updated task

    Raises:
        HTTPException: If task not found
    """
    task_service = TaskService(session)
    task = task_service.complete_task(task_id, current_user.id)

    return TaskResponse.model_validate(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    """Delete a task.

    Args:
        task_id: Task ID to delete
        current_user: Authenticated user from token
        session: Database session

    Returns:
        No content

    Raises:
        HTTPException: If task not found
    """
    task_service = TaskService(session)
    task_service.delete_task(task_id, current_user.id)
    return None
