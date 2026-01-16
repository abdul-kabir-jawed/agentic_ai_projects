"""Task domain model."""
from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field


class Task(SQLModel, table=True):
    """Task model for todo items."""

    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    description: str = Field(min_length=1, max_length=500)
    is_completed: bool = Field(default=False, index=True)
    priority: str = Field(default="medium", index=True)  # low, medium, high
    tags: Optional[str] = Field(default=None)  # JSON string array
    due_date: Optional[datetime] = Field(default=None, index=True)
    is_daily: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

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
