"""Password hashing and verification service."""
from passlib.context import CryptContext
from passlib.exc import UnknownHashError

# Password hashing context with argon2
# Argon2 is more modern and doesn't have the byte limit issues of bcrypt
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
)


def hash_password(password: str) -> str:
    """Hash a password using Argon2.

    Args:
        password: Plain text password to hash

    Returns:
        Hashed password string
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash.

    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to compare against

    Returns:
        True if password matches, False otherwise
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except (UnknownHashError, ValueError):
        # Handle case where stored hash is not in a recognized format
        # This can happen with corrupted data or old hashing methods
        return False
