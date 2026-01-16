"""User domain model for authentication."""
from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field


# DEPRECATED: This model is no longer used. User authentication is handled by Better Auth.
# Keeping this file for reference but marking table=False to prevent auto-creation.
class User(SQLModel, table=False):
    """User model for authentication (DEPRECATED - use Better Auth instead)."""

    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str
    full_name: Optional[str] = Field(default=None)
    profile_picture_url: Optional[str] = Field(default=None)
    is_active: bool = Field(default=True, index=True)
    password_reset_token: Optional[str] = Field(default=None)
    password_reset_expires: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def to_dict(self) -> dict:
        """Convert to dictionary representation."""
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "full_name": self.full_name,
            "profile_picture_url": self.profile_picture_url,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
