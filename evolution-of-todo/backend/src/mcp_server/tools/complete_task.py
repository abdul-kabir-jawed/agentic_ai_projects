"""MCP Tool for marking tasks as complete via the backend API."""

import httpx
from pydantic import BaseModel


class CompleteTaskOutput(BaseModel):
    """Output from complete_task tool."""
    id: str
    description: str
    is_completed: bool
    completed_at: str


async def complete_task(
    task_id: str,
    api_base_url: str = "http://localhost:8000"
) -> CompleteTaskOutput:
    """
    Mark a task as complete via the backend API.

    Args:
        task_id: ID of the task to mark complete (required)
        api_base_url: Base URL for the backend API

    Returns:
        Task with completion status

    Raises:
        httpx.HTTPError: If API call fails
    """
    async with httpx.AsyncClient() as client:
        response = await client.patch(
            f"{api_base_url}/api/v1/tasks/{task_id}/complete",
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()

        data = response.json()
        return CompleteTaskOutput(**data)
