"""User business logic service."""
import re
import base64
from typing import Optional
from datetime import datetime

from fastapi import HTTPException, status
from sqlmodel import Session

from src.models.user import User
from src.repositories.user_repository import UserRepository
from src.repositories.task_repository import TaskRepository
from src.services.password_service import hash_password, verify_password
from src.api.schemas.auth import (
    UserRegister,
    UserUpdate,
    UserStatsResponse,
)


class UserService:
    """Service for user business logic."""

    def __init__(self, session: Session):
        """Initialize service with database session.

        Args:
            session: SQLModel database session
        """
        self.session = session
        self.user_repo = UserRepository(session)
        self.task_repo = TaskRepository(session)

    def register_user(self, user_data: UserRegister) -> User:
        """Register a new user.

        Args:
            user_data: User registration data

        Returns:
            Created user

        Raises:
            HTTPException: If email or username already exists
        """
        # Check if email already exists
        if self.user_repo.get_by_email(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        # Check if username already exists
        if self.user_repo.get_by_username(user_data.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken",
            )

        # Create new user
        user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=hash_password(user_data.password),
            full_name=user_data.full_name,
        )

        return self.user_repo.create(user)

    def authenticate_user(self, username: str, password: str) -> Optional[User]:
        """Authenticate user with username and password.

        Args:
            username: Username or email
            password: Plain text password

        Returns:
            User if authenticated, None otherwise
        """
        # Try to get user by username first, then by email
        user = self.user_repo.get_by_username(username)
        if not user:
            user = self.user_repo.get_by_email(username)

        if not user:
            return None

        if not verify_password(password, user.hashed_password):
            return None

        return user

    def update_user(self, user_id: int, user_data: UserUpdate) -> User:
        """Update user profile.

        Args:
            user_id: User ID to update
            user_data: Updated user data

        Returns:
            Updated user

        Raises:
            HTTPException: If user not found or email/username conflict
        """
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        # Check email uniqueness if being updated
        if user_data.email and user_data.email != user.email:
            existing = self.user_repo.get_by_email(user_data.email)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered",
                )
            user.email = user_data.email

        # Check username uniqueness if being updated
        if user_data.username and user_data.username != user.username:
            existing = self.user_repo.get_by_username(user_data.username)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken",
                )
            user.username = user_data.username

        # Update full name if provided
        if user_data.full_name is not None:
            user.full_name = user_data.full_name

        # Update password if provided
        if user_data.password:
            user.hashed_password = hash_password(user_data.password)

        return self.user_repo.update(user)

    def get_user_stats(self, user_id: int) -> UserStatsResponse:
        """Get user task statistics.

        Args:
            user_id: User ID to get stats for

        Returns:
            User statistics including most productive day
        """
        stats = self.task_repo.get_user_stats(user_id)
        most_productive_day = self.task_repo.get_most_productive_day(user_id)

        return UserStatsResponse(
            total_tasks=stats["total"],
            completed_tasks=stats["completed"],
            pending_tasks=stats["pending"],
            completion_rate=stats["completion_rate"],
            most_productive_day=most_productive_day,
        )

    def upload_avatar(self, user_id: int, image_data: str) -> User:
        """Upload user avatar from base64 data URL.

        Args:
            user_id: User ID to update avatar
            image_data: Base64 encoded image data URL

        Returns:
            Updated user

        Raises:
            HTTPException: If user not found or invalid image data
        """
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        # Validate data URL format (data:image/xxx;base64,...)
        if not image_data.startswith("data:image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image data format. Must be a data URL starting with 'data:image/'",
            )

        # Validate it contains base64 marker
        if ";base64," not in image_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image data format. Must contain ';base64,' marker",
            )

        # Extract and validate base64 data
        try:
            # Get the base64 part after the comma
            base64_data = image_data.split(",", 1)[1]
            # Try to decode to validate it's proper base64
            base64.b64decode(base64_data)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid base64 image data",
            )

        # Update profile picture URL
        user.profile_picture_url = image_data
        return self.user_repo.update(user)

    def delete_avatar(self, user_id: int) -> User:
        """Delete user avatar.

        Args:
            user_id: User ID to delete avatar

        Returns:
            Updated user

        Raises:
            HTTPException: If user not found
        """
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        user.profile_picture_url = None
        return self.user_repo.update(user)
