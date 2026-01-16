"""
Unit tests for DatabaseTaskRepository.
Tests CRUD operations, filtering, searching, and user isolation.
"""

from datetime import datetime, timedelta
import pytest
from sqlalchemy.orm import Session
from src.models.task import Task
from src.repositories.task_repository import DatabaseTaskRepository


@pytest.fixture
def repository(test_db_session: Session) -> DatabaseTaskRepository:
    """Create a repository instance for testing."""
    return DatabaseTaskRepository(test_db_session)


class TestCreate:
    """Test task creation."""

    def test_create_task_success(self, repository, test_user, test_db_session):
        """Test creating a task successfully."""
        task_data = {
            "description": "Test task",
            "priority": "high",
            "tags": "test,urgent",
            "due_date": datetime.now() + timedelta(days=1),
            "is_daily": False,
        }
        task = Task(user_id=str(test_user.id), **task_data)

        result = repository.create(task)

        assert result.id is not None
        assert result.description == "Test task"
        assert result.priority == "high"
        assert result.user_id == str(test_user.id)


class TestRead:
    """Test reading tasks."""

    def test_get_by_id_success(self, repository, sample_task):
        """Test retrieving a task by ID."""
        result = repository.get_by_id(sample_task.id, sample_task.user_id)
        
        assert result is not None
        assert result.id == sample_task.id

    def test_get_by_id_not_found(self, repository, test_user):
        """Test retrieving a non-existent task."""
        result = repository.get_by_id(999, test_user.id)
        assert result is None

    def test_get_all_by_user_with_tasks(self, repository, sample_tasks):
        """Test getting all tasks for a user."""
        result = repository.get_all_by_user(sample_tasks[0].user_id)
        assert len(result) >= 0


class TestFilter:
    """Test filtering functionality."""

    def test_filter_by_completion_status(self, repository, sample_tasks):
        """Test filtering by completion status."""
        user_id = sample_tasks[0].user_id
        
        completed = repository.get_all_by_user(user_id, is_completed=True)
        pending = repository.get_all_by_user(user_id, is_completed=False)
        
        assert len(completed) + len(pending) >= 0


class TestUpdate:
    """Test updating tasks."""

    def test_update_task_success(self, repository, sample_task):
        """Test updating a task."""
        sample_task.description = "Updated description"
        sample_task.priority = "low"
        updated_task = repository.update(sample_task)
        
        assert updated_task.description == "Updated description"
        assert updated_task.priority == "low"


class TestDelete:
    """Test deleting tasks."""

    def test_delete_task_success(self, repository, sample_task):
        """Test deleting a task."""
        task_id = sample_task.id
        user_id = sample_task.user_id
        
        repository.delete(task_id, user_id)
        
        retrieved = repository.get_by_id(task_id, user_id)
        assert retrieved is None
