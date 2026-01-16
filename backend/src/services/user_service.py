"""User business logic service."""
import re
import base64
import random
import string
from typing import Optional
from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlmodel import Session

from src.models.user import User
from src.repositories.user_repository import UserRepository
from src.repositories.user_data_repository import UserDataRepository
from src.services.password_service import hash_password, verify_password
from src.api.schemas.auth import (
    UserRegister,
    UserUpdate,
    UserStatsResponse,
    PasswordResetRequest,
    PasswordResetVerify,
    PasswordResetComplete,
    UserSync,
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
        self.user_data_repo = UserDataRepository(session)

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

    def sync_user(self, user_data: UserSync) -> User:
        """Sync user from Better Auth - creates new user only.

        Args:
            user_data: User sync data from Better Auth

        Returns:
            Created user

        Raises:
            HTTPException: If user already exists
        """
        # Check if user exists by email
        existing_user = self.user_repo.get_by_email(user_data.email)

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already exists",
            )

        # Check if username exists
        if self.user_repo.get_by_username(user_data.username):
            # Username taken, generate unique one
            base_username = user_data.username
            counter = 1
            while self.user_repo.get_by_username(user_data.username):
                user_data.username = f"{base_username}{counter}"
                counter += 1

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

    def get_user_stats(self, user_id: str) -> UserStatsResponse:
        """Get user task statistics.

        Args:
            user_id: User ID to get stats for (string from Better Auth)

        Returns:
            User statistics including most productive day
        """
        stats = self.user_data_repo.get_task_stats(user_id)
        # For now, set most_productive_day to None (can be calculated later if needed)
        most_productive_day = None

        return UserStatsResponse(
            total_tasks=stats.get("total_tasks", 0),
            completed_tasks=stats.get("completed_tasks", 0),
            pending_tasks=stats.get("pending_tasks", 0),
            completion_rate=stats.get("completion_rate", 0.0),
            weekly_completion_rate=stats.get("weekly_completion_rate", 0.0),
            high_priority_pending=stats.get("high_priority_pending", 0),
            overdue_tasks=stats.get("overdue_tasks", 0),
            tasks_due_this_week=stats.get("tasks_due_this_week", 0),
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

    def request_password_reset(self, reset_request: PasswordResetRequest) -> str:
        """Request a password reset by sending code to email.

        Args:
            reset_request: Password reset request with email

        Returns:
            Reset token (code) for testing purposes

        Raises:
            HTTPException: If user not found
        """
        user = self.user_repo.get_by_email(reset_request.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        # Generate 6-digit reset code
        reset_code = "".join(random.choices(string.digits, k=6))

        # Store reset code and expiration (valid for 15 minutes)
        user.password_reset_token = reset_code
        user.password_reset_expires = datetime.utcnow() + timedelta(minutes=15)

        self.user_repo.update(user)

        # Send email with reset code using Brevo
        # Import here to avoid circular imports
        import asyncio
        from src.services.email_service import send_password_reset_code_email

        try:
            # Run the async email send function
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # If we're already in an async context, create a new task
                asyncio.create_task(send_password_reset_code_email(
                    email=reset_request.email,
                    name=user.full_name or user.username,
                    reset_code=reset_code,
                ))
            else:
                # If we're not in an async context, run synchronously
                asyncio.run(send_password_reset_code_email(
                    email=reset_request.email,
                    name=user.full_name or user.username,
                    reset_code=reset_code,
                ))
        except RuntimeError:
            # Fallback for sync context - just log for now
            print(f"[PASSWORD RESET] Code for {reset_request.email}: {reset_code}")
            print(f"[PASSWORD RESET] Email service not available in sync context")

        return reset_code

    def verify_reset_code(self, verify_request: PasswordResetVerify) -> bool:
        """Verify password reset code.

        Args:
            verify_request: Verification request with email and code

        Returns:
            True if code is valid

        Raises:
            HTTPException: If user not found or code invalid
        """
        user = self.user_repo.get_by_email(verify_request.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        if not user.password_reset_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No password reset request found. Please request a password reset first.",
            )

        if user.password_reset_token != verify_request.code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid reset code",
            )

        if user.password_reset_expires and datetime.utcnow() > user.password_reset_expires:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reset code has expired. Please request a new one.",
            )

        return True

    def reset_password(self, reset_request: PasswordResetComplete) -> User:
        """Complete password reset with new password.

        Args:
            reset_request: Password reset completion request

        Returns:
            Updated user

        Raises:
            HTTPException: If user not found or code invalid
        """
        user = self.user_repo.get_by_email(reset_request.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        if not user.password_reset_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No password reset request found",
            )

        if user.password_reset_token != reset_request.code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid reset code",
            )

        if user.password_reset_expires and datetime.utcnow() > user.password_reset_expires:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reset code has expired. Please request a new one.",
            )

        # Update password and clear reset token
        user.hashed_password = hash_password(reset_request.new_password)
        user.password_reset_token = None
        user.password_reset_expires = None

        return self.user_repo.update(user)
