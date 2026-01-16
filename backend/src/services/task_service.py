"""Task business logic service."""
import json
from typing import List, Optional
from datetime import datetime

from fastapi import HTTPException, status
from sqlmodel import Session

from src.models.task import Task
from src.repositories.task_repository import TaskRepository
from src.api.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskListResponse,
)


class TaskService:
    """Service for task business logic."""

    def __init__(self, session: Session):
        """Initialize service with database session.

        Args:
            session: SQLModel database session
        """
        self.session = session
        self.task_repo = TaskRepository(session)

    def create_task(self, user_id: str, task_data: TaskCreate) -> Task:
        """Create a new task for a user.

        Args:
            user_id: User ID who owns the task
            task_data: Task creation data

        Returns:
            Created task
        """
        # Handle tags: convert comma-separated string to JSON array if needed
        tags_json = None
        if task_data.tags:
            # If tags is already a string (comma-separated), keep it as-is
            # The frontend sends tags as a comma-separated string
            tags_json = task_data.tags

        task = Task(
            user_id=user_id,
            description=task_data.description,
            priority=task_data.priority,
            tags=tags_json,
            due_date=task_data.due_date,
            is_daily=task_data.is_daily,
        )

        return self.task_repo.create(task)

    def get_task(self, task_id: int, user_id: str) -> Task:
        """Get a task by ID for a specific user.

        Args:
            task_id: Task ID to retrieve
            user_id: User ID who owns the task

        Returns:
            Task instance

        Raises:
            HTTPException: If task not found
        """
        task = self.task_repo.get_by_id(task_id, user_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found",
            )
        return task

    def get_tasks(
        self,
        user_id: str,
        page: int = 1,
        page_size: int = 50,
        is_completed: Optional[bool] = None,
        priority: Optional[str] = None,
        search: Optional[str] = None,
    ) -> TaskListResponse:
        """Get tasks for a user with pagination and filtering.

        Args:
            user_id: User ID to filter tasks
            page: Page number (1-indexed)
            page_size: Number of items per page
            is_completed: Filter by completion status
            priority: Filter by priority level
            search: Search in task description

        Returns:
            Paginated task list response
        """
        # Calculate skip value
        skip = (page - 1) * page_size

        # Get tasks and total count
        tasks, total = self.task_repo.get_all_by_user(
            user_id=user_id,
            skip=skip,
            limit=page_size,
            is_completed=is_completed,
            priority=priority,
            search=search,
        )

        # Calculate total pages
        total_pages = (total + page_size - 1) // page_size

        # Convert tasks to response format
        task_responses = []
        for task in tasks:
            task_responses.append(TaskResponse.model_validate(task))

        return TaskListResponse(
            tasks=task_responses,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    def get_daily_tasks(self, user_id: str) -> List[TaskResponse]:
        """Get all daily tasks for a user.

        Args:
            user_id: User ID to filter tasks

        Returns:
            List of daily tasks
        """
        tasks = self.task_repo.get_daily_tasks(user_id)

        # Convert to response format
        task_responses = []
        for task in tasks:
            task_responses.append(TaskResponse.model_validate(task))

        return task_responses

    def update_task(self, task_id: int, user_id: str, task_data: TaskUpdate) -> Task:
        """Update a task.

        Args:
            task_id: Task ID to update
            user_id: User ID who owns the task
            task_data: Updated task data

        Returns:
            Updated task

        Raises:
            HTTPException: If task not found
        """
        task = self.get_task(task_id, user_id)

        # Update fields if provided
        if task_data.description is not None:
            task.description = task_data.description

        if task_data.priority is not None:
            task.priority = task_data.priority

        if task_data.tags is not None:
            # Tags come as a comma-separated string from frontend, store as-is
            task.tags = task_data.tags

        if task_data.due_date is not None:
            task.due_date = task_data.due_date

        if task_data.is_daily is not None:
            task.is_daily = task_data.is_daily

        if task_data.is_completed is not None:
            task.is_completed = task_data.is_completed

        return self.task_repo.update(task)

    def complete_task(self, task_id: int, user_id: str) -> Task:
        """Toggle task completion status.

        Args:
            task_id: Task ID to toggle
            user_id: User ID who owns the task

        Returns:
            Updated task

        Raises:
            HTTPException: If task not found
        """
        task = self.get_task(task_id, user_id)
        task.is_completed = not task.is_completed
        return self.task_repo.update(task)

    def delete_task(self, task_id: int, user_id: str) -> bool:
        """Delete a task.

        Args:
            task_id: Task ID to delete
            user_id: User ID who owns the task

        Returns:
            True if deleted

        Raises:
            HTTPException: If task not found
        """
        deleted = self.task_repo.delete(task_id, user_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found",
            )
        return True
