"""Unit tests for TaskService."""

import pytest
from src.models.task import Task
from src.repositories.in_memory_repo import InMemoryTaskRepository
from src.services.task_service import TaskService


class TestTaskService:
    """Test cases for TaskService."""
    
    @pytest.fixture
    def service(self):
        """Create a TaskService instance for testing."""
        repository = InMemoryTaskRepository()
        return TaskService(repository)
    
    def test_create_task(self, service):
        """Test creating a task through the service."""
        task = service.create_task("Buy groceries")
        assert task.description == "Buy groceries"
        assert task.is_completed is False
        assert task.id is not None
    
    def test_create_task_with_empty_description_raises_error(self, service):
        """Test that creating a task with empty description raises ValueError."""
        with pytest.raises(ValueError, match="Task description cannot be empty"):
            service.create_task("")
    
    def test_create_task_strips_whitespace(self, service):
        """Test that description is trimmed of leading/trailing whitespace."""
        task = service.create_task("  Buy groceries  ")
        assert task.description == "Buy groceries"
    
    def test_get_task(self, service):
        """Test retrieving a task by ID."""
        created_task = service.create_task("Test task")
        retrieved = service.get_task(created_task.id)
        assert retrieved == created_task
        assert retrieved.description == "Test task"
    
    def test_get_nonexistent_task_returns_none(self, service):
        """Test that getting a non-existent task returns None."""
        assert service.get_task("nonexistent-id") is None
    
    def test_get_all_tasks(self, service):
        """Test retrieving all tasks."""
        task1 = service.create_task("Task 1")
        task2 = service.create_task("Task 2")
        all_tasks = service.get_all_tasks()
        assert len(all_tasks) == 2
        assert task1 in all_tasks
        assert task2 in all_tasks
    
    def test_update_task(self, service):
        """Test updating a task description."""
        task = service.create_task("Original description")
        updated = service.update_task(task.id, "Updated description")
        assert updated.description == "Updated description"
        retrieved = service.get_task(task.id)
        assert retrieved.description == "Updated description"
    
    def test_update_task_with_empty_description_raises_error(self, service):
        """Test that updating with empty description raises ValueError."""
        task = service.create_task("Original description")
        with pytest.raises(ValueError, match="Task description cannot be empty"):
            service.update_task(task.id, "")
    
    def test_update_nonexistent_task_raises_error(self, service):
        """Test that updating a non-existent task raises ValueError."""
        with pytest.raises(ValueError, match="not found"):
            service.update_task("nonexistent-id", "New description")
    
    def test_update_task_strips_whitespace(self, service):
        """Test that updated description is trimmed."""
        task = service.create_task("Original")
        updated = service.update_task(task.id, "  Updated  ")
        assert updated.description == "Updated"
    
    def test_delete_task(self, service):
        """Test deleting a task."""
        task = service.create_task("Test task")
        deleted = service.delete_task(task.id)
        assert deleted is True
        assert service.get_task(task.id) is None
        assert len(service.get_all_tasks()) == 0
    
    def test_delete_nonexistent_task_returns_false(self, service):
        """Test that deleting a non-existent task returns False."""
        assert service.delete_task("nonexistent-id") is False
    
    def test_delete_task_with_empty_id_raises_error(self, service):
        """Test that deleting with empty ID raises ValueError."""
        with pytest.raises(ValueError, match="Task ID cannot be empty"):
            service.delete_task("")
    
    def test_mark_complete(self, service):
        """Test marking a task as complete."""
        task = service.create_task("Test task")
        assert task.is_completed is False
        updated = service.mark_complete(task.id)
        assert updated.is_completed is True
        retrieved = service.get_task(task.id)
        assert retrieved.is_completed is True
    
    def test_mark_complete_nonexistent_task_raises_error(self, service):
        """Test that marking non-existent task complete raises ValueError."""
        with pytest.raises(ValueError, match="not found"):
            service.mark_complete("nonexistent-id")
    
    def test_mark_complete_with_empty_id_raises_error(self, service):
        """Test that marking complete with empty ID raises ValueError."""
        with pytest.raises(ValueError, match="Task ID cannot be empty"):
            service.mark_complete("")
    
    def test_complete_workflow(self, service):
        """Test a complete workflow: create, update, mark complete, delete."""
        # Create
        task = service.create_task("Buy groceries")
        assert task.is_completed is False
        
        # Update
        updated = service.update_task(task.id, "Buy groceries and milk")
        assert updated.description == "Buy groceries and milk"
        
        # Mark complete
        completed = service.mark_complete(task.id)
        assert completed.is_completed is True
        
        # Delete
        deleted = service.delete_task(task.id)
        assert deleted is True
        assert service.get_task(task.id) is None
