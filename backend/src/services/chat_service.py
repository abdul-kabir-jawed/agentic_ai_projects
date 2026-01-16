"""Chat business logic service."""
from typing import List, Dict, Any
from datetime import datetime

from sqlmodel import Session

from src.models.chat_message import ChatMessage
from src.repositories.chat_repository import ChatRepository


class ChatService:
    """Service for chat business logic."""

    def __init__(self, session: Session):
        """Initialize service with database session.

        Args:
            session: SQLModel database session
        """
        self.session = session
        self.chat_repo = ChatRepository(session)

    def save_message(
        self,
        user_id: str,
        role: str,
        content: str,
    ) -> ChatMessage:
        """Save a chat message.

        Args:
            user_id: User ID who sent/received the message
            role: 'user' or 'assistant'
            content: Message content

        Returns:
            Created message
        """
        message = ChatMessage(
            user_id=user_id,
            role=role,
            content=content,
        )
        return self.chat_repo.create(message)

    def save_conversation(
        self,
        user_id: str,
        user_message: str,
        assistant_response: str,
    ) -> tuple[ChatMessage, ChatMessage]:
        """Save both user message and assistant response.

        Args:
            user_id: User ID
            user_message: User's message
            assistant_response: AI's response

        Returns:
            Tuple of (user_message, assistant_message)
        """
        user_msg = self.save_message(user_id, "user", user_message)
        assistant_msg = self.save_message(user_id, "assistant", assistant_response)
        return user_msg, assistant_msg

    def get_history(
        self,
        user_id: str,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        """Get chat history for a user.

        Args:
            user_id: User ID
            limit: Maximum messages to return

        Returns:
            List of message dictionaries
        """
        messages = self.chat_repo.get_user_history(user_id, limit=limit)
        return [msg.to_dict() for msg in messages]

    def get_context_messages(
        self,
        user_id: str,
        limit: int = 20,
    ) -> List[Dict[str, str]]:
        """Get recent messages formatted for AI context.

        Args:
            user_id: User ID
            limit: Maximum messages for context

        Returns:
            List of {role, content} dictionaries for AI
        """
        messages = self.chat_repo.get_recent_messages(user_id, limit=limit)
        return [{"role": msg.role, "content": msg.content} for msg in messages]

    def clear_history(self, user_id: str) -> Dict[str, Any]:
        """Clear all chat history for a user.

        Args:
            user_id: User ID

        Returns:
            Result with count of deleted messages
        """
        count = self.chat_repo.delete_user_history(user_id)
        return {"deleted": count, "message": f"Deleted {count} messages"}

    def get_message_count(self, user_id: str) -> int:
        """Get total message count for a user.

        Args:
            user_id: User ID

        Returns:
            Total message count
        """
        return self.chat_repo.count_user_messages(user_id)
