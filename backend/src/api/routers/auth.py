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
    PasswordResetRequest,
    PasswordResetVerify,
    PasswordResetComplete,
    PasswordResetResponse,
    UserSync,
    ProfileSync,
    BetterAuthUserResponse,
    ApiKeyUpdateRequest,
    ApiKeyStatusResponse,
    ApiKeyDeleteResponse,
)
from src.repositories.user_data_repository import UserDataRepository
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


@router.post("/sync", response_model=TokenResponse, status_code=status.HTTP_200_OK)
@limiter.limit("10/minute")
async def sync_user(
    request: Request,
    user_data: UserSync,
    session: Annotated[Session, Depends(get_session)],
):
    """Sync user from Better Auth - creates or updates password.

    This endpoint is used to sync users between Better Auth and the backend.
    If the user exists, it updates their password. If not, it creates them.

    Args:
        request: HTTP request object
        user_data: User sync data
        session: Database session

    Returns:
        Access token and user data
    """
    user_service = UserService(session)
    user = user_service.sync_user(user_data)

    # Create access token
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


@router.get("/me", response_model=BetterAuthUserResponse)
async def get_current_user_profile(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    """Get current user profile.

    Args:
        current_user: Authenticated user from token (BetterAuthUser)
        session: Database session

    Returns:
        Current user data with stored username and full name
    """
    try:
        # Convert BetterAuthUser to BetterAuthUserResponse
        user_id = str(current_user.id) if current_user.id else ""
        user_email = str(current_user.email) if current_user.email else ""

        # Get stored profile data from user_data table
        repo = UserDataRepository(session)
        user_data = repo.get_by_user_id(user_id)

        # Use stored username/name if available, otherwise fallback
        if user_data:
            username = user_data.username or user_email.split('@')[0]
            user_name = user_data.name
            has_api_keys = user_data.has_api_keys()
            profile_picture_url = user_data.profile_picture_url
        else:
            username = user_email.split('@')[0]
            user_name = str(current_user.name) if hasattr(current_user, 'name') and current_user.name else None
            has_api_keys = False
            profile_picture_url = None

        # Get created_at from Better Auth user if available
        created_at = None
        updated_at = None
        if hasattr(current_user, 'created_at') and current_user.created_at:
            created_at = current_user.created_at
        elif current_user.created_at:  # Direct attribute access
            created_at = current_user.created_at
        if hasattr(current_user, 'updated_at') and current_user.updated_at:
            updated_at = current_user.updated_at

        return BetterAuthUserResponse(
            id=user_id,
            email=user_email,
            name=user_name,
            username=username,
            profile_picture_url=profile_picture_url,
            is_active=True,
            has_api_keys=has_api_keys,
            created_at=created_at,
            updated_at=updated_at,
        )
    except Exception as e:
        print(f"[AUTH] Error in get_current_user_profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing user profile: {str(e)}",
        )


@router.post("/me/profile", response_model=BetterAuthUserResponse)
async def sync_user_profile(
    profile_data: ProfileSync,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    """Sync user profile data (username and full name) after Better Auth registration.

    Args:
        profile_data: Profile data to sync
        current_user: Authenticated user from token
        session: Database session

    Returns:
        Updated user profile
    """
    try:
        user_id = str(current_user.id) if current_user.id else ""
        user_email = str(current_user.email) if current_user.email else ""

        # Store profile data in user_data table
        repo = UserDataRepository(session)
        user_data = repo.update_profile(
            user_id=user_id,
            email=user_email,
            name=profile_data.full_name,
            username=profile_data.username,
        )

        # Get created_at from Better Auth user
        created_at = None
        if hasattr(current_user, 'created_at') and current_user.created_at:
            created_at = current_user.created_at

        return BetterAuthUserResponse(
            id=user_id,
            email=user_email,
            name=user_data.name,
            username=user_data.username,
            profile_picture_url=user_data.profile_picture_url,
            is_active=True,
            has_api_keys=user_data.has_api_keys(),
            created_at=created_at,
            updated_at=user_data.updated_at,
        )
    except Exception as e:
        print(f"[AUTH] Error in sync_user_profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error syncing profile: {str(e)}",
        )


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


@router.post("/me/avatar", response_model=BetterAuthUserResponse)
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
    try:
        user_id = str(current_user.id) if current_user.id else ""
        user_email = str(current_user.email) if current_user.email else ""
        user_name = str(current_user.name) if hasattr(current_user, 'name') and current_user.name else None

        repo = UserDataRepository(session)
        user_data = repo.update_profile_picture(
            user_id=user_id,
            email=user_email,
            image_data=avatar_data.image_data,
            name=user_name,
        )

        return BetterAuthUserResponse(
            id=user_id,
            email=user_email,
            name=user_data.name,
            username=user_data.username or user_email.split('@')[0],
            profile_picture_url=user_data.profile_picture_url,
            is_active=True,
            has_api_keys=user_data.has_api_keys(),
            created_at=user_data.created_at,
            updated_at=user_data.updated_at,
        )
    except Exception as e:
        print(f"[AUTH] Error uploading avatar: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading avatar: {str(e)}",
        )


@router.delete("/me/avatar", response_model=BetterAuthUserResponse)
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
    try:
        user_id = str(current_user.id) if current_user.id else ""
        user_email = str(current_user.email) if current_user.email else ""

        repo = UserDataRepository(session)
        user_data = repo.delete_profile_picture(user_id)

        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        return BetterAuthUserResponse(
            id=user_id,
            email=user_email,
            name=user_data.name,
            username=user_data.username or user_email.split('@')[0],
            profile_picture_url=None,
            is_active=True,
            has_api_keys=user_data.has_api_keys(),
            created_at=user_data.created_at,
            updated_at=user_data.updated_at,
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"[AUTH] Error deleting avatar: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting avatar: {str(e)}",
        )


@router.post("/forgot-password", response_model=PasswordResetResponse, status_code=status.HTTP_200_OK)
@limiter.limit("3/minute")
async def forgot_password(
    request: Request,
    reset_request: PasswordResetRequest,
    session: Annotated[Session, Depends(get_session)],
):
    """Request a password reset by sending code to email.

    Args:
        request: HTTP request object
        reset_request: Password reset request with email
        session: Database session

    Returns:
        Message confirming reset code was sent

    Raises:
        HTTPException: If user not found
    """
    user_service = UserService(session)
    reset_code = user_service.request_password_reset(reset_request)

    return PasswordResetResponse(
        message=f"Reset code sent to {reset_request.email}",
        email=reset_request.email,
    )


@router.post("/verify-reset-code", response_model=PasswordResetResponse, status_code=status.HTTP_200_OK)
@limiter.limit("10/minute")
async def verify_reset_code(
    request: Request,
    verify_request: PasswordResetVerify,
    session: Annotated[Session, Depends(get_session)],
):
    """Verify password reset code.

    Args:
        request: HTTP request object
        verify_request: Verification request with email and code
        session: Database session

    Returns:
        Message confirming code is valid

    Raises:
        HTTPException: If user not found or code invalid
    """
    user_service = UserService(session)
    user_service.verify_reset_code(verify_request)

    return PasswordResetResponse(
        message="Reset code verified successfully",
        email=verify_request.email,
    )


@router.post("/reset-password", response_model=PasswordResetResponse, status_code=status.HTTP_200_OK)
@limiter.limit("3/minute")
async def reset_password(
    request: Request,
    reset_request: PasswordResetComplete,
    session: Annotated[Session, Depends(get_session)],
):
    """Complete password reset with new password.

    Args:
        request: HTTP request object
        reset_request: Password reset completion request
        session: Database session

    Returns:
        Message confirming password was reset

    Raises:
        HTTPException: If user not found or code invalid
    """
    user_service = UserService(session)
    user_service.reset_password(reset_request)

    return PasswordResetResponse(
        message="Password reset successfully",
        email=reset_request.email,
    )


# ============ API KEY MANAGEMENT ============


@router.get("/me/api-keys", response_model=ApiKeyStatusResponse)
async def get_api_keys_status(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    """Get current user's API key configuration status.

    Does NOT return actual API keys - only indicates which keys are configured.

    Args:
        current_user: Authenticated user from token
        session: Database session

    Returns:
        API key status (gemini_configured, openai_configured, has_any)
    """
    repo = UserDataRepository(session)
    status = repo.get_api_keys_status(current_user.id)

    return ApiKeyStatusResponse(
        gemini_configured=status.get("gemini_configured", False),
        openai_configured=status.get("openai_configured", False),
        has_any=status.get("has_any", False),
        updated_at=status.get("updated_at"),
    )


@router.put("/me/api-keys", response_model=ApiKeyStatusResponse)
async def update_api_keys(
    api_keys: ApiKeyUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    """Update current user's API keys.

    API keys are encrypted before storage. Only provide keys you want to update.
    Keys not provided in the request will retain their existing values.

    Args:
        api_keys: API key update request with optional gemini/openai keys
        current_user: Authenticated user from token
        session: Database session

    Returns:
        Updated API key status
    """
    repo = UserDataRepository(session)

    # Get user info for repo
    user_id = str(current_user.id)
    user_email = str(current_user.email) if hasattr(current_user, 'email') else ""
    user_name = str(current_user.name) if hasattr(current_user, 'name') and current_user.name else None

    status = repo.update_api_keys(
        user_id=user_id,
        email=user_email,
        gemini_key=api_keys.gemini_api_key,
        openai_key=api_keys.openai_api_key,
        name=user_name,
    )

    return ApiKeyStatusResponse(
        gemini_configured=status.get("gemini_configured", False),
        openai_configured=status.get("openai_configured", False),
        has_any=status.get("gemini_configured", False) or status.get("openai_configured", False),
        updated_at=status.get("updated_at"),
    )


@router.delete("/me/api-keys", response_model=ApiKeyDeleteResponse)
async def delete_api_keys(
    current_user: Annotated[User, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
):
    """Delete all API keys for the current user.

    Args:
        current_user: Authenticated user from token
        session: Database session

    Returns:
        Deletion confirmation
    """
    repo = UserDataRepository(session)
    deleted = repo.delete_api_keys(current_user.id)

    return ApiKeyDeleteResponse(
        message="API keys deleted successfully" if deleted else "No API keys to delete",
        deleted=deleted,
    )
