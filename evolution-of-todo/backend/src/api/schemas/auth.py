"""Authentication API schemas for request/response validation."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    """Schema for user registration."""

    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=100)
    full_name: Optional[str] = Field(None, max_length=100)


class UserLogin(BaseModel):
    """Schema for user login."""

    username: str
    password: str


class UserUpdate(BaseModel):
    """Schema for updating user profile."""

    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    full_name: Optional[str] = Field(None, max_length=100)
    password: Optional[str] = Field(None, min_length=8, max_length=100)


class UserResponse(BaseModel):
    """Schema for user response."""

    id: int
    email: str
    username: str
    full_name: Optional[str]
    profile_picture_url: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic config."""

        from_attributes = True


class TokenResponse(BaseModel):
    """Schema for authentication token response."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class UserStatsResponse(BaseModel):
    """Schema for user statistics response."""

    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    completion_rate: float
    most_productive_day: Optional[str]


class AvatarUploadRequest(BaseModel):
    """Schema for avatar upload request."""

    image_data: str = Field(..., description="Base64 encoded image data URL")
