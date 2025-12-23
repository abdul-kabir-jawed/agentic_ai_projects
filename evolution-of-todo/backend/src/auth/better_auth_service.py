"""Better Auth service for managing sessions with Neon PostgreSQL."""

import os
from datetime import datetime, timedelta
from typing import Optional
from sqlmodel import Session, select
from dotenv import load_dotenv

from src.models.better_auth import BetterAuthUser, BetterAuthSession
from src.auth.better_auth_config import BetterAuthConfig

# Load environment variables
load_dotenv()


class BetterAuthService:
    """Service for managing Better Auth authentication with Neon."""

    def __init__(self, db_session: Session):
        """Initialize Better Auth service.

        Args:
            db_session: SQLModel database session
        """
        self.db_session = db_session
        self.config = BetterAuthConfig()

    def create_user(
        self,
        email: str,
        name: Optional[str] = None,
        image: Optional[str] = None,
    ) -> BetterAuthUser:
        """Create a new user in Better Auth schema.

        Args:
            email: User email
            name: User name (optional)
            image: User avatar image URL (optional)

        Returns:
            Created BetterAuthUser

        Raises:
            ValueError: If email already exists
        """
        # Check if user exists
        existing = self.db_session.exec(
            select(BetterAuthUser).where(BetterAuthUser.email == email)
        ).first()

        if existing:
            raise ValueError(f"User with email {email} already exists")

        # Generate UUID for user (in production, use proper UUID generation)
        import uuid
        user_id = str(uuid.uuid4())

        user = BetterAuthUser(
            id=user_id,
            email=email,
            name=name,
            image=image,
            emailVerified=False,
            createdAt=datetime.utcnow(),
            updatedAt=datetime.utcnow(),
        )

        self.db_session.add(user)
        self.db_session.commit()
        self.db_session.refresh(user)

        return user

    def get_user(self, user_id: str) -> Optional[BetterAuthUser]:
        """Get user by ID.

        Args:
            user_id: User ID

        Returns:
            BetterAuthUser or None
        """
        return self.db_session.exec(
            select(BetterAuthUser).where(BetterAuthUser.id == user_id)
        ).first()

    def get_user_by_email(self, email: str) -> Optional[BetterAuthUser]:
        """Get user by email.

        Args:
            email: User email

        Returns:
            BetterAuthUser or None
        """
        return self.db_session.exec(
            select(BetterAuthUser).where(BetterAuthUser.email == email)
        ).first()

    def create_session(
        self,
        user_id: str,
        token: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> BetterAuthSession:
        """Create a new session.

        Args:
            user_id: User ID
            token: Session token
            ip_address: IP address of the client (optional)
            user_agent: User agent string (optional)

        Returns:
            Created BetterAuthSession
        """
        import uuid
        session_id = str(uuid.uuid4())
        expires_at = datetime.utcnow() + timedelta(seconds=self.config.SESSION_EXPIRES_IN)

        session = BetterAuthSession(
            id=session_id,
            userId=user_id,
            token=token,
            expiresAt=expires_at,
            createdAt=datetime.utcnow(),
            updatedAt=datetime.utcnow(),
            ipAddress=ip_address,
            userAgent=user_agent,
        )

        self.db_session.add(session)
        self.db_session.commit()
        self.db_session.refresh(session)

        return session

    def get_session(self, token: str) -> Optional[BetterAuthSession]:
        """Get session by token.

        Args:
            token: Session token

        Returns:
            BetterAuthSession or None if expired/invalid
        """
        session = self.db_session.exec(
            select(BetterAuthSession).where(BetterAuthSession.token == token)
        ).first()

        if not session:
            return None

        # Check if session is expired
        if session.expiresAt < datetime.utcnow():
            self.delete_session(session.id)
            return None

        return session

    def get_session_by_id(self, session_id: str) -> Optional[BetterAuthSession]:
        """Get session by ID.

        Args:
            session_id: Session ID

        Returns:
            BetterAuthSession or None
        """
        return self.db_session.exec(
            select(BetterAuthSession).where(BetterAuthSession.id == session_id)
        ).first()

    def delete_session(self, session_id: str) -> bool:
        """Delete a session.

        Args:
            session_id: Session ID

        Returns:
            True if deleted, False if not found
        """
        session = self.get_session_by_id(session_id)
        if not session:
            return False

        self.db_session.delete(session)
        self.db_session.commit()

        return True

    def delete_all_user_sessions(self, user_id: str) -> int:
        """Delete all sessions for a user.

        Args:
            user_id: User ID

        Returns:
            Number of sessions deleted
        """
        sessions = self.db_session.exec(
            select(BetterAuthSession).where(BetterAuthSession.userId == user_id)
        ).all()

        for session in sessions:
            self.db_session.delete(session)

        self.db_session.commit()

        return len(sessions)

    def update_session_activity(self, session_id: str) -> Optional[BetterAuthSession]:
        """Update session's last activity timestamp.

        Args:
            session_id: Session ID

        Returns:
            Updated BetterAuthSession or None
        """
        session = self.get_session_by_id(session_id)
        if not session:
            return None

        session.updatedAt = datetime.utcnow()
        self.db_session.add(session)
        self.db_session.commit()
        self.db_session.refresh(session)

        return session

    def cleanup_expired_sessions(self) -> int:
        """Delete all expired sessions.

        Returns:
            Number of sessions deleted
        """
        expired_sessions = self.db_session.exec(
            select(BetterAuthSession).where(
                BetterAuthSession.expiresAt < datetime.utcnow()
            )
        ).all()

        for session in expired_sessions:
            self.db_session.delete(session)

        self.db_session.commit()

        return len(expired_sessions)
