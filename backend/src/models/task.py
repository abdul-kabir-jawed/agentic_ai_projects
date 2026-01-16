"""Task domain model."""
from datetime import datetime, timezone
from typing import Optional

from sqlmodel import SQLModel, Field


def get_utc_now() -> datetime:
    """Get current UTC time with timezone info."""
    return datetime.now(timezone.utc)


# DEPRECATED: This model is no longer used. All tasks are stored in user_data.tasks JSONB column.
# Keeping this file for reference but marking table=False to prevent auto-creation.
class Task(SQLModel, table=False):
    """Task model for todo items (DEPRECATED - use UserData.tasks instead)."""

    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    # Better Auth user ID (string UUID)
    user_id: str = Field(index=True)
    description: str = Field(min_length=1, max_length=500)
    is_completed: bool = Field(default=False, index=True)
    priority: str = Field(default="medium", index=True)  # low, medium, high
    tags: Optional[str] = Field(default=None)  # JSON string array
    due_date: Optional[datetime] = Field(default=None, index=True)
    is_daily: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=get_utc_now, index=True)
    updated_at: datetime = Field(default_factory=get_utc_now)

    def to_dict(self) -> dict:
        """Convert to dictionary representation."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "description": self.description,
            "is_completed": self.is_completed,
            "priority": self.priority,
            "tags": self.tags,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "is_daily": self.is_daily,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
