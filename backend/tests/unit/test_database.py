"""
Tests for database module.
"""

import pytest
from sqlmodel import Session

from src.db.database import get_session


class TestDatabaseSession:
    """Test database session management."""

    def test_get_session(self, test_db_session: Session):
        """Test that database session is available."""
        assert test_db_session is not None
        assert isinstance(test_db_session, Session)

    def test_session_is_active(self, test_db_session: Session):
        """Test that session is active and usable."""
        # SQLModel/SQLAlchemy session should have is_active property
        assert test_db_session.is_active is True

    def test_session_is_not_none(self, test_db_session: Session):
        """Test that session exists and is not None."""
        assert test_db_session is not None
        # Verify it's a proper session
        assert hasattr(test_db_session, 'query') or hasattr(test_db_session, 'execute')
