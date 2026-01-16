"""
Unit tests for TaskService.
Tests business logic layer.
"""

from datetime import datetime, timedelta
import pytest
from fastapi import HTTPException
from sqlmodel import Session
from src.models.task import Task
from src.repositories.task_repository import DatabaseTaskRepository
from src.services.task_service import TaskService
from src.api.schemas.task import TaskCreate, TaskUpdate


@pytest.fixture
def service(test_db_session: Session) -> TaskService:
    """Create a service instance for testing."""
    return TaskService(test_db_session)


class TestCreateTask:
    """Test task creation in service."""

    def test_create_task_success(self, service, test_user):
        """Test creating a task."""
        task_data = TaskCreate(
            description="Test task",
            priority="high",
            tags="test",
        )
        result = service.create_task(str(test_user.id), task_data)

        assert result.id is not None
        assert result.description == "Test task"


class TestGetTask:
    """Test retrieving tasks."""

    def test_get_task_success(self, service, sample_task):
        """Test getting a task."""
        result = service.get_task(sample_task.id, sample_task.user_id)
        assert result.id == sample_task.id


class TestUpdateTask:
    """Test updating tasks."""

    def test_update_task_success(self, service, sample_task):
        """Test updating a task."""
        update_data = TaskUpdate(description="Updated task")
        result = service.update_task(sample_task.id, sample_task.user_id, update_data)

        assert result.description == "Updated task"


class TestCompleteTask:
    """Test task completion."""

    def test_complete_task(self, service, sample_task):
        """Test marking task complete."""
        service.complete_task(sample_task.id, sample_task.user_id)
        result = service.get_task(sample_task.id, sample_task.user_id)
        
        assert result.is_completed is True


class TestDeleteTask:
    """Test task deletion."""

    def test_delete_task(self, service, sample_task):
        """Test deleting a task."""
        result = service.delete_task(sample_task.id, sample_task.user_id)
        assert result is True

        # Verify task is deleted by attempting to get it
        with pytest.raises(HTTPException):
            service.get_task(sample_task.id, sample_task.user_id)
