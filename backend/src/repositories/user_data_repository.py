"""UserData repository for database operations."""
from typing import List, Optional, Dict, Any
from datetime import datetime

from sqlmodel import Session, select

from src.models.user_data import UserData, TaskItem, ChatItem, ApiKeysItem, get_utc_now
from src.utils.encryption import encrypt_api_key, decrypt_api_key


class UserDataRepository:
    """Repository for UserData CRUD operations."""

    def __init__(self, session: Session):
        """Initialize repository with database session.

        Args:
            session: SQLModel database session
        """
        self.session = session

    def get_or_create(self, user_id: str, email: str, name: Optional[str] = None) -> UserData:
        """Get existing user data or create new record.

        Args:
            user_id: Better Auth user ID
            email: User email
            name: User name

        Returns:
            UserData instance
        """
        statement = select(UserData).where(UserData.user_id == user_id)
        user_data = self.session.exec(statement).first()

        if not user_data:
            print(f"[USER_DATA_REPO] Creating new user_data for user_id: {user_id}")
            user_data = UserData(
                user_id=user_id,
                email=email,
                name=name,
                tasks=[],
                ai_chats=[],
                api_keys=ApiKeysItem.create(),
            )
            self.session.add(user_data)
            self.session.commit()
            self.session.refresh(user_data)
            print(f"[USER_DATA_REPO] Created user_data with ID: {user_data.id}")

        return user_data

    def get_by_user_id(self, user_id: str) -> Optional[UserData]:
        """Get user data by Better Auth user ID.

        Args:
            user_id: Better Auth user ID

        Returns:
            UserData instance or None
        """
        statement = select(UserData).where(UserData.user_id == user_id)
        return self.session.exec(statement).first()

    def save(self, user_data: UserData) -> UserData:
        """Save user data changes.

        Args:
            user_data: UserData instance to save

        Returns:
            Saved UserData instance
        """
        from sqlalchemy.orm.attributes import flag_modified
        
        user_data.updated_at = get_utc_now()
        
        # Mark JSON columns as modified so SQLAlchemy detects changes
        flag_modified(user_data, "tasks")
        flag_modified(user_data, "ai_chats")
        flag_modified(user_data, "api_keys")
        
        self.session.add(user_data)
        self.session.commit()
        self.session.refresh(user_data)
        return user_data

    # ============ TASK OPERATIONS ============

    def create_task(
        self,
        user_id: str,
        email: str,
        description: str,
        priority: str = "medium",
        tags: Optional[str] = None,
        due_date: Optional[str] = None,
        is_daily: bool = False,
        name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a new task for a user.

        Args:
            user_id: Better Auth user ID
            email: User email
            description: Task description
            priority: Priority level
            tags: Comma-separated tags
            due_date: ISO format due date
            is_daily: Whether task is daily
            name: User name

        Returns:
            Created task dictionary
        """
        user_data = self.get_or_create(user_id, email, name)
        task = TaskItem.create(
            description=description,
            priority=priority,
            tags=tags,
            due_date=due_date,
            is_daily=is_daily,
        )
        user_data.add_task(task)
        self.save(user_data)
        print(f"[USER_DATA_REPO] Created task {task['id']} for user {user_id}")
        return task

    def get_tasks(
        self,
        user_id: str,
        skip: int = 0,
        limit: int = 100,
        is_completed: Optional[bool] = None,
        priority: Optional[str] = None,
        search: Optional[str] = None,
        is_daily: Optional[bool] = None,
    ) -> tuple[List[Dict[str, Any]], int]:
        """Get tasks for a user with filtering.

        Args:
            user_id: Better Auth user ID
            skip: Number of records to skip
            limit: Maximum records to return
            is_completed: Filter by completion status
            priority: Filter by priority
            search: Search in description
            is_daily: Filter by daily status

        Returns:
            Tuple of (filtered tasks, total count)
        """
        user_data = self.get_by_user_id(user_id)
        if not user_data:
            return [], 0

        tasks = user_data.tasks or []

        # Apply filters
        if is_completed is not None:
            tasks = [t for t in tasks if t.get("is_completed") == is_completed]

        if priority:
            tasks = [t for t in tasks if t.get("priority") == priority]

        if search:
            search_lower = search.lower()
            tasks = [t for t in tasks if search_lower in t.get("description", "").lower()]

        if is_daily is not None:
            tasks = [t for t in tasks if t.get("is_daily") == is_daily]

        # Sort by created_at descending
        tasks.sort(key=lambda t: t.get("created_at", ""), reverse=True)

        total = len(tasks)

        # Apply pagination
        tasks = tasks[skip : skip + limit]

        return tasks, total

    def get_task(self, user_id: str, task_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific task by ID.

        Args:
            user_id: Better Auth user ID
            task_id: Task ID

        Returns:
            Task dictionary or None
        """
        user_data = self.get_by_user_id(user_id)
        if not user_data:
            return None
        return user_data.get_task(task_id)

    def find_task_by_description(self, user_id: str, description: str) -> Optional[Dict[str, Any]]:
        """Find a task by description (case-insensitive partial match).

        Args:
            user_id: Better Auth user ID
            description: Task description to search for

        Returns:
            Task dictionary or None if not found
        """
        user_data = self.get_by_user_id(user_id)
        if not user_data:
            return None
        
        description_lower = description.lower().strip()
        
        # Try exact match first
        for task in user_data.tasks:
            if task.get("description", "").lower() == description_lower:
                return task
        
        # Try partial match (contains)
        for task in user_data.tasks:
            task_desc = task.get("description", "").lower()
            if description_lower in task_desc or task_desc in description_lower:
                return task
        
        # Try fuzzy match (starts with)
        for task in user_data.tasks:
            task_desc = task.get("description", "").lower()
            if task_desc.startswith(description_lower) or description_lower.startswith(task_desc):
                return task
        
        return None

    def update_task(self, user_id: str, task_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a task.

        Args:
            user_id: Better Auth user ID
            task_id: Task ID
            updates: Fields to update

        Returns:
            Updated task or None
        """
        user_data = self.get_by_user_id(user_id)
        if not user_data:
            return None

        task = user_data.update_task(task_id, updates)
        if task:
            self.save(user_data)
            print(f"[USER_DATA_REPO] Updated task {task_id} for user {user_id}")
        return task

    def delete_task(self, user_id: str, task_id: str) -> bool:
        """Delete a task.

        Args:
            user_id: Better Auth user ID
            task_id: Task ID

        Returns:
            True if deleted, False if not found
        """
        user_data = self.get_by_user_id(user_id)
        if not user_data:
            return False

        deleted = user_data.delete_task(task_id)
        if deleted:
            self.save(user_data)
            print(f"[USER_DATA_REPO] Deleted task {task_id} for user {user_id}")
        return deleted

    def get_daily_tasks(self, user_id: str) -> List[Dict[str, Any]]:
        """Get daily tasks for a user.

        Args:
            user_id: Better Auth user ID

        Returns:
            List of daily tasks
        """
        tasks, _ = self.get_tasks(user_id, is_daily=True)
        return tasks

    def get_task_stats(self, user_id: str) -> Dict[str, Any]:
        """Get task statistics for a user.

        Args:
            user_id: Better Auth user ID

        Returns:
            Task statistics dictionary
        """
        user_data = self.get_by_user_id(user_id)
        if not user_data:
            return {
                "total_tasks": 0,
                "completed_tasks": 0,
                "pending_tasks": 0,
                "completion_rate": 0.0,
            }
        return user_data.get_task_stats()

    # ============ CHAT OPERATIONS ============

    def add_chat_message(
        self,
        user_id: str,
        email: str,
        role: str,
        content: str,
        name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Add a chat message (with FIFO limit of 10).

        Args:
            user_id: Better Auth user ID
            email: User email
            role: Message role (user/assistant)
            content: Message content
            name: User name

        Returns:
            Created message dictionary
        """
        user_data = self.get_or_create(user_id, email, name)
        message = user_data.add_chat_message(role, content)
        self.save(user_data)
        print(f"[USER_DATA_REPO] Added chat message for user {user_id}, total: {len(user_data.ai_chats)}")
        return message

    def get_chat_history(self, user_id: str) -> List[Dict[str, Any]]:
        """Get chat history for a user (max 10 messages).

        Args:
            user_id: Better Auth user ID

        Returns:
            List of chat messages
        """
        user_data = self.get_by_user_id(user_id)
        if not user_data:
            return []
        return user_data.ai_chats or []

    def clear_chat_history(self, user_id: str) -> int:
        """Clear chat history for a user.

        Args:
            user_id: Better Auth user ID

        Returns:
            Number of messages cleared
        """
        user_data = self.get_by_user_id(user_id)
        if not user_data:
            return 0

        count = user_data.clear_chat_history()
        self.save(user_data)
        print(f"[USER_DATA_REPO] Cleared {count} chat messages for user {user_id}")
        return count

    # ============ API KEY OPERATIONS ============

    def update_api_keys(
        self,
        user_id: str,
        email: str,
        gemini_key: Optional[str] = None,
        openai_key: Optional[str] = None,
        name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Update API keys (encrypts before storing).

        Args:
            user_id: Better Auth user ID
            email: User email
            gemini_key: Plain text Gemini API key (or None to keep existing)
            openai_key: Plain text OpenAI API key (or None to keep existing)
            name: User name

        Returns:
            API keys status (not the actual keys)
        """
        user_data = self.get_or_create(user_id, email, name)

        # Get existing keys
        existing_keys = user_data.api_keys or {}

        # Encrypt and update keys
        new_keys = {
            "gemini": encrypt_api_key(gemini_key) if gemini_key else existing_keys.get("gemini", ""),
            "openai": encrypt_api_key(openai_key) if openai_key else existing_keys.get("openai", ""),
            "updated_at": get_utc_now().isoformat(),
        }

        user_data.api_keys = new_keys
        self.save(user_data)
        print(f"[USER_DATA_REPO] Updated API keys for user {user_id}")

        return {
            "gemini_configured": bool(new_keys.get("gemini")),
            "openai_configured": bool(new_keys.get("openai")),
            "updated_at": new_keys.get("updated_at"),
        }

    def get_api_keys(self, user_id: str) -> Dict[str, str]:
        """Get decrypted API keys for a user.

        Args:
            user_id: Better Auth user ID

        Returns:
            Dictionary with decrypted API keys
        """
        user_data = self.get_by_user_id(user_id)
        if not user_data or not user_data.api_keys:
            return {"gemini": "", "openai": ""}

        return {
            "gemini": decrypt_api_key(user_data.api_keys.get("gemini", "")),
            "openai": decrypt_api_key(user_data.api_keys.get("openai", "")),
        }

    def has_api_keys(self, user_id: str) -> bool:
        """Check if user has any API keys configured.

        Args:
            user_id: Better Auth user ID

        Returns:
            True if at least one API key is set
        """
        user_data = self.get_by_user_id(user_id)
        if not user_data:
            return False
        return user_data.has_api_keys()

    def get_api_keys_status(self, user_id: str) -> Dict[str, Any]:
        """Get API keys configuration status (without revealing keys).

        Args:
            user_id: Better Auth user ID

        Returns:
            API keys status dictionary
        """
        user_data = self.get_by_user_id(user_id)
        if not user_data:
            print(f"[API_KEY_CHECK] User {user_id} not found in user_data")
            return {
                "gemini_configured": False,
                "openai_configured": False,
                "has_any": False,
            }
        
        if not user_data.api_keys:
            print(f"[API_KEY_CHECK] User {user_id} has no api_keys field")
            return {
                "gemini_configured": False,
                "openai_configured": False,
                "has_any": False,
            }

        # Check if keys are non-empty (encrypted keys are always non-empty if set)
        gemini_key = user_data.api_keys.get("gemini", "") or ""
        openai_key = user_data.api_keys.get("openai", "") or ""
        
        # Strip whitespace for checking
        gemini_key = gemini_key.strip() if isinstance(gemini_key, str) else ""
        openai_key = openai_key.strip() if isinstance(openai_key, str) else ""
        
        gemini_configured = bool(gemini_key)
        openai_configured = bool(openai_key)
        has_any = bool(gemini_configured or openai_configured)
        
        print(f"[API_KEY_CHECK] User {user_id}: gemini={gemini_configured}, openai={openai_configured}, has_any={has_any}")
        
        return {
            "gemini_configured": gemini_configured,
            "openai_configured": openai_configured,
            "has_any": has_any,
        }

    def delete_api_keys(self, user_id: str) -> bool:
        """Delete all API keys for a user.

        Args:
            user_id: Better Auth user ID

        Returns:
            True if deleted, False if user not found
        """
        user_data = self.get_by_user_id(user_id)
        if not user_data:
            return False

        user_data.api_keys = ApiKeysItem.create()
        self.save(user_data)
        print(f"[USER_DATA_REPO] Deleted API keys for user {user_id}")
        return True
