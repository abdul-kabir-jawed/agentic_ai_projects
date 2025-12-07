"""Task domain model for Phase I."""

from datetime import datetime
from typing import Optional
import uuid



class Task:
    """
    Domain model representing a todo task.
    
    Attributes:
        id: Unique identifier for the task (UUID string)
        description: Task description text
        is_completed: Whether the task is completed
        created_at: Timestamp when the task was created
    """
    
    def __init__(
        self,
        description: str,
        task_id: Optional[str] = None,
        is_completed: bool = False,
        created_at: Optional[datetime] = None,
    ):
        """
        Initialize a Task instance.
        
        Args:
            description: Task description (required, non-empty)
            task_id: Optional task ID (generates UUID if not provided)
            is_completed: Whether task is completed (default: False)
            created_at: Optional creation timestamp (uses current time if not provided)
        
        Raises:
            ValueError: If description is empty or None
        """
        if not description or not description.strip():
            raise ValueError("Task description cannot be empty")
        
        self.id = task_id or str(uuid.uuid4())[:8]
        self.description = description.strip()
        self.is_completed = is_completed
        self.created_at = created_at or datetime.now()
    
    def mark_complete(self) -> None:
        """Mark this task as completed."""
        self.is_completed = True
    
    def mark_incomplete(self) -> None:
        """Mark this task as incomplete."""
        self.is_completed = False
    
    def update_description(self, new_description: str) -> None:
        """
        Update the task description.
        
        Args:
            new_description: New description text
        
        Raises:
            ValueError: If new_description is empty or None
        """
        if not new_description or not new_description.strip():
            raise ValueError("Task description cannot be empty")
        
        self.description = new_description.strip()
    
    def __repr__(self) -> str:
        """Return string representation of the task."""
        status = "✓" if self.is_completed else "○"
        return f"Task(id={self.id[:8]}..., description='{self.description}', status={status})"
    
    def __eq__(self, other: object) -> bool:
        """Check equality based on task ID."""
        if not isinstance(other, Task):
            return False
        return self.id == other.id
