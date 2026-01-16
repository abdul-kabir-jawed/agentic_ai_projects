"""
Session Manager with 10-Message Memory

Implements efficient session management that keeps only the last 10 messages
in memory for context window optimization.

BEST PRACTICES APPLIED:
- Trimming strategy for predictable memory usage
- Thread-safe operations with asyncio locks
- Configurable message limits
- Automatic cleanup of old messages
- Turn-based memory (preserves conversation flow)
"""

import asyncio
from collections import deque
from typing import Any, Dict, List, Optional, Deque
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class SessionMessage:
    """Represents a single message in the conversation."""
    
    def __init__(
        self, 
        role: str, 
        content: str, 
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Initialize a session message.
        
        Args:
            role: Message role (user, assistant, system, tool)
            content: Message content
            metadata: Optional metadata (timestamps, tool results, etc.)
        """
        self.role = role
        self.content = content
        self.metadata = metadata or {}
        self.timestamp = datetime.utcnow()
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary format for OpenAI API.
        
        Returns:
            Dictionary with role and content
        """
        return {
            "role": self.role,
            "content": self.content
        }
    
    def to_full_dict(self) -> Dict[str, Any]:
        """Convert to dictionary with metadata.
        
        Returns:
            Dictionary with role, content, and metadata
        """
        return {
            "role": self.role,
            "content": self.content,
            "metadata": self.metadata,
            "timestamp": self.timestamp.isoformat()
        }


class SessionManager:
    """
    Manages conversation sessions with automatic 10-message trimming.
    
    Uses a turn-based approach where a "turn" consists of:
    - User message
    - Assistant response (including any tool calls/results)
    
    Keeps only the last N turns to maintain context window efficiency.
    """
    
    def __init__(
        self, 
        session_id: str, 
        max_messages: int = 10,
        system_message: Optional[str] = None
    ):
        """Initialize session manager.
        
        Args:
            session_id: Unique session identifier
            max_messages: Maximum messages to keep (default: 10)
            system_message: Optional system message (not counted in limit)
        """
        self.session_id = session_id
        self.max_messages = max(2, max_messages)  # Minimum 2 for context
        self.system_message = system_message
        
        # Use deque for efficient append/pop operations
        self._messages: Deque[SessionMessage] = deque(maxlen=self.max_messages)
        self._lock = asyncio.Lock()
        
        logger.info(
            f"Session {session_id} initialized with max {max_messages} messages"
        )
    
    async def add_message(
        self, 
        role: str, 
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """Add a message to the session.
        
        Args:
            role: Message role (user, assistant, tool, etc.)
            content: Message content
            metadata: Optional metadata
        """
        async with self._lock:
            message = SessionMessage(role, content, metadata)
            self._messages.append(message)
            
            logger.debug(
                f"Session {self.session_id}: Added {role} message "
                f"(total: {len(self._messages)}/{self.max_messages})"
            )
    
    async def get_messages(
        self, 
        include_system: bool = True,
        format_for_api: bool = True
    ) -> List[Dict[str, Any]]:
        """Get conversation messages for API calls.
        
        Args:
            include_system: Include system message at the start
            format_for_api: Format for OpenAI API (True) or include metadata (False)
        
        Returns:
            List of message dictionaries
        """
        async with self._lock:
            messages = []
            
            # Add system message if provided and requested
            if include_system and self.system_message:
                messages.append({
                    "role": "system",
                    "content": self.system_message
                })
            
            # Add conversation messages
            for msg in self._messages:
                if format_for_api:
                    messages.append(msg.to_dict())
                else:
                    messages.append(msg.to_full_dict())
            
            return messages
    
    async def get_last_n_messages(self, n: int) -> List[Dict[str, Any]]:
        """Get the last N messages.
        
        Args:
            n: Number of recent messages to retrieve
        
        Returns:
            List of recent message dictionaries
        """
        async with self._lock:
            # Get last n messages from deque
            recent = list(self._messages)[-n:] if n > 0 else []
            return [msg.to_dict() for msg in recent]
    
    async def clear(self) -> None:
        """Clear all messages from the session."""
        async with self._lock:
            self._messages.clear()
            logger.info(f"Session {self.session_id}: Cleared all messages")
    
    async def get_message_count(self) -> int:
        """Get current message count.
        
        Returns:
            Number of messages in session
        """
        async with self._lock:
            return len(self._messages)
    
    async def update_system_message(self, system_message: str) -> None:
        """Update the system message.
        
        Args:
            system_message: New system message
        """
        async with self._lock:
            self.system_message = system_message
            logger.debug(f"Session {self.session_id}: System message updated")
    
    def get_info(self) -> Dict[str, Any]:
        """Get session information.
        
        Returns:
            Dictionary with session metadata
        """
        return {
            "session_id": self.session_id,
            "max_messages": self.max_messages,
            "current_count": len(self._messages),
            "has_system_message": bool(self.system_message)
        }


class SessionStore:
    """
    Manages multiple user sessions with automatic cleanup.
    
    Provides session pooling and lifecycle management for multi-user apps.
    """
    
    def __init__(self, default_max_messages: int = 10):
        """Initialize session store.
        
        Args:
            default_max_messages: Default max messages for new sessions
        """
        self._sessions: Dict[str, SessionManager] = {}
        self._lock = asyncio.Lock()
        self.default_max_messages = default_max_messages
        
        logger.info("SessionStore initialized")
    
    async def get_or_create_session(
        self,
        session_id: str,
        system_message: Optional[str] = None,
        max_messages: Optional[int] = None
    ) -> SessionManager:
        """Get existing session or create new one.
        
        Args:
            session_id: Unique session identifier
            system_message: Optional system message for new sessions
            max_messages: Optional max messages (uses default if not provided)
        
        Returns:
            SessionManager instance
        """
        async with self._lock:
            if session_id not in self._sessions:
                msg_limit = max_messages or self.default_max_messages
                self._sessions[session_id] = SessionManager(
                    session_id=session_id,
                    max_messages=msg_limit,
                    system_message=system_message
                )
                logger.info(f"Created new session: {session_id}")
            
            return self._sessions[session_id]
    
    async def get_session(self, session_id: str) -> Optional[SessionManager]:
        """Get existing session.
        
        Args:
            session_id: Session identifier
        
        Returns:
            SessionManager instance or None if not found
        """
        async with self._lock:
            return self._sessions.get(session_id)
    
    async def delete_session(self, session_id: str) -> bool:
        """Delete a session.
        
        Args:
            session_id: Session identifier
        
        Returns:
            True if session was deleted, False if not found
        """
        async with self._lock:
            if session_id in self._sessions:
                del self._sessions[session_id]
                logger.info(f"Deleted session: {session_id}")
                return True
            return False
    
    async def clear_all_sessions(self) -> int:
        """Clear all sessions.
        
        Returns:
            Number of sessions cleared
        """
        async with self._lock:
            count = len(self._sessions)
            self._sessions.clear()
            logger.info(f"Cleared {count} sessions")
            return count
    
    async def get_session_count(self) -> int:
        """Get total number of active sessions.
        
        Returns:
            Number of active sessions
        """
        async with self._lock:
            return len(self._sessions)
    
    async def get_all_session_ids(self) -> List[str]:
        """Get all active session IDs.
        
        Returns:
            List of session IDs
        """
        async with self._lock:
            return list(self._sessions.keys())


# Global session store instance
_session_store: Optional[SessionStore] = None


def get_session_store(max_messages: int = 10) -> SessionStore:
    """Get or create the global session store.
    
    Args:
        max_messages: Default max messages for sessions
    
    Returns:
        Global SessionStore instance
    """
    global _session_store
    
    if _session_store is None:
        _session_store = SessionStore(default_max_messages=max_messages)
    
    return _session_store


# Convenience functions for common operations

async def create_user_session(
    user_id: str,
    system_message: Optional[str] = None,
    max_messages: int = 10
) -> SessionManager:
    """Create or get a user session.
    
    Args:
        user_id: User identifier
        system_message: Optional system message
        max_messages: Maximum messages to keep
    
    Returns:
        SessionManager for the user
    """
    store = get_session_store(max_messages)
    return await store.get_or_create_session(
        session_id=user_id,
        system_message=system_message,
        max_messages=max_messages
    )


async def add_user_message(user_id: str, content: str) -> None:
    """Add a user message to their session.
    
    Args:
        user_id: User identifier
        content: Message content
    """
    session = await create_user_session(user_id)
    await session.add_message("user", content)


async def add_assistant_message(
    user_id: str, 
    content: str,
    metadata: Optional[Dict[str, Any]] = None
) -> None:
    """Add an assistant message to user's session.
    
    Args:
        user_id: User identifier
        content: Message content
        metadata: Optional metadata (tool calls, etc.)
    """
    session = await create_user_session(user_id)
    await session.add_message("assistant", content, metadata)


async def get_user_conversation(
    user_id: str,
    include_system: bool = True
) -> List[Dict[str, Any]]:
    """Get user's conversation history.
    
    Args:
        user_id: User identifier
        include_system: Include system message
    
    Returns:
        List of conversation messages
    """
    session = await create_user_session(user_id)
    return await session.get_messages(include_system=include_system)


async def clear_user_session(user_id: str) -> None:
    """Clear a user's session.
    
    Args:
        user_id: User identifier
    """
    store = get_session_store()
    await store.delete_session(user_id)

