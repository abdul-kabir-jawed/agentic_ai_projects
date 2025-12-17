"""Task API schemas for request/response validation."""
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field, field_validator


class TaskBase(BaseModel):
    """Base task schema with common fields."""

    description: str = Field(..., min_length=1, max_length=500)
    priority: str = Field(default="medium", pattern="^(low|medium|high)$")
    tags: Optional[str] = None
    due_date: Optional[datetime] = None
    is_daily: bool = False


class TaskCreate(TaskBase):
    """Schema for creating a new task."""

    pass


class TaskUpdate(BaseModel):
    """Schema for updating an existing task."""

    description: Optional[str] = Field(None, min_length=1, max_length=500)
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$")
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None
    is_daily: Optional[bool] = None
    is_completed: Optional[bool] = None


class TaskResponse(TaskBase):
    """Schema for task response."""

    id: int
    user_id: int
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class TaskListResponse(BaseModel):
    """Schema for paginated task list response."""

    tasks: List[TaskResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class TaskStats(BaseModel):
    """Schema for task statistics."""

    total: int
    completed: int
    pending: int
    completion_rate: float
