"""Unit tests for Task domain model."""

import pytest
from datetime import datetime
from src.models.task import Task


class TestTask:
    """Test cases for Task model."""
    
    def test_create_task_with_description(self):
        """Test creating a task with a description."""
        task = Task(description="Buy groceries")
        assert task.description == "Buy groceries"
        assert task.is_completed is False
        assert task.id is not None
        assert isinstance(task.created_at, datetime)
    
    def test_create_task_with_custom_id(self):
        """Test creating a task with a custom ID."""
        task = Task(description="Test task", task_id="custom-id-123")
        assert task.id == "custom-id-123"
    
    def test_create_task_with_completed_status(self):
        """Test creating a task that is already completed."""
        task = Task(description="Completed task", is_completed=True)
        assert task.is_completed is True
    
    def test_create_task_with_empty_description_raises_error(self):
        """Test that creating a task with empty description raises ValueError."""
        with pytest.raises(ValueError, match="Task description cannot be empty"):
            Task(description="")
    
    def test_create_task_with_none_description_raises_error(self):
        """Test that creating a task with None description raises ValueError."""
        with pytest.raises(ValueError, match="Task description cannot be empty"):
            Task(description=None)
    
    def test_create_task_with_whitespace_only_description_raises_error(self):
        """Test that creating a task with whitespace-only description raises ValueError."""
        with pytest.raises(ValueError, match="Task description cannot be empty"):
            Task(description="   ")
    
    def test_mark_complete(self):
        """Test marking a task as complete."""
        task = Task(description="Test task")
        assert task.is_completed is False
        task.mark_complete()
        assert task.is_completed is True
    
    def test_mark_incomplete(self):
        """Test marking a task as incomplete."""
        task = Task(description="Test task", is_completed=True)
        assert task.is_completed is True
        task.mark_incomplete()
        assert task.is_completed is False
    
    def test_update_description(self):
        """Test updating task description."""
        task = Task(description="Original description")
        task.update_description("Updated description")
        assert task.description == "Updated description"
    
    def test_update_description_with_empty_string_raises_error(self):
        """Test that updating with empty description raises ValueError."""
        task = Task(description="Original description")
        with pytest.raises(ValueError, match="Task description cannot be empty"):
            task.update_description("")
    
    def test_update_description_strips_whitespace(self):
        """Test that description is trimmed of leading/trailing whitespace."""
        task = Task(description="Original")
        task.update_description("  Updated with spaces  ")
        assert task.description == "Updated with spaces"
    
    def test_task_equality(self):
        """Test that tasks are equal if they have the same ID."""
        task1 = Task(description="Task 1", task_id="same-id")
        task2 = Task(description="Task 2", task_id="same-id")
        assert task1 == task2
    
    def test_task_inequality(self):
        """Test that tasks with different IDs are not equal."""
        task1 = Task(description="Task 1", task_id="id-1")
        task2 = Task(description="Task 2", task_id="id-2")
        assert task1 != task2
    
    def test_task_repr(self):
        """Test string representation of task."""
        task = Task(description="Test task")
        repr_str = repr(task)
        assert "Task" in repr_str
        assert "Test task" in repr_str
        assert "○" in repr_str  # Incomplete status
    
    def test_task_repr_completed(self):
        """Test string representation of completed task."""
        task = Task(description="Completed task", is_completed=True)
        repr_str = repr(task)
        assert "✓" in repr_str  # Completed status
