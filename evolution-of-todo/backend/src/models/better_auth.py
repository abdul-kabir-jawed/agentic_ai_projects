"""Better Auth models for session-based authentication."""
from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field


class BetterAuthUser(SQLModel, table=True):
    """User model matching Better Auth's user table schema."""

    __tablename__ = "user"

    id: str = Field(primary_key=True)  # Better Auth uses UUID strings
    email: str = Field(unique=True, index=True)
    name: Optional[str] = Field(default=None)
    image: Optional[str] = Field(default=None)
    emailVerified: bool = Field(default=False, alias="email_verified")
    createdAt: datetime = Field(default_factory=datetime.utcnow, alias="created_at")
    updatedAt: datetime = Field(default_factory=datetime.utcnow, alias="updated_at")

    class Config:
        # Allow both snake_case and camelCase
        populate_by_name = True

    def to_dict(self) -> dict:
        """Convert to dictionary representation."""
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "image": self.image,
            "emailVerified": self.emailVerified,
            "createdAt": self.createdAt.isoformat() if self.createdAt else None,
            "updatedAt": self.updatedAt.isoformat() if self.updatedAt else None,
        }


class BetterAuthSession(SQLModel, table=True):
    """Session model matching Better Auth's session table schema."""

    __tablename__ = "session"

    id: str = Field(primary_key=True)
    userId: str = Field(index=True, alias="user_id", foreign_key="user.id")
    token: str = Field(unique=True, index=True)
    expiresAt: datetime = Field(alias="expires_at")
    createdAt: datetime = Field(default_factory=datetime.utcnow, alias="created_at")
    updatedAt: datetime = Field(default_factory=datetime.utcnow, alias="updated_at")
    ipAddress: Optional[str] = Field(default=None, alias="ip_address")
    userAgent: Optional[str] = Field(default=None, alias="user_agent")

    class Config:
        populate_by_name = True
