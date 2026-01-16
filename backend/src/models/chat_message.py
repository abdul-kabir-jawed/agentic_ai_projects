"""ChatMessage domain model."""
from datetime import datetime
from typing import Optional, Literal

from sqlmodel import SQLModel, Field


class ChatMessage(SQLModel, table=True):
    """ChatMessage model for storing chat history."""

    __tablename__ = "chat_messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    # Better Auth user ID (string UUID)
    user_id: str = Field(index=True)
    role: str = Field(index=True)  # 'user' or 'assistant'
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    def to_dict(self) -> dict:
        """Convert to dictionary representation."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "role": self.role,
            "content": self.content,
            "created_at": self.created_at.isoformat(),
        }
