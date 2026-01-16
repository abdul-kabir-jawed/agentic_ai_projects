"""
Pytest configuration and shared fixtures for Evolution of Todo backend tests.
"""

import os
import uuid
from datetime import datetime, timedelta
from typing import Generator

import pytest
from sqlmodel import SQLModel, Session, create_engine
from fastapi.testclient import TestClient

from src.db.database import get_session
from src.main import app
from src.models.task import Task
from src.models.user import User
from src.models.better_auth import BetterAuthUser


# Test database setup
@pytest.fixture(scope="session")
def test_db_engine():
    """Create an in-memory SQLite database for testing."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        echo=False,
    )
    SQLModel.metadata.create_all(bind=engine)
    yield engine
    SQLModel.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def test_db_session(test_db_engine) -> Generator[Session, None, None]:
    """Create a new database session for each test."""
    connection = test_db_engine.connect()
    transaction = connection.begin()
    # Use SQLModel Session instead of SQLAlchemy sessionmaker
    session = Session(bind=connection)

    def override_get_session():
        try:
            yield session
        finally:
            pass

    app.dependency_overrides[get_session] = override_get_session

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(test_db_session: Session) -> TestClient:
    """Create a FastAPI TestClient with test database."""
    return TestClient(app)


# User fixtures
@pytest.fixture
def test_user(test_db_session: Session) -> User:
    """Create a test user."""
    user = User(
        email="testuser@example.com",
        username="testuser",
        hashed_password="hashed_password_123",
        full_name="Test User",
        is_active=True,
    )
    test_db_session.add(user)
    test_db_session.commit()
    test_db_session.refresh(user)
    return user


@pytest.fixture
def test_user_2(test_db_session: Session) -> User:
    """Create a second test user for isolation testing."""
    user = User(
        email="testuser2@example.com",
        username="testuser2",
        hashed_password="hashed_password_456",
        full_name="Test User 2",
        is_active=True,
    )
    test_db_session.add(user)
    test_db_session.commit()
    test_db_session.refresh(user)
    return user


@pytest.fixture
def test_better_auth_user(test_db_session: Session) -> BetterAuthUser:
    """Create a test user for Better Auth authentication."""
    user = BetterAuthUser(
        id=str(uuid.uuid4()),
        email="betterauth@example.com",
        name="Better Auth User",
        emailVerified=True,
    )
    test_db_session.add(user)
    test_db_session.commit()
    test_db_session.refresh(user)
    return user


# Task fixtures
@pytest.fixture
def sample_task(test_db_session: Session, test_user: User) -> Task:
    """Create a sample task."""
    task = Task(
        user_id=str(test_user.id),
        description="Buy groceries",
        priority="high",
        tags="shopping,urgent",
        due_date=datetime.now() + timedelta(days=1),
        is_daily=False,
        is_completed=False,
    )
    test_db_session.add(task)
    test_db_session.commit()
    test_db_session.refresh(task)
    return task


@pytest.fixture
def sample_tasks(test_db_session: Session, test_user: User):
    """Create multiple sample tasks."""
    tasks = [
        Task(
            user_id=str(test_user.id),
            description="High priority task 1",
            priority="high",
            tags="urgent",
            due_date=datetime.now() + timedelta(days=1),
            is_daily=False,
            is_completed=False,
        ),
        Task(
            user_id=str(test_user.id),
            description="Medium priority task",
            priority="medium",
            tags="work",
            due_date=datetime.now() + timedelta(days=3),
            is_daily=False,
            is_completed=False,
        ),
        Task(
            user_id=str(test_user.id),
            description="Low priority task",
            priority="low",
            tags="personal",
            due_date=datetime.now() + timedelta(days=7),
            is_daily=False,
            is_completed=True,
        ),
        Task(
            user_id=str(test_user.id),
            description="Daily morning routine",
            priority="medium",
            tags="daily",
            due_date=None,
            is_daily=True,
            is_completed=False,
        ),
    ]
    test_db_session.add_all(tasks)
    test_db_session.commit()
    for task in tasks:
        test_db_session.refresh(task)
    return tasks


@pytest.fixture
def other_user_task(test_db_session: Session, test_user_2: User) -> Task:
    """Create a task for a different user (for isolation testing)."""
    task = Task(
        user_id=str(test_user_2.id),
        description="Other user's task",
        priority="high",
        tags="private",
        due_date=datetime.now() + timedelta(days=1),
        is_daily=False,
        is_completed=False,
    )
    test_db_session.add(task)
    test_db_session.commit()
    test_db_session.refresh(task)
    return task


@pytest.fixture
def sample_task(request, test_db_session: Session, test_user: User, test_better_auth_user: BetterAuthUser) -> Task:
    """Create a sample task. Uses test_better_auth_user for integration tests."""
    # Determine which user to use based on test context
    # Integration tests will have 'integration' in the test name or module
    user_id = test_better_auth_user.id if 'integration' in request.node.nodeid else str(test_user.id)

    task = Task(
        user_id=user_id,
        description="Buy groceries",
        priority="high",
        tags="shopping,urgent",
        due_date=datetime.now() + timedelta(days=1),
        is_daily=False,
        is_completed=False,
    )
    test_db_session.add(task)
    test_db_session.commit()
    test_db_session.refresh(task)
    return task


# Authentication helper
@pytest.fixture
def auth_headers(test_better_auth_user: BetterAuthUser) -> dict:
    """Get auth headers with test user ID."""
    return {"X-User-ID": test_better_auth_user.id}
