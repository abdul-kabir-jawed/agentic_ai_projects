"""MCP Tool for updating tasks via the backend API."""

import httpx
from typing import Optional
from pydantic import BaseModel


class UpdateTaskInput(BaseModel):
    """Input for update_task tool."""
    task_id: str
    description: Optional[str] = None
    priority: Optional[str] = None
    tags: Optional[list[str]] = None
    due_date: Optional[str] = None


class UpdateTaskOutput(BaseModel):
    """Output from update_task tool."""
    id: str
    description: str
    priority: str
    tags: list[str]
    due_date: Optional[str]
    is_completed: bool
    created_at: str
    updated_at: str


async def update_task(
    task_id: str,
    description: Optional[str] = None,
    priority: Optional[str] = None,
    tags: Optional[list[str]] = None,
    due_date: Optional[str] = None,
    api_base_url: str = "http://localhost:8000"
) -> UpdateTaskOutput:
    """
    Update an existing task via the backend API.

    Args:
        task_id: ID of the task to update (required)
        description: New task description
        priority: New priority (low, medium, high)
        tags: New list of tags
        due_date: New due date in ISO format (YYYY-MM-DD)
        api_base_url: Base URL for the backend API

    Returns:
        Updated task with new metadata

    Raises:
        httpx.HTTPError: If API call fails
    """
    async with httpx.AsyncClient() as client:
        payload = {}
        if description is not None:
            payload["description"] = description
        if priority is not None:
            payload["priority"] = priority
        if tags is not None:
            payload["tags"] = tags
        if due_date is not None:
            payload["due_date"] = due_date

        response = await client.put(
            f"{api_base_url}/api/v1/tasks/{task_id}",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()

        data = response.json()
        return UpdateTaskOutput(**data)
