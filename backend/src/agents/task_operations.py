"""
Real Task Operations for AI Agent

This module provides actual database CRUD operations for the task management agent.
It bridges the AI agent with the TaskService to perform real task operations.

BEST PRACTICES APPLIED:
- Comprehensive error handling with specific exceptions
- Logging for observability
- Input validation and sanitization
- Type safety with proper type hints
- Consistent response format
"""

from typing import Any, Dict, List, Optional
from datetime import datetime
import logging
from contextlib import contextmanager

from sqlmodel import Session

from src.repositories.user_data_repository import UserDataRepository

# Configure logger
logger = logging.getLogger(__name__)


class TaskOperationsError(Exception):
    """Base exception for task operations."""
    pass


class TaskNotFoundError(TaskOperationsError):
    """Raised when a task is not found."""
    pass


class TaskValidationError(TaskOperationsError):
    """Raised when task data validation fails."""
    pass


class TaskOperations:
    """
    Task operations that interact with the real database.

    This class is instantiated per-request with the user_id and db session.
    Follows best practices:
    - Single Responsibility: Only handles task CRUD operations
    - Proper error handling with custom exceptions
    - Comprehensive logging for debugging
    - Input validation
    """

    # Valid priority values
    VALID_PRIORITIES = {"low", "medium", "high"}
    
    # Date format patterns
    DATE_FORMATS = ["%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S.%fZ"]

    def __init__(self, session: Session, user_id: str):
        """Initialize with database session and user ID.

        Args:
            session: SQLModel database session
            user_id: Authenticated user's ID

        Raises:
            ValueError: If user_id is empty or invalid
        """
        if not user_id or not isinstance(user_id, str):
            raise ValueError("user_id must be a non-empty string")
            
        self.session = session
        self.user_id = user_id
        self.user_data_repo = UserDataRepository(session)
        
        logger.info(f"TaskOperations initialized for user: {user_id}")

    def _parse_due_date(self, due_date: Optional[str]) -> Optional[datetime]:
        """Parse due date string into datetime object.

        Args:
            due_date: Date string in various formats

        Returns:
            Parsed datetime or None if invalid/not provided
        """
        if not due_date:
            return None

        # Try ISO format with timezone
        for fmt in self.DATE_FORMATS:
            try:
                parsed = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
                logger.debug(f"Parsed due_date: {due_date} -> {parsed}")
                return parsed
            except (ValueError, AttributeError):
                continue
                
        # Try standard datetime formats
        for fmt in self.DATE_FORMATS:
            try:
                parsed = datetime.strptime(due_date, fmt)
                logger.debug(f"Parsed due_date: {due_date} -> {parsed}")
                return parsed
            except (ValueError, AttributeError):
                continue

        logger.warning(f"Could not parse due_date: {due_date}")
        return None

    def _validate_priority(self, priority: Optional[str]) -> str:
        """Validate and normalize priority value.

        Args:
            priority: Priority string to validate

        Returns:
            Normalized priority (lowercase)
        """
        if not priority:
            return "medium"
            
        normalized = priority.lower().strip()
        
        if normalized not in self.VALID_PRIORITIES:
            logger.warning(f"Invalid priority '{priority}', defaulting to 'medium'")
            return "medium"
            
        return normalized

    def _format_response(
        self, 
        success: bool, 
        message: str, 
        data: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None
    ) -> Dict[str, Any]:
        """Format standardized response.

        Args:
            success: Whether operation succeeded
            message: Human-readable message
            data: Optional data payload
            error: Optional error details

        Returns:
            Formatted response dictionary
        """
        response = {
            "success": success,
            "message": message,
        }
        
        if data:
            response.update(data)
            
        if error:
            response["error"] = error
            
        return response

    def create_task(
        self,
        description: str,
        priority: str = "medium",
        due_date: Optional[str] = None,
        tags: Optional[str] = None,
        is_daily: bool = False,
    ) -> Dict[str, Any]:
        """Create a new task for the user.

        Args:
            description: Task description (required, non-empty)
            priority: Task priority (low, medium, high)
            due_date: Due date in ISO format
            tags: Comma-separated tags
            is_daily: Whether this is a daily recurring task

        Returns:
            Created task as dictionary with success status

        Raises:
            TaskValidationError: If validation fails
        """
        try:
            # Validate input
            if not description or not description.strip():
                raise TaskValidationError("Task description cannot be empty")

            description = description.strip()
            validated_priority = self._validate_priority(priority)

            # ============================================================
            # BACKUP DAILY DETECTION (defense-in-depth)
            # In case agent-level detection fails, catch it here too
            # ============================================================
            daily_keywords = [
                "daily", "every day", "everyday", "each day", "recurring",
                "every morning", "every night", "every evening", "day at"
            ]

            # Check due_date for daily keywords
            if due_date and not is_daily:
                due_date_lower = due_date.lower()
                if any(kw in due_date_lower for kw in daily_keywords):
                    logger.info(f"[BACKUP-DAILY] Detected from due_date: '{due_date}'")
                    is_daily = True
                    due_date = None  # Clear since it's a daily task

            # Check tags for daily indicator
            if tags and not is_daily:
                tags_lower = tags.lower()
                if "daily" in tags_lower or "recurring" in tags_lower:
                    logger.info(f"[BACKUP-DAILY] Detected from tags: '{tags}'")
                    is_daily = True

            # Check description for daily keywords
            if not is_daily:
                desc_lower = description.lower()
                if any(kw in desc_lower for kw in daily_keywords):
                    logger.info(f"[BACKUP-DAILY] Detected from description: '{description}'")
                    is_daily = True

            logger.info(f"[CREATE-TASK] Final is_daily={is_daily} for: '{description[:50]}'")
            # ============================================================

            parsed_due_date = self._parse_due_date(due_date)

            # Create task via UserDataRepository
            task = self.user_data_repo.create_task(
                user_id=self.user_id,
                email="",  # Will be fetched from user_data if needed
                description=description,
                priority=validated_priority,
                tags=tags.strip() if tags else None,
                due_date=due_date,  # Pass as string, repository will handle parsing
                is_daily=is_daily,
            )
            
            logger.info(
                f"Task created successfully - ID: {task.get('id')}, "
                f"User: {self.user_id}, Description: {description[:50]}"
            )

            return self._format_response(
                success=True,
                message=f"Task '{description}' created successfully!",
                data={"task": task}
            )

        except TaskValidationError as e:
            logger.error(f"Task validation failed: {str(e)}")
            return self._format_response(
                success=False,
                message=str(e),
                error="validation_error"
            )
            
        except Exception as e:
            logger.error(f"Failed to create task: {str(e)}", exc_info=True)
            return self._format_response(
                success=False,
                message=f"Could not create task: {str(e)}",
                error="creation_failed"
            )

    def list_tasks(
        self,
        is_completed: Optional[bool] = None,
        priority: Optional[str] = None,
        limit: int = 20,
    ) -> Dict[str, Any]:
        """List user's tasks with optional filtering.

        Args:
            is_completed: Filter by completion status
            priority: Filter by priority (low, medium, high)
            limit: Maximum number of tasks to return (max 100)

        Returns:
            List of tasks with metadata
        """
        try:
            # Validate and cap limit
            limit = min(max(1, limit), 100)
            
            # Validate priority if provided
            validated_priority = None
            if priority:
                validated_priority = self._validate_priority(priority)

            tasks, total = self.user_data_repo.get_tasks(
                user_id=self.user_id,
                skip=0,
                limit=limit,
                is_completed=is_completed,
                priority=validated_priority,
            )
            
            logger.info(
                f"Listed {len(tasks)} tasks for user {self.user_id} "
                f"(total: {total})"
            )

            return self._format_response(
                success=True,
                message=f"Found {total} task(s)",
                data={
                    "tasks": tasks,
                    "total": total,
                    "page": 1,
                    "page_size": limit
                }
            )

        except Exception as e:
            logger.error(f"Failed to list tasks: {str(e)}", exc_info=True)
            return self._format_response(
                success=False,
                message=f"Could not list tasks: {str(e)}",
                error="list_failed"
            )

    def complete_task(self, task_id: str) -> Dict[str, Any]:
        """Toggle task completion status.

        Args:
            task_id: ID of the task to complete (string UUID)

        Returns:
            Updated task with new status

        Raises:
            TaskNotFoundError: If task doesn't exist
        """
        try:
            # Get current task to check status
            task = self.user_data_repo.get_task(self.user_id, task_id)
            if not task:
                raise TaskNotFoundError(f"Task {task_id} not found")
            
            # Toggle completion status
            current_status = task.get("is_completed", False)
            new_status = not current_status
            
            # Update task
            updated_task = self.user_data_repo.update_task(
                self.user_id,
                task_id,
                {"is_completed": new_status}
            )
            
            if not updated_task:
                raise TaskNotFoundError(f"Task {task_id} not found")
            
            status = "completed" if updated_task.get("is_completed") else "uncompleted"
            
            logger.info(
                f"Task {task_id} marked as {status} by user {self.user_id}"
            )
            
            return self._format_response(
                success=True,
                message=f"Task marked as {status}!",
                data={"task": updated_task}
            )
            
        except TaskNotFoundError:
            raise
        except Exception as e:
            logger.error(f"Failed to complete task: {str(e)}", exc_info=True)
            return self._format_response(
                success=False,
                message=f"Could not complete task: {str(e)}",
                error="completion_failed"
            )

    def update_task(
        self,
        task_id_or_description: str,
        description: Optional[str] = None,
        priority: Optional[str] = None,
        due_date: Optional[str] = None,
        tags: Optional[str] = None,
        is_daily: Optional[bool] = None,
    ) -> Dict[str, Any]:
        """Update an existing task by ID or description.

        Args:
            task_id_or_description: Task ID (UUID) or task description to find
            description: New description
            priority: New priority
            due_date: New due date (as string, will be parsed)
            tags: New tags
            is_daily: New daily status

        Returns:
            Updated task
        """
        try:
            # Try to find task by ID first, then by description
            task = self.user_data_repo.get_task(self.user_id, task_id_or_description)
            if not task:
                # Try finding by description
                task = self.user_data_repo.find_task_by_description(self.user_id, task_id_or_description)
                if not task:
                    raise TaskNotFoundError(f"Task '{task_id_or_description}' not found")
            
            task_id = task.get("id")
            if not task_id:
                raise TaskNotFoundError(f"Task '{task_id_or_description}' has no ID")
            
            # Build update data - only include provided fields
            update_data = {}
            
            if description is not None:
                description = description.strip()
                if not description:
                    raise TaskValidationError("Description cannot be empty")
                update_data["description"] = description
                
            if priority is not None:
                update_data["priority"] = self._validate_priority(priority)
                
            if due_date is not None:
                # Keep as string, repository will handle it
                update_data["due_date"] = due_date
                
            if tags is not None:
                update_data["tags"] = tags.strip() if tags else None
                
            if is_daily is not None:
                update_data["is_daily"] = is_daily

            if not update_data:
                raise TaskValidationError("No fields to update")

            updated_task = self.user_data_repo.update_task(self.user_id, task_id, update_data)
            
            if not updated_task:
                raise TaskNotFoundError(f"Task {task_id} not found")
            
            logger.info(f"Task {task_id} updated by user {self.user_id}")
            
            return self._format_response(
                success=True,
                message="Task updated successfully!",
                data={"task": updated_task}
            )
            
        except (TaskValidationError, TaskNotFoundError) as e:
            logger.error(f"Task update failed: {str(e)}")
            return self._format_response(
                success=False,
                message=str(e),
                error="validation_error"
            )
            
        except Exception as e:
            logger.error(f"Failed to update task: {str(e)}", exc_info=True)
            return self._format_response(
                success=False,
                message=f"Could not update task: {str(e)}",
                error="update_failed"
            )

    def delete_task(self, task_id_or_description: str) -> Dict[str, Any]:
        """Delete a task by ID or description.

        Args:
            task_id_or_description: Task ID (UUID) or task description to find and delete

        Returns:
            Deletion result
        """
        try:
            # Try to find task by ID first, then by description
            task = self.user_data_repo.get_task(self.user_id, task_id_or_description)
            if not task:
                # Try finding by description
                task = self.user_data_repo.find_task_by_description(self.user_id, task_id_or_description)
                if not task:
                    raise TaskNotFoundError(f"Task '{task_id_or_description}' not found")
            
            task_id = task.get("id")
            if not task_id:
                raise TaskNotFoundError(f"Task '{task_id_or_description}' has no ID")
            
            deleted = self.user_data_repo.delete_task(self.user_id, task_id)
            
            if not deleted:
                raise TaskNotFoundError(f"Task {task_id} not found")
            
            logger.info(f"Task {task_id} ('{task.get('description', '')}') deleted by user {self.user_id}")
            
            return self._format_response(
                success=True,
                message=f"Task '{task.get('description', task_id)}' deleted successfully!",
                data={"task_id": task_id}
            )
            
        except TaskNotFoundError as e:
            logger.error(f"Task not found: {task_id_or_description}")
            return self._format_response(
                success=False,
                message=str(e),
                error="task_not_found"
            )
        except Exception as e:
            logger.error(f"Failed to delete task: {str(e)}", exc_info=True)
            return self._format_response(
                success=False,
                message=f"Could not delete task: {str(e)}",
                error="deletion_failed"
            )

    def get_stats(self) -> Dict[str, Any]:
        """Get task statistics for the user.

        Returns:
            Task statistics including completion rate
        """
        try:
            stats = self.user_data_repo.get_task_stats(self.user_id)
            
            logger.info(f"Retrieved stats for user {self.user_id}: {stats}")

            return self._format_response(
                success=True,
                message=(
                    f"You have {stats['total_tasks']} total tasks with "
                    f"{stats['completion_rate']}% completion rate"
                ),
                data={"stats": stats}
            )
            
        except Exception as e:
            logger.error(f"Failed to get stats: {str(e)}", exc_info=True)
            return self._format_response(
                success=False,
                message=f"Could not retrieve statistics: {str(e)}",
                error="stats_failed"
            )

    def get_daily_tasks(self) -> Dict[str, Any]:
        """Get all daily tasks for the user.

        Returns:
            List of daily recurring tasks
        """
        try:
            tasks = self.user_data_repo.get_daily_tasks(self.user_id)
            
            logger.info(f"Retrieved {len(tasks)} daily tasks for user {self.user_id}")

            return self._format_response(
                success=True,
                message=f"Found {len(tasks)} daily task(s)",
                data={
                    "tasks": tasks,
                    "total": len(tasks)
                }
            )
            
        except Exception as e:
            logger.error(f"Failed to get daily tasks: {str(e)}", exc_info=True)
            return self._format_response(
                success=False,
                message=f"Could not retrieve daily tasks: {str(e)}",
                error="daily_tasks_failed"
            )


# Thread-safe context variable for current request's task operations
from contextvars import ContextVar

_current_task_ops: ContextVar[Optional[TaskOperations]] = ContextVar(
    'current_task_ops', 
    default=None
)


def set_task_operations(ops: TaskOperations) -> None:
    """Set the current request's task operations instance (thread-safe).
    
    Args:
        ops: TaskOperations instance to set
    """
    _current_task_ops.set(ops)
    logger.debug(f"TaskOperations set for user: {ops.user_id}")


def get_task_operations() -> Optional[TaskOperations]:
    """Get the current request's task operations instance (thread-safe).
    
    Returns:
        Current TaskOperations instance or None
    """
    return _current_task_ops.get()


def clear_task_operations() -> None:
    """Clear the current request's task operations instance (thread-safe)."""
    _current_task_ops.set(None)
    logger.debug("TaskOperations cleared")


@contextmanager
def task_operations_context(session: Session, user_id: str):
    """Context manager for task operations.
    
    Args:
        session: Database session
        user_id: User ID
        
    Yields:
        TaskOperations instance
        
    Example:
        with task_operations_context(db_session, user_id) as task_ops:
            result = task_ops.create_task("My task")
    """
    ops = TaskOperations(session, user_id)
    set_task_operations(ops)
    try:
        yield ops
    finally:
        clear_task_operations()
        