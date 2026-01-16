"""Tasks API router using consolidated UserData model."""
from typing import Annotated, Optional, List

from fastapi import APIRouter, Depends, Query, status, BackgroundTasks, HTTPException
from sqlmodel import Session

from src.api.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskListResponse,
)
from src.auth.dependencies import get_current_user, BetterAuthUser
from src.db.database import get_session
from src.repositories.user_data_repository import UserDataRepository
from src.services.event_service import (
    publish_todo_created,
    publish_todo_completed,
    publish_todo_deleted,
)

router = APIRouter(prefix="/tasks", tags=["Tasks"])


def task_to_response(task: dict) -> TaskResponse:
    """Convert task dict to TaskResponse."""
    return TaskResponse(
        id=task.get("id", ""),
        description=task.get("description", ""),
        priority=task.get("priority", "medium"),
        tags=task.get("tags"),
        due_date=task.get("due_date"),
        is_completed=task.get("is_completed", False),
        is_daily=task.get("is_daily", False),
        created_at=task.get("created_at", ""),
        updated_at=task.get("updated_at", ""),
    )


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: Annotated[BetterAuthUser, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
    background_tasks: BackgroundTasks,
):
    """Create a new task for the current user.

    Args:
        task_data: Task creation data
        current_user: Authenticated Better Auth user
        session: Database session
        background_tasks: FastAPI background tasks

    Returns:
        Created task
    """
    repo = UserDataRepository(session)

    # Convert due_date to ISO string if present
    due_date_str = task_data.due_date.isoformat() if task_data.due_date else None

    task = repo.create_task(
        user_id=current_user.id,
        email=current_user.email,
        description=task_data.description,
        priority=task_data.priority,
        tags=task_data.tags,
        due_date=due_date_str,
        is_daily=task_data.is_daily,
        name=current_user.name if hasattr(current_user, 'name') else None,
    )

    # Publish event in background (if Kafka is enabled)
    try:
        background_tasks.add_task(
            publish_todo_created,
            task["id"],
            task["description"],
            current_user.id
        )
    except Exception:
        # Ignore if event publishing fails (Kafka might not be configured)
        pass

    return task_to_response(task)


@router.get("/daily/all", response_model=List[TaskResponse])
async def get_daily_tasks(
    current_user: Annotated[BetterAuthUser, Depends(get_current_user)],
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
    repo = UserDataRepository(session)
    tasks = repo.get_daily_tasks(current_user.id)
    return [task_to_response(t) for t in tasks]


@router.get("", response_model=TaskListResponse)
async def get_tasks(
    current_user: Annotated[BetterAuthUser, Depends(get_current_user)],
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
    repo = UserDataRepository(session)

    # Calculate skip for pagination
    skip = (page - 1) * page_size

    tasks, total = repo.get_tasks(
        user_id=current_user.id,
        skip=skip,
        limit=page_size,
        is_completed=is_completed,
        priority=priority,
        search=search,
    )

    # Calculate total pages
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    return TaskListResponse(
        items=[task_to_response(t) for t in tasks],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    current_user: Annotated[BetterAuthUser, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    """Get a specific task by ID.

    Args:
        task_id: Task ID to retrieve (string UUID)
        current_user: Authenticated user from token
        session: Database session

    Returns:
        Task data

    Raises:
        HTTPException: If task not found
    """
    repo = UserDataRepository(session)
    task = repo.get_task(current_user.id, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task_to_response(task)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    current_user: Annotated[BetterAuthUser, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    """Update a task.

    Args:
        task_id: Task ID to update (string UUID)
        task_data: Updated task data
        current_user: Authenticated user from token
        session: Database session

    Returns:
        Updated task

    Raises:
        HTTPException: If task not found
    """
    repo = UserDataRepository(session)

    # Build updates dict from non-None values
    updates = {}
    if task_data.description is not None:
        updates["description"] = task_data.description
    if task_data.priority is not None:
        updates["priority"] = task_data.priority
    if task_data.tags is not None:
        # Convert list to comma-separated string if needed
        updates["tags"] = ",".join(task_data.tags) if isinstance(task_data.tags, list) else task_data.tags
    if task_data.due_date is not None:
        updates["due_date"] = task_data.due_date.isoformat()
    if task_data.is_daily is not None:
        updates["is_daily"] = task_data.is_daily
    if task_data.is_completed is not None:
        updates["is_completed"] = task_data.is_completed

    task = repo.update_task(current_user.id, task_id, updates)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return task_to_response(task)


@router.patch("/{task_id}", response_model=TaskResponse)
async def partial_update_task(
    task_id: str,
    task_data: TaskUpdate,
    current_user: Annotated[BetterAuthUser, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    """Partially update a task (PATCH support).

    Args:
        task_id: Task ID to update (string UUID)
        task_data: Partial task update data
        current_user: Authenticated user from token
        session: Database session

    Returns:
        Updated task

    Raises:
        HTTPException: If task not found
    """
    # Reuse the PUT handler logic
    return await update_task(task_id, task_data, current_user, session)


@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def complete_task(
    task_id: str,
    current_user: Annotated[BetterAuthUser, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
    background_tasks: BackgroundTasks,
):
    """Mark a task as completed.

    Args:
        task_id: Task ID to complete (string UUID)
        current_user: Authenticated user from token
        session: Database session
        background_tasks: FastAPI background tasks

    Returns:
        Updated task

    Raises:
        HTTPException: If task not found
    """
    repo = UserDataRepository(session)
    task = repo.update_task(current_user.id, task_id, {"is_completed": True})

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Publish event in background (if Kafka is enabled)
    try:
        background_tasks.add_task(
            publish_todo_completed,
            task["id"],
            task["description"],
            current_user.id
        )
    except Exception:
        # Ignore if event publishing fails (Kafka might not be configured)
        pass

    return task_to_response(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    current_user: Annotated[BetterAuthUser, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
    background_tasks: BackgroundTasks,
):
    """Delete a task.

    Args:
        task_id: Task ID to delete (string UUID)
        current_user: Authenticated user from token
        session: Database session
        background_tasks: FastAPI background tasks

    Returns:
        No content

    Raises:
        HTTPException: If task not found
    """
    repo = UserDataRepository(session)
    deleted = repo.delete_task(current_user.id, task_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Publish event in background (if Kafka is enabled)
    try:
        background_tasks.add_task(
            publish_todo_deleted,
            task_id,
            current_user.id
        )
    except Exception:
        # Ignore if event publishing fails (Kafka might not be configured)
        pass

    return None
