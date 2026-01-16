"""Chat repository for database operations."""
from typing import List, Optional
from datetime import datetime

from sqlmodel import Session, select, and_

from src.models.chat_message import ChatMessage


class ChatRepository:
    """Repository for ChatMessage CRUD operations."""

    def __init__(self, session: Session):
        """Initialize repository with database session.

        Args:
            session: SQLModel database session
        """
        self.session = session

    def create(self, message: ChatMessage) -> ChatMessage:
        """Create a new chat message.

        Args:
            message: ChatMessage instance to create

        Returns:
            Created message with ID
        """
        self.session.add(message)
        self.session.commit()
        self.session.refresh(message)
        return message

    def get_user_history(
        self,
        user_id: str,
        limit: int = 100,
        offset: int = 0,
    ) -> List[ChatMessage]:
        """Get chat history for a user.

        Args:
            user_id: User ID to filter messages
            limit: Maximum number of messages to return
            offset: Number of messages to skip

        Returns:
            List of chat messages ordered by created_at ascending
        """
        statement = (
            select(ChatMessage)
            .where(ChatMessage.user_id == user_id)
            .order_by(ChatMessage.created_at.asc())
            .offset(offset)
            .limit(limit)
        )
        return list(self.session.exec(statement).all())

    def get_recent_messages(
        self,
        user_id: str,
        limit: int = 50,
    ) -> List[ChatMessage]:
        """Get most recent messages for context.

        Args:
            user_id: User ID to filter messages
            limit: Maximum number of messages to return

        Returns:
            List of recent chat messages ordered by created_at ascending
        """
        # Get recent messages in descending order, then reverse
        statement = (
            select(ChatMessage)
            .where(ChatMessage.user_id == user_id)
            .order_by(ChatMessage.created_at.desc())
            .limit(limit)
        )
        messages = list(self.session.exec(statement).all())
        # Reverse to get chronological order
        return messages[::-1]

    def delete_user_history(self, user_id: str) -> int:
        """Delete all chat history for a user.

        Args:
            user_id: User ID whose history to delete

        Returns:
            Number of messages deleted
        """
        statement = select(ChatMessage).where(ChatMessage.user_id == user_id)
        messages = list(self.session.exec(statement).all())
        count = len(messages)

        for message in messages:
            self.session.delete(message)

        self.session.commit()
        return count

    def count_user_messages(self, user_id: str) -> int:
        """Count total messages for a user.

        Args:
            user_id: User ID to count messages for

        Returns:
            Total message count
        """
        statement = select(ChatMessage).where(ChatMessage.user_id == user_id)
        messages = list(self.session.exec(statement).all())
        return len(messages)
