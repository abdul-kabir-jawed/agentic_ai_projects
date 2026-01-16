"""Task repository for database operations."""
from typing import List, Optional, Dict
from datetime import datetime

from sqlmodel import Session, select, func, and_, or_

from src.models.task import Task


class TaskRepository:
    """Repository for Task CRUD operations."""

    def __init__(self, session: Session):
        """Initialize repository with database session.

        Args:
            session: SQLModel database session
        """
        self.session = session

    def create(self, task: Task) -> Task:
        """Create a new task.

        Args:
            task: Task instance to create

        Returns:
            Created task with ID
        """
        print(f"[TASK_REPO] Creating task for user_id: {task.user_id}, description: {task.description[:50]}...")
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)
        print(f"[TASK_REPO] Task created with ID: {task.id}")
        return task

    def get_by_id(self, task_id: int, user_id: int) -> Optional[Task]:
        """Get task by ID for a specific user.

        Args:
            task_id: Task ID to retrieve
            user_id: User ID who owns the task

        Returns:
            Task instance or None if not found
        """
        statement = select(Task).where(
            and_(Task.id == task_id, Task.user_id == user_id)
        )
        return self.session.exec(statement).first()

    def get_all_by_user(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 100,
        is_completed: Optional[bool] = None,
        priority: Optional[str] = None,
        search: Optional[str] = None,
    ) -> tuple[List[Task], int]:
        """Get all tasks for a user with optional filtering.

        Args:
            user_id: User ID to filter tasks
            skip: Number of records to skip (pagination)
            limit: Maximum number of records to return
            is_completed: Filter by completion status
            priority: Filter by priority level
            search: Search in task description

        Returns:
            Tuple of (tasks list, total count)
        """
        # Build base query
        conditions = [Task.user_id == user_id]

        if is_completed is not None:
            conditions.append(Task.is_completed == is_completed)

        if priority:
            conditions.append(Task.priority == priority)

        if search:
            conditions.append(Task.description.ilike(f"%{search}%"))

        # Count query
        count_statement = select(func.count(Task.id)).where(and_(*conditions))
        total = self.session.exec(count_statement).one()

        # Data query with pagination
        statement = (
            select(Task)
            .where(and_(*conditions))
            .order_by(Task.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        tasks = list(self.session.exec(statement).all())

        return tasks, total

    def get_daily_tasks(self, user_id: int) -> List[Task]:
        """Get all daily tasks for a user.

        Args:
            user_id: User ID to filter tasks

        Returns:
            List of daily tasks
        """
        statement = (
            select(Task)
            .where(and_(Task.user_id == user_id, Task.is_daily == True))
            .order_by(Task.created_at.desc())
        )
        return list(self.session.exec(statement).all())

    def update(self, task: Task) -> Task:
        """Update an existing task.

        Args:
            task: Task instance with updated fields

        Returns:
            Updated task
        """
        task.updated_at = datetime.utcnow()
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)
        return task

    def delete(self, task_id: int, user_id: int) -> bool:
        """Delete a task by ID for a specific user.

        Args:
            task_id: Task ID to delete
            user_id: User ID who owns the task

        Returns:
            True if deleted, False if not found
        """
        task = self.get_by_id(task_id, user_id)
        if task:
            self.session.delete(task)
            self.session.commit()
            return True
        return False

    def get_user_stats(self, user_id: int) -> Dict:
        """Get task statistics for a user.

        Args:
            user_id: User ID to get statistics for

        Returns:
            Dictionary with task statistics
        """
        # Total tasks
        total_statement = select(func.count(Task.id)).where(Task.user_id == user_id)
        total = self.session.exec(total_statement).one()

        # Completed tasks
        completed_statement = select(func.count(Task.id)).where(
            and_(Task.user_id == user_id, Task.is_completed == True)
        )
        completed = self.session.exec(completed_statement).one()

        # Pending tasks
        pending = total - completed

        # Completion rate
        completion_rate = (completed / total * 100) if total > 0 else 0.0

        return {
            "total": total,
            "completed": completed,
            "pending": pending,
            "completion_rate": round(completion_rate, 2),
        }

    def get_most_productive_day(self, user_id: int) -> Optional[str]:
        """Get the day of week when user completes most tasks.

        Args:
            user_id: User ID to analyze

        Returns:
            Day name or None if no completed tasks
        """
        # Get recent completed tasks (limit to last 100 for performance)
        statement = (
            select(Task.updated_at)
            .where(and_(Task.user_id == user_id, Task.is_completed == True))
            .order_by(Task.updated_at.desc())
            .limit(100)
        )
        results = self.session.exec(statement).all()

        if not results:
            return None

        # Count by day of week in Python (works with both SQLite and PostgreSQL)
        day_counts: dict[int, int] = {}
        for updated_at in results:
            if updated_at:
                day_num = updated_at.weekday()  # 0=Monday, 6=Sunday
                day_counts[day_num] = day_counts.get(day_num, 0) + 1

        if not day_counts:
            return None

        # Find most productive day
        most_productive = max(day_counts, key=day_counts.get)
        day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        return day_names[most_productive]
