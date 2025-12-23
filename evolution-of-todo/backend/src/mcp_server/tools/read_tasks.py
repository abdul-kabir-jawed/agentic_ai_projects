"""MCP Tool for reading/listing tasks with search and filter support."""

import httpx
from typing import Optional
from pydantic import BaseModel


class TaskItem(BaseModel):
    """Representation of a task."""
    id: str
    description: str
    priority: str
    tags: list[str]
    due_date: Optional[str]
    is_completed: bool
    created_at: str


class ReadTasksOutput(BaseModel):
    """Output from read_tasks tool."""
    tasks: list[TaskItem]
    total: int
    page: int
    page_size: int


async def read_tasks(
    search: Optional[str] = None,
    priority: Optional[str] = None,
    tags: Optional[list[str]] = None,
    is_completed: Optional[bool] = None,
    sort_by: Optional[str] = "created_at",
    sort_order: Optional[str] = "desc",
    page: int = 1,
    page_size: int = 50,
    api_base_url: str = "http://localhost:8000"
) -> ReadTasksOutput:
    """
    Read/list tasks from the backend API with search and filter support.

    Args:
        search: Search query for task descriptions
        priority: Filter by priority (low, medium, high)
        tags: Filter by tags (list of tag names)
        is_completed: Filter by completion status
        sort_by: Sort field (due_date, priority, created_at)
        sort_order: Sort order (asc, desc)
        page: Page number (1-indexed)
        page_size: Number of tasks per page
        api_base_url: Base URL for the backend API

    Returns:
        List of tasks with pagination info

    Raises:
        httpx.HTTPError: If API call fails
    """
    async with httpx.AsyncClient() as client:
        params = {
            "page": page,
            "page_size": page_size,
            "sort_by": sort_by,
            "sort_order": sort_order
        }

        if search:
            params["search"] = search
        if priority:
            params["priority"] = priority
        if is_completed is not None:
            params["is_completed"] = is_completed
        if tags:
            params["tags"] = ",".join(tags)

        response = await client.get(
            f"{api_base_url}/api/v1/tasks",
            params=params,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()

        data = response.json()
        return ReadTasksOutput(**data)
