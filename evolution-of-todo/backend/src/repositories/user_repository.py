"""User repository for database operations."""
from typing import Optional
from datetime import datetime

from sqlmodel import Session, select

from src.models.user import User


class UserRepository:
    """Repository for User CRUD operations."""

    def __init__(self, session: Session):
        """Initialize repository with database session.

        Args:
            session: SQLModel database session
        """
        self.session = session

    def create(self, user: User) -> User:
        """Create a new user.

        Args:
            user: User instance to create

        Returns:
            Created user with ID
        """
        print(f"[USER_REPO] Creating user: {user.email}")
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        print(f"[USER_REPO] User created with ID: {user.id}")
        return user

    def get_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID.

        Args:
            user_id: User ID to retrieve

        Returns:
            User instance or None if not found
        """
        return self.session.get(User, user_id)

    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email.

        Args:
            email: Email address to search for

        Returns:
            User instance or None if not found
        """
        statement = select(User).where(User.email == email)
        return self.session.exec(statement).first()

    def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username.

        Args:
            username: Username to search for

        Returns:
            User instance or None if not found
        """
        statement = select(User).where(User.username == username)
        return self.session.exec(statement).first()

    def update(self, user: User) -> User:
        """Update an existing user.

        Args:
            user: User instance with updated fields

        Returns:
            Updated user
        """
        user.updated_at = datetime.utcnow()
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user

    def delete(self, user_id: int) -> bool:
        """Delete a user by ID.

        Args:
            user_id: User ID to delete

        Returns:
            True if deleted, False if not found
        """
        user = self.get_by_id(user_id)
        if user:
            self.session.delete(user)
            self.session.commit()
            return True
        return False
