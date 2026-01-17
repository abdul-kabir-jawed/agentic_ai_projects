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
    weekly_completion_rate: float = 0.0
    high_priority_pending: int = 0
    overdue_tasks: int = 0
    tasks_due_this_week: int = 0
    most_productive_day: Optional[str] = None


class AvatarUploadRequest(BaseModel):
    """Schema for avatar upload request."""

    image_data: str = Field(..., description="Base64 encoded image data URL")


class PasswordResetRequest(BaseModel):
    """Schema for password reset request."""

    email: EmailStr = Field(..., description="Email address to reset password for")


class PasswordResetVerify(BaseModel):
    """Schema for password reset code verification."""

    email: EmailStr = Field(..., description="Email address")
    code: str = Field(..., min_length=6, max_length=6, description="6-digit reset code")


class PasswordResetComplete(BaseModel):
    """Schema for completing password reset."""

    email: EmailStr = Field(..., description="Email address")
    code: str = Field(..., min_length=6, max_length=6, description="6-digit reset code")
    new_password: str = Field(..., min_length=8, max_length=100, description="New password")


class PasswordResetResponse(BaseModel):
    """Schema for password reset response."""

    message: str
    email: str


class UserSync(BaseModel):
    """Schema for syncing user from Better Auth."""

    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=100)
    full_name: Optional[str] = Field(None, max_length=100)


class ProfileSync(BaseModel):
    """Schema for syncing profile data after Better Auth registration."""

    username: str = Field(..., min_length=3, max_length=50)
    full_name: Optional[str] = Field(None, max_length=100)


class BetterAuthUserResponse(BaseModel):
    """Schema for Better Auth user response (simplified)."""

    id: str  # Better Auth uses string UUIDs
    email: str
    name: Optional[str] = None
    username: Optional[str] = None
    profile_picture_url: Optional[str] = None
    is_active: bool = True
    has_api_keys: bool = False  # Whether user has API keys configured
    created_at: Optional[datetime] = None  # User creation date
    updated_at: Optional[datetime] = None  # User update date

    class Config:
        """Pydantic config."""
        from_attributes = True


# ============ API KEY SCHEMAS ============

class ApiKeyUpdateRequest(BaseModel):
    """Schema for updating API keys."""

    gemini_api_key: Optional[str] = Field(None, description="Gemini API key (optional)")
    openai_api_key: Optional[str] = Field(None, description="OpenAI API key (optional)")


class ApiKeyStatusResponse(BaseModel):
    """Schema for API key status response (doesn't expose actual keys)."""

    gemini_configured: bool = False
    openai_configured: bool = False
    has_any: bool = False
    updated_at: Optional[str] = None


class ApiKeyDeleteResponse(BaseModel):
    """Schema for API key deletion response."""

    message: str
    deleted: bool
