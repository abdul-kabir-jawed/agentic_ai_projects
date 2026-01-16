"""In-memory implementation of TaskRepository."""

from typing import List, Optional

from src.models.task import Task
from src.repositories.task_repository import TaskRepository


class InMemoryTaskRepository(TaskRepository):
    """
    In-memory implementation of TaskRepository using a Python list.
    
    This implementation stores tasks in memory and does not persist data
    across application restarts. Suitable for Phase I console application.
    """
    
    def __init__(self):
        """Initialize an empty in-memory task repository."""
        self._tasks: List[Task] = []
    
    def add(self, task: Task) -> Task:
        """
        Add a new task to storage.
        
        Args:
            task: Task instance to add
        
        Returns:
            The added task
        
        Raises:
            ValueError: If task with same ID already exists
        """
        # Check if task with same ID already exists
        if any(t.id == task.id for t in self._tasks):
            raise ValueError(f"Task with ID {task.id} already exists")
        
        self._tasks.append(task)
        return task
    
    def get(self, task_id: str) -> Optional[Task]:
        """
        Retrieve a task by ID.
        
        Args:
            task_id: Unique task identifier
        
        Returns:
            Task instance if found, None otherwise
        """
        for task in self._tasks:
            if task.id == task_id:
                return task
        return None
    
    def get_all(self) -> List[Task]:
        """
        Retrieve all tasks.
        
        Returns:
            List of all tasks in storage
        """
        return self._tasks.copy()
    
    def update(self, task: Task) -> Task:
        """
        Update an existing task.
        
        Args:
            task: Task instance with updated data
        
        Returns:
            The updated task
        
        Raises:
            ValueError: If task with given ID does not exist
        """
        for i, existing_task in enumerate(self._tasks):
            if existing_task.id == task.id:
                self._tasks[i] = task
                return task
        
        raise ValueError(f"Task with ID {task.id} not found")
    
    def delete(self, task_id: str) -> bool:
        """
        Delete a task by ID.
        
        Args:
            task_id: Unique task identifier
        
        Returns:
            True if task was deleted, False if task not found
        """
        for i, task in enumerate(self._tasks):
            if task.id == task_id:
                self._tasks.pop(i)
                return True
        return False
