"""UserData domain model - consolidated user data storage.

This model stores all user-specific data in a single row:
- Tasks as JSONB array
- AI chat messages as JSONB array (max 10, FIFO)
- Encrypted API keys as JSONB object
"""
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
import uuid


def get_utc_now() -> datetime:
    """Get current UTC time with timezone info."""
    return datetime.now(timezone.utc)


def generate_task_id() -> str:
    """Generate a unique task ID."""
    return str(uuid.uuid4())[:8]


class TaskItem:
    """Task item structure for JSONB storage."""

    @staticmethod
    def create(
        description: str,
        priority: str = "medium",
        tags: Optional[str] = None,
        due_date: Optional[str] = None,
        is_daily: bool = False,
    ) -> Dict[str, Any]:
        """Create a new task item.

        Args:
            description: Task description
            priority: Priority level (low, medium, high)
            tags: Comma-separated tags
            due_date: ISO format due date
            is_daily: Whether task is a daily task

        Returns:
            Task dictionary
        """
        now = get_utc_now().isoformat()
        return {
            "id": generate_task_id(),
            "description": description,
            "priority": priority,
            "tags": tags,
            "due_date": due_date,
            "is_completed": False,
            "is_daily": is_daily,
            "created_at": now,
            "updated_at": now,
        }


class ChatItem:
    """Chat message item structure for JSONB storage."""

    @staticmethod
    def create(role: str, content: str) -> Dict[str, Any]:
        """Create a new chat message item.

        Args:
            role: Message role (user or assistant)
            content: Message content

        Returns:
            Chat message dictionary
        """
        return {
            "role": role,
            "content": content,
            "created_at": get_utc_now().isoformat(),
        }


class ApiKeysItem:
    """API keys structure for JSONB storage."""

    @staticmethod
    def create(
        gemini_key: Optional[str] = None,
        openai_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create API keys object.

        Args:
            gemini_key: Encrypted Gemini API key
            openai_key: Encrypted OpenAI API key

        Returns:
            API keys dictionary
        """
        return {
            "gemini": gemini_key or "",
            "openai": openai_key or "",
            "updated_at": get_utc_now().isoformat(),
        }


class UserData(SQLModel, table=True):
    """UserData model - consolidated user data storage.

    Stores all user-specific data in a single row linked to neon_auth.user.
    """

    __tablename__ = "user_data"

    id: Optional[int] = Field(default=None, primary_key=True)

    # Link to neon_auth.user (Better Auth user ID - string UUID)
    user_id: str = Field(unique=True, index=True)

    # User info (cached from neon_auth for convenience)
    email: str = Field(index=True)
    name: Optional[str] = Field(default=None)  # Full name
    username: Optional[str] = Field(default=None, index=True)  # Username (handle)
    profile_picture_url: Optional[str] = Field(default=None)  # Base64 encoded image or URL

    # Tasks stored as JSONB array
    # Each task: {id, description, priority, tags, due_date, is_completed, is_daily, created_at, updated_at}
    tasks: List[Dict[str, Any]] = Field(
        default_factory=list,
        sa_column=Column(JSON, nullable=False, server_default="[]"),
    )

    # AI chat messages stored as JSONB array (max 10 messages, FIFO)
    # Each message: {role, content, created_at}
    ai_chats: List[Dict[str, Any]] = Field(
        default_factory=list,
        sa_column=Column(JSON, nullable=False, server_default="[]"),
    )

    # Encrypted API keys stored as JSONB object
    # Structure: {gemini: "encrypted_key", openai: "encrypted_key", updated_at: "iso_date"}
    api_keys: Dict[str, Any] = Field(
        default_factory=lambda: ApiKeysItem.create(),
        sa_column=Column(JSON, nullable=False, server_default='{"gemini":"","openai":"","updated_at":""}'),
    )

    # Timestamps
    created_at: datetime = Field(default_factory=get_utc_now, index=True)
    updated_at: datetime = Field(default_factory=get_utc_now)

    def add_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Add a new task.

        Args:
            task: Task dictionary

        Returns:
            The added task
        """
        self.tasks.append(task)
        self.updated_at = get_utc_now()
        return task

    def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get a task by ID.

        Args:
            task_id: Task ID

        Returns:
            Task dictionary or None
        """
        for task in self.tasks:
            if task.get("id") == task_id:
                return task
        return None

    def update_task(self, task_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a task by ID.

        Args:
            task_id: Task ID
            updates: Dictionary of fields to update

        Returns:
            Updated task or None
        """
        for i, task in enumerate(self.tasks):
            if task.get("id") == task_id:
                task.update(updates)
                task["updated_at"] = get_utc_now().isoformat()
                self.tasks[i] = task
                self.updated_at = get_utc_now()
                return task
        return None

    def delete_task(self, task_id: str) -> bool:
        """Delete a task by ID.

        Args:
            task_id: Task ID

        Returns:
            True if deleted, False if not found
        """
        for i, task in enumerate(self.tasks):
            if task.get("id") == task_id:
                self.tasks.pop(i)
                self.updated_at = get_utc_now()
                return True
        return False

    def add_chat_message(self, role: str, content: str) -> Dict[str, Any]:
        """Add a chat message with FIFO limit of 10.

        Args:
            role: Message role (user or assistant)
            content: Message content

        Returns:
            The added message
        """
        message = ChatItem.create(role, content)
        self.ai_chats.append(message)

        # Keep only the last 10 messages (FIFO)
        if len(self.ai_chats) > 10:
            self.ai_chats = self.ai_chats[-10:]

        self.updated_at = get_utc_now()
        return message

    def clear_chat_history(self) -> int:
        """Clear all chat messages.

        Returns:
            Number of messages cleared
        """
        count = len(self.ai_chats)
        self.ai_chats = []
        self.updated_at = get_utc_now()
        return count

    def has_api_keys(self) -> bool:
        """Check if user has any API keys configured.

        Returns:
            True if at least one API key is set (non-empty string)
        """
        if not self.api_keys:
            return False
        gemini = self.api_keys.get("gemini", "").strip() if self.api_keys.get("gemini") else ""
        openai = self.api_keys.get("openai", "").strip() if self.api_keys.get("openai") else ""
        return bool(gemini or openai)

    def get_task_stats(self) -> Dict[str, Any]:
        """Get task statistics.

        Returns:
            Dictionary with task statistics
        """
        from datetime import datetime, timedelta
        
        total = len(self.tasks)
        completed = sum(1 for t in self.tasks if t.get("is_completed", False))
        pending = total - completed
        completion_rate = (completed / total * 100) if total > 0 else 0.0

        # Calculate weekly completion rate (tasks completed in last 7 days)
        now = datetime.now(timezone.utc)
        week_ago = now - timedelta(days=7)
        
        weekly_completed = 0
        weekly_total = 0
        
        for task in self.tasks:
            # Check if task was updated in the last week
            updated_at_str = task.get("updated_at")
            if updated_at_str:
                try:
                    if isinstance(updated_at_str, str):
                        updated_at = datetime.fromisoformat(updated_at_str.replace('Z', '+00:00'))
                    else:
                        updated_at = updated_at_str
                    
                    if updated_at >= week_ago:
                        weekly_total += 1
                        if task.get("is_completed", False):
                            weekly_completed += 1
                except (ValueError, AttributeError):
                    pass
        
        weekly_completion_rate = (weekly_completed / weekly_total * 100) if weekly_total > 0 else 0.0

        # Calculate high priority pending tasks
        high_priority_pending = sum(
            1 for task in self.tasks 
            if not task.get("is_completed", False) and task.get("priority") == "high"
        )

        # Calculate overdue tasks (tasks with due_date in the past that are not completed)
        overdue_tasks = 0
        for task in self.tasks:
            if not task.get("is_completed", False):
                due_date_str = task.get("due_date")
                if due_date_str:
                    try:
                        if isinstance(due_date_str, str):
                            # Parse and ensure timezone-aware
                            try:
                                # Try parsing with timezone first
                                due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00'))
                            except ValueError:
                                # If that fails, try without timezone and add UTC
                                due_date = datetime.fromisoformat(due_date_str)
                                due_date = due_date.replace(tzinfo=timezone.utc)
                            # Ensure timezone-aware
                            if due_date.tzinfo is None:
                                due_date = due_date.replace(tzinfo=timezone.utc)
                        else:
                            due_date = due_date_str
                            # Ensure timezone-aware
                            if hasattr(due_date, 'tzinfo') and due_date.tzinfo is None:
                                due_date = due_date.replace(tzinfo=timezone.utc)
                        
                        # Ensure both are timezone-aware for comparison (now is already aware from get_utc_now)
                        if due_date.tzinfo is None:
                            due_date = due_date.replace(tzinfo=timezone.utc)
                        
                        if due_date < now:
                            overdue_tasks += 1
                    except (ValueError, AttributeError, TypeError) as e:
                        # Skip invalid dates
                        pass

        # Calculate tasks due this week
        week_end = now + timedelta(days=7)
        tasks_due_this_week = 0
        for task in self.tasks:
            if not task.get("is_completed", False):
                due_date_str = task.get("due_date")
                if due_date_str:
                    try:
                        if isinstance(due_date_str, str):
                            # Parse and ensure timezone-aware
                            try:
                                # Try parsing with timezone first
                                due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00'))
                            except ValueError:
                                # If that fails, try without timezone and add UTC
                                due_date = datetime.fromisoformat(due_date_str)
                                due_date = due_date.replace(tzinfo=timezone.utc)
                            # Ensure timezone-aware
                            if due_date.tzinfo is None:
                                due_date = due_date.replace(tzinfo=timezone.utc)
                        else:
                            due_date = due_date_str
                            # Ensure timezone-aware
                            if hasattr(due_date, 'tzinfo') and due_date.tzinfo is None:
                                due_date = due_date.replace(tzinfo=timezone.utc)
                        
                        # Ensure timezone-aware for comparison (now and week_end are already aware)
                        if due_date.tzinfo is None:
                            due_date = due_date.replace(tzinfo=timezone.utc)
                        
                        if now <= due_date <= week_end:
                            tasks_due_this_week += 1
                    except (ValueError, AttributeError, TypeError) as e:
                        # Skip invalid dates
                        pass

        return {
            "total_tasks": total,
            "completed_tasks": completed,
            "pending_tasks": pending,
            "completion_rate": round(completion_rate, 2),
            "weekly_completion_rate": round(weekly_completion_rate, 2),
            "high_priority_pending": high_priority_pending,
            "overdue_tasks": overdue_tasks,
            "tasks_due_this_week": tasks_due_this_week,
        }

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "email": self.email,
            "name": self.name,
            "tasks_count": len(self.tasks),
            "chats_count": len(self.ai_chats),
            "has_api_keys": self.has_api_keys(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
