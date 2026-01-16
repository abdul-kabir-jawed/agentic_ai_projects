"""Abstract repository interface for task storage."""

from abc import ABC, abstractmethod
from typing import List, Optional

from src.models.task import Task


class TaskRepository(ABC):
    """
    Abstract interface for task storage operations.
    
    This interface defines the contract that all task repositories must implement,
    allowing for different storage backends (in-memory, database, etc.).
    """
    
    @abstractmethod
    def add(self, task: Task) -> Task:
        """
        Add a new task to storage.
        
        Args:
            task: Task instance to add
        
        Returns:
            The added task (may have ID assigned if not provided)
        
        Raises:
            ValueError: If task with same ID already exists
        """
        pass
    
    @abstractmethod
    def get(self, task_id: str) -> Optional[Task]:
        """
        Retrieve a task by ID.
        
        Args:
            task_id: Unique task identifier
        
        Returns:
            Task instance if found, None otherwise
        """
        pass
    
    @abstractmethod
    def get_all(self) -> List[Task]:
        """
        Retrieve all tasks.
        
        Returns:
            List of all tasks in storage
        """
        pass
    
    @abstractmethod
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
        pass
    
    @abstractmethod
    def delete(self, task_id: str) -> bool:
        """
        Delete a task by ID.
        
        Args:
            task_id: Unique task identifier
        
        Returns:
            True if task was deleted, False if task not found
        """
        pass
