"""MCP Tool for creating tasks via the backend API."""

import httpx
from typing import Optional
from pydantic import BaseModel


class CreateTaskInput(BaseModel):
    """Input for create_task tool."""
    description: str
    priority: Optional[str] = "medium"
    tags: Optional[list[str]] = None
    due_date: Optional[str] = None


class CreateTaskOutput(BaseModel):
    """Output from create_task tool."""
    id: str
    description: str
    priority: str
    tags: list[str]
    due_date: Optional[str]
    is_completed: bool
    created_at: str


async def create_task(
    description: str,
    priority: str = "medium",
    tags: Optional[list[str]] = None,
    due_date: Optional[str] = None,
    api_base_url: str = "http://localhost:8000"
) -> CreateTaskOutput:
    """
    Create a new task via the backend API.

    Args:
        description: Task description (required)
        priority: Task priority (low, medium, high)
        tags: List of tags for the task
        due_date: Due date in ISO format (YYYY-MM-DD)
        api_base_url: Base URL for the backend API

    Returns:
        Created task with ID and metadata

    Raises:
        httpx.HTTPError: If API call fails
    """
    async with httpx.AsyncClient() as client:
        payload = {
            "description": description,
            "priority": priority,
            "tags": tags or [],
            "due_date": due_date
        }

        response = await client.post(
            f"{api_base_url}/api/v1/tasks",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()

        data = response.json()
        return CreateTaskOutput(**data)
