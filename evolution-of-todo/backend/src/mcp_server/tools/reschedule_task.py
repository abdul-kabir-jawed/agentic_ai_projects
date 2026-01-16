"""MCP Tool for rescheduling tasks (updating due date) via the backend API."""

import httpx
from pydantic import BaseModel


class RescheduleTaskOutput(BaseModel):
    """Output from reschedule_task tool."""
    id: str
    description: str
    due_date: str
    priority: str
    updated_at: str


async def reschedule_task(
    task_id: str,
    due_date: str,
    api_base_url: str = "http://localhost:8000"
) -> RescheduleTaskOutput:
    """
    Reschedule a task by updating its due date via the backend API.

    Args:
        task_id: ID of the task to reschedule (required)
        due_date: New due date in ISO format (YYYY-MM-DD) (required)
        api_base_url: Base URL for the backend API

    Returns:
        Updated task with new due date

    Raises:
        httpx.HTTPError: If API call fails
    """
    async with httpx.AsyncClient() as client:
        payload = {"due_date": due_date}

        response = await client.put(
            f"{api_base_url}/api/v1/tasks/{task_id}",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()

        data = response.json()
        return RescheduleTaskOutput(**data)
