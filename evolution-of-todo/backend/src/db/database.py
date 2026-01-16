"""Database configuration and session management."""
import os
from typing import Generator

from sqlmodel import SQLModel, Session, create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Check if using local SQLite for faster development
USE_LOCAL_DB = os.getenv("USE_LOCAL_DB", "false").lower() == "true"

if USE_LOCAL_DB:
    # Use local SQLite for fast development
    DATABASE_URL = "sqlite:///./todo_app.db"
    print("[DATABASE] Using LOCAL SQLite database")
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        connect_args={"check_same_thread": False},  # Required for SQLite
    )
else:
    # Get database URL from environment
    DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("NEON_DATABASE_URL")

    if not DATABASE_URL:
        raise ValueError("DATABASE_URL or NEON_DATABASE_URL must be set in environment")

    # Mask password for logging
    masked_url = DATABASE_URL.split("@")[1] if "@" in DATABASE_URL else "configured"
    print(f"[DATABASE] Using NEON PostgreSQL: {masked_url}")

    # Create engine with optimized settings for remote database
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        pool_recycle=300,
        pool_timeout=30,
        connect_args={
            "connect_timeout": 10,
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 5,
        },
    )


def create_db_and_tables():
    """Create database tables."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Get database session dependency."""
    with Session(engine) as session:
        yield session
