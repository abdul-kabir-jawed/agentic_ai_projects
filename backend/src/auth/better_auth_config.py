"""Better Auth configuration for backend integration with Neon PostgreSQL."""

import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class BetterAuthConfig:
    """Better Auth configuration for server-side setup."""

    # Database configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL") or os.getenv("NEON_DATABASE_URL", "")
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL or NEON_DATABASE_URL must be set in environment")

    # Better Auth configuration
    SECRET: str = os.getenv("BETTER_AUTH_SECRET", "your-secret-key-change-in-production")
    BASE_URL: str = os.getenv("BETTER_AUTH_URL", "http://localhost:3000")
    BASE_PATH: str = "/api/auth"

    # Session configuration
    SESSION_EXPIRES_IN: int = 7 * 24 * 60 * 60  # 7 days in seconds
    SESSION_UPDATE_AGE: int = 24 * 60 * 60  # Update session daily

    # Email configuration
    EMAIL_ENABLED: bool = os.getenv("EMAIL_ENABLED", "false").lower() == "true"
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "noreply@evolution-of-todo.com")
    EMAIL_VERIFICATION_ENABLED: bool = os.getenv("EMAIL_VERIFICATION_ENABLED", "false").lower() == "true"

    # Password configuration
    MIN_PASSWORD_LENGTH: int = 8
    MAX_PASSWORD_LENGTH: int = 128

    # Trusted origins
    TRUSTED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        os.getenv("BETTER_AUTH_URL", "http://localhost:3000"),
    ]

    # OAuth providers (optional)
    OAUTH_ENABLED: bool = False
    GOOGLE_CLIENT_ID: Optional[str] = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: Optional[str] = os.getenv("GOOGLE_CLIENT_SECRET")
    GITHUB_CLIENT_ID: Optional[str] = os.getenv("GITHUB_CLIENT_ID")
    GITHUB_CLIENT_SECRET: Optional[str] = os.getenv("GITHUB_CLIENT_SECRET")

    @classmethod
    def validate(cls) -> bool:
        """Validate configuration."""
        errors = []

        if not cls.DATABASE_URL:
            errors.append("DATABASE_URL must be set")

        if not cls.SECRET or cls.SECRET == "your-secret-key-change-in-production":
            errors.append("BETTER_AUTH_SECRET must be set to a secure value in production")

        if errors:
            print("[AUTH CONFIG] Configuration errors:")
            for error in errors:
                print(f"  - {error}")
            return False

        print("[AUTH CONFIG] Configuration validated successfully")
        print(f"  Database: Neon PostgreSQL configured")
        print(f"  Session expiry: {cls.SESSION_EXPIRES_IN // 86400} days")
        print(f"  Email verification: {'enabled' if cls.EMAIL_VERIFICATION_ENABLED else 'disabled'}")

        return True


def get_better_auth_config() -> BetterAuthConfig:
    """Get Better Auth configuration."""
    return BetterAuthConfig()
