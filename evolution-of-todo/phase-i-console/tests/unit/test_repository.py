"""Unit tests for InMemoryTaskRepository."""

import pytest
from src.models.task import Task
from src.repositories.in_memory_repo import InMemoryTaskRepository


class TestInMemoryTaskRepository:
    """Test cases for InMemoryTaskRepository."""
    
    def test_add_task(self):
        """Test adding a task to the repository."""
        repo = InMemoryTaskRepository()
        task = Task(description="Test task")
        added_task = repo.add(task)
        assert added_task == task
        assert len(repo.get_all()) == 1
    
    def test_get_task_by_id(self):
        """Test retrieving a task by ID."""
        repo = InMemoryTaskRepository()
        task = Task(description="Test task", task_id="test-id")
        repo.add(task)
        retrieved = repo.get("test-id")
        assert retrieved == task
        assert retrieved.description == "Test task"
    
    def test_get_nonexistent_task_returns_none(self):
        """Test that getting a non-existent task returns None."""
        repo = InMemoryTaskRepository()
        assert repo.get("nonexistent-id") is None
    
    def test_get_all_tasks(self):
        """Test retrieving all tasks."""
        repo = InMemoryTaskRepository()
        task1 = Task(description="Task 1")
        task2 = Task(description="Task 2")
        repo.add(task1)
        repo.add(task2)
        all_tasks = repo.get_all()
        assert len(all_tasks) == 2
        assert task1 in all_tasks
        assert task2 in all_tasks
    
    def test_get_all_returns_copy(self):
        """Test that get_all returns a copy, not the internal list."""
        repo = InMemoryTaskRepository()
        task = Task(description="Test task")
        repo.add(task)
        all_tasks = repo.get_all()
        all_tasks.clear()  # Modify the returned list
        assert len(repo.get_all()) == 1  # Original should be unchanged
    
    def test_update_task(self):
        """Test updating a task."""
        repo = InMemoryTaskRepository()
        task = Task(description="Original description", task_id="test-id")
        repo.add(task)
        task.update_description("Updated description")
        updated = repo.update(task)
        assert updated.description == "Updated description"
        retrieved = repo.get("test-id")
        assert retrieved.description == "Updated description"
    
    def test_update_nonexistent_task_raises_error(self):
        """Test that updating a non-existent task raises ValueError."""
        repo = InMemoryTaskRepository()
        task = Task(description="Test task", task_id="nonexistent-id")
        with pytest.raises(ValueError, match="not found"):
            repo.update(task)
    
    def test_delete_task(self):
        """Test deleting a task."""
        repo = InMemoryTaskRepository()
        task = Task(description="Test task", task_id="test-id")
        repo.add(task)
        deleted = repo.delete("test-id")
        assert deleted is True
        assert repo.get("test-id") is None
        assert len(repo.get_all()) == 0
    
    def test_delete_nonexistent_task_returns_false(self):
        """Test that deleting a non-existent task returns False."""
        repo = InMemoryTaskRepository()
        assert repo.delete("nonexistent-id") is False
    
    def test_add_duplicate_id_raises_error(self):
        """Test that adding a task with duplicate ID raises ValueError."""
        repo = InMemoryTaskRepository()
        task1 = Task(description="Task 1", task_id="same-id")
        task2 = Task(description="Task 2", task_id="same-id")
        repo.add(task1)
        with pytest.raises(ValueError, match="already exists"):
            repo.add(task2)
    
    def test_repository_isolation(self):
        """Test that different repository instances are isolated."""
        repo1 = InMemoryTaskRepository()
        repo2 = InMemoryTaskRepository()
        task = Task(description="Test task")
        repo1.add(task)
        assert len(repo1.get_all()) == 1
        assert len(repo2.get_all()) == 0
