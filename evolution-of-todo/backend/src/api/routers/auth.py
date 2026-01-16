"""Authentication API router."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from src.api.schemas.auth import (
    UserRegister,
    UserLogin,
    UserUpdate,
    UserResponse,
    TokenResponse,
    UserStatsResponse,
    AvatarUploadRequest,
)
from src.auth.auth import create_access_token, blacklist_token
from src.auth.dependencies import get_current_user
from src.db.database import get_session
from src.models.user import User
from src.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["Authentication"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(
    request: Request,
    user_data: UserRegister,
    session: Annotated[Session, Depends(get_session)],
):
    """Register a new user.

    Args:
        request: HTTP request object
        user_data: User registration data
        session: Database session

    Returns:
        Access token and user data

    Raises:
        HTTPException: If email or username already exists
    """
    user_service = UserService(session)
    user = user_service.register_user(user_data)

    # Create access token (sub must be a string per JWT spec)
    access_token = create_access_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(
    request: Request,
    credentials: UserLogin,
    session: Annotated[Session, Depends(get_session)],
):
    """Login user with username/email and password.

    Args:
        request: HTTP request object
        credentials: Login credentials
        session: Database session

    Returns:
        Access token and user data

    Raises:
        HTTPException: If credentials are invalid
    """
    user_service = UserService(session)
    user = user_service.authenticate_user(credentials.username, credentials.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token (sub must be a string per JWT spec)
    access_token = create_access_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("10/minute")
async def logout(
    request: Request,
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Logout user by blacklisting their token.

    Args:
        request: HTTP request object
        current_user: Authenticated user from token

    Returns:
        Empty response (204 No Content)
    """
    # Extract token from Authorization header
    auth_header = request.headers.get("authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]  # Remove "Bearer " prefix
        blacklist_token(token)

    return None


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get current user profile.

    Args:
        current_user: Authenticated user from token

    Returns:
        Current user data
    """
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_data: UserUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    """Update current user profile.

    Args:
        user_data: Updated user data
        current_user: Authenticated user from token
        session: Database session

    Returns:
        Updated user data

    Raises:
        HTTPException: If email or username conflict
    """
    user_service = UserService(session)
    updated_user = user_service.update_user(current_user.id, user_data)
    return UserResponse.model_validate(updated_user)


@router.get("/me/stats", response_model=UserStatsResponse)
async def get_user_stats(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    """Get current user task statistics.

    Args:
        current_user: Authenticated user from token
        session: Database session

    Returns:
        User task statistics including most productive day
    """
    user_service = UserService(session)
    return user_service.get_user_stats(current_user.id)


@router.post("/me/avatar", response_model=UserResponse)
async def upload_avatar(
    avatar_data: AvatarUploadRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    """Upload user avatar image.

    Args:
        avatar_data: Avatar upload request with base64 image data
        current_user: Authenticated user from token
        session: Database session

    Returns:
        Updated user data with new avatar

    Raises:
        HTTPException: If image data is invalid
    """
    user_service = UserService(session)
    updated_user = user_service.upload_avatar(current_user.id, avatar_data.image_data)
    return UserResponse.model_validate(updated_user)


@router.delete("/me/avatar", response_model=UserResponse)
async def delete_avatar(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    """Delete user avatar image.

    Args:
        current_user: Authenticated user from token
        session: Database session

    Returns:
        Updated user data with avatar removed
    """
    user_service = UserService(session)
    updated_user = user_service.delete_avatar(current_user.id)
    return UserResponse.model_validate(updated_user)
