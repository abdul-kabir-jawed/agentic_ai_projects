"""Authentication dependencies for FastAPI routes."""
import os
from typing import Annotated, Optional
from dataclasses import dataclass

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, text

from src.db.database import get_session

# HTTP Bearer token security scheme
security = HTTPBearer()


@dataclass
class BetterAuthUser:
    """Better Auth user from session validation."""
    id: str  # Better Auth user ID (string UUID)
    email: str
    name: Optional[str] = None
    created_at: Optional[str] = None  # User creation date from neon_auth.user.created_at


def validate_better_auth_session(token: str, session: Session) -> Optional[BetterAuthUser]:
    """Validate a Better Auth session token against public schema.

    Args:
        token: Better Auth session token
        session: Database session

    Returns:
        BetterAuthUser if valid, None otherwise
    """
    database_url = os.getenv("DATABASE_URL", "")
    if not database_url:
        print("[AUTH] DATABASE_URL not set")
        return None

    try:
        # Query public.session to validate token and get user info
        # Better Auth uses camelCase column names (userId, expiresAt, createdAt)
        result = session.execute(
            text("""
                SELECT s."userId", u.id, u.name, u.email, u."createdAt"
                FROM "session" s
                JOIN "user" u ON s."userId" = u.id
                WHERE s.token = :token
                AND s."expiresAt" > NOW()
            """),
            {"token": token}
        )
        row = result.fetchone()
        if row:
            # Convert createdAt to ISO string if it exists
            created_at = None
            if row[4]:  # u."createdAt"
                if isinstance(row[4], str):
                    created_at = row[4]
                else:
                    # If it's a datetime object, convert to ISO string
                    created_at = row[4].isoformat() if hasattr(row[4], 'isoformat') else str(row[4])

            return BetterAuthUser(
                id=row[1],  # u.id
                email=row[3],  # u.email
                name=row[2],  # u.name
                created_at=created_at,
            )
    except Exception as e:
        print(f"[AUTH] Better Auth validation failed: {e}")
    return None


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    session: Annotated[Session, Depends(get_session)],
) -> BetterAuthUser:
    """Get current authenticated user from Better Auth session.

    Args:
        credentials: HTTP Bearer token credentials
        session: Database session

    Returns:
        Current authenticated Better Auth user

    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = credentials.credentials

    # Validate Better Auth session
    user = validate_better_auth_session(token, session)
    if user:
        print(f"[AUTH] Valid session for user: {user.email}")
        return user

    raise credentials_exception
