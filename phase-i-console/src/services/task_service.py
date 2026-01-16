"""Service layer for task business logic."""

from typing import List, Optional

from src.models.task import Task
from src.repositories.task_repository import TaskRepository


class TaskService:
    """
    Service layer providing business logic for task operations.
    
    This service handles validation, business rules, and coordinates
    between the domain model and repository layer.
    """
    
    def __init__(self, repository: TaskRepository):
        """
        Initialize TaskService with a repository.
        
        Args:
            repository: TaskRepository implementation to use for storage
        """
        self._repository = repository
    
    def create_task(self, description: str) -> Task:
        """
        Create a new task.
        
        Args:
            description: Task description (must be non-empty)
        
        Returns:
            Created Task instance
        
        Raises:
            ValueError: If description is empty or None
        """
        if not description or not description.strip():
            raise ValueError("Task description cannot be empty")
        
        task = Task(description=description.strip())
        return self._repository.add(task)
    
    def get_task(self, task_id: str) -> Optional[Task]:
        """
        Retrieve a task by ID.
        
        Args:
            task_id: Unique task identifier
        
        Returns:
            Task instance if found, None otherwise
        """
        return self._repository.get(task_id)
    
    def get_all_tasks(self) -> List[Task]:
        """
        Retrieve all tasks.
        
        Returns:
            List of all tasks
        """
        return self._repository.get_all()
    
    def update_task(self, task_id: str, new_description: str) -> Task:
        """
        Update a task's description.
        
        Args:
            task_id: Unique task identifier
            new_description: New description text (must be non-empty)
        
        Returns:
            Updated Task instance
        
        Raises:
            ValueError: If task_id is invalid or new_description is empty
        """
        if not new_description or not new_description.strip():
            raise ValueError("Task description cannot be empty")
        
        task = self._repository.get(task_id)
        if not task:
            raise ValueError(f"Task with ID {task_id} not found")
        
        task.update_description(new_description.strip())
        return self._repository.update(task)
    
    def delete_task(self, task_id: str) -> bool:
        """
        Delete a task by ID.
        
        Args:
            task_id: Unique task identifier
        
        Returns:
            True if task was deleted, False if task not found
        
        Raises:
            ValueError: If task_id is None or empty
        """
        if not task_id or not task_id.strip():
            raise ValueError("Task ID cannot be empty")
        
        return self._repository.delete(task_id.strip())
    
    def mark_complete(self, task_id: str) -> Task:
        """
        Mark a task as completed.
        
        Args:
            task_id: Unique task identifier
        
        Returns:
            Updated Task instance
        
        Raises:
            ValueError: If task_id is invalid
        """
        if not task_id or not task_id.strip():
            raise ValueError("Task ID cannot be empty")
        
        task = self._repository.get(task_id.strip())
        if not task:
            raise ValueError(f"Task with ID {task_id} not found")
        
        task.mark_complete()
        return self._repository.update(task)
