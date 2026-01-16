"""MCP Tool for deleting tasks via the backend API."""

import httpx
from pydantic import BaseModel


class DeleteTaskOutput(BaseModel):
    """Output from delete_task tool."""
    success: bool
    message: str
    task_id: str


async def delete_task(
    task_id: str,
    api_base_url: str = "http://localhost:8000"
) -> DeleteTaskOutput:
    """
    Delete a task via the backend API.

    Args:
        task_id: ID of the task to delete (required)
        api_base_url: Base URL for the backend API

    Returns:
        Confirmation of deletion

    Raises:
        httpx.HTTPError: If API call fails
    """
    async with httpx.AsyncClient() as client:
        response = await client.delete(
            f"{api_base_url}/api/v1/tasks/{task_id}",
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()

        return DeleteTaskOutput(
            success=True,
            message=f"Task {task_id} deleted successfully",
            task_id=task_id
        )
