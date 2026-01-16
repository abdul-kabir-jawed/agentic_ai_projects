"""Unit tests for MCP tools."""

import pytest
from unittest.mock import AsyncMock, patch
from src.mcp_server.tools import (
    create_task,
    read_tasks,
    update_task,
    delete_task,
    complete_task,
    reschedule_task,
)


@pytest.mark.asyncio
async def test_create_task():
    """Test create_task tool."""
    with patch("src.mcp_server.tools.create_task.httpx.AsyncClient") as mock_client_class:
        mock_response = AsyncMock()
        # json() is a method that returns a dict, not a property
        mock_response.json = lambda: {
            "id": "task-123",
            "description": "Buy milk",
            "priority": "high",
            "tags": ["shopping"],
            "due_date": "2025-12-24",
            "is_completed": False,
            "created_at": "2025-12-23T10:00:00Z"
        }
        mock_response.raise_for_status = AsyncMock()

        mock_client = AsyncMock()
        mock_client.post = AsyncMock(return_value=mock_response)
        mock_client_class.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client_class.return_value.__aexit__ = AsyncMock(return_value=None)

        result = await create_task(
            description="Buy milk",
            priority="high",
            tags=["shopping"],
            due_date="2025-12-24"
        )

        assert result.id == "task-123"
        assert result.description == "Buy milk"
        assert result.priority == "high"
        assert result.is_completed is False


@pytest.mark.asyncio
async def test_read_tasks():
    """Test read_tasks tool."""
    with patch("src.mcp_server.tools.read_tasks.httpx.AsyncClient") as mock_client_class:
        mock_response = AsyncMock()
        mock_response.json = lambda: {
            "tasks": [
                {
                    "id": "task-1",
                    "description": "Buy milk",
                    "priority": "high",
                    "tags": ["shopping"],
                    "due_date": "2025-12-24",
                    "is_completed": False,
                    "created_at": "2025-12-23T10:00:00Z"
                }
            ],
            "total": 1,
            "page": 1,
            "page_size": 50
        }
        mock_response.raise_for_status = AsyncMock()

        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_response)
        mock_client_class.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client_class.return_value.__aexit__ = AsyncMock(return_value=None)

        result = await read_tasks(search="milk")

        assert len(result.tasks) == 1
        assert result.tasks[0].description == "Buy milk"
        assert result.total == 1


@pytest.mark.asyncio
async def test_update_task():
    """Test update_task tool."""
    with patch("src.mcp_server.tools.update_task.httpx.AsyncClient") as mock_client_class:
        mock_response = AsyncMock()
        mock_response.json = lambda: {
            "id": "task-123",
            "description": "Buy milk and bread",
            "priority": "medium",
            "tags": ["shopping"],
            "due_date": "2025-12-25",
            "is_completed": False,
            "created_at": "2025-12-23T10:00:00Z",
            "updated_at": "2025-12-23T11:00:00Z"
        }
        mock_response.raise_for_status = AsyncMock()

        mock_client = AsyncMock()
        mock_client.put = AsyncMock(return_value=mock_response)
        mock_client_class.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client_class.return_value.__aexit__ = AsyncMock(return_value=None)

        result = await update_task(
            task_id="task-123",
            description="Buy milk and bread"
        )

        assert result.id == "task-123"
        assert result.description == "Buy milk and bread"


@pytest.mark.asyncio
async def test_delete_task():
    """Test delete_task tool."""
    with patch("src.mcp_server.tools.delete_task.httpx.AsyncClient") as mock_client_class:
        mock_response = AsyncMock()
        mock_response.raise_for_status = AsyncMock()

        mock_client = AsyncMock()
        mock_client.delete = AsyncMock(return_value=mock_response)
        mock_client_class.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client_class.return_value.__aexit__ = AsyncMock(return_value=None)

        result = await delete_task(task_id="task-123")

        assert result.success is True
        assert result.task_id == "task-123"


@pytest.mark.asyncio
async def test_complete_task():
    """Test complete_task tool."""
    with patch("src.mcp_server.tools.complete_task.httpx.AsyncClient") as mock_client_class:
        mock_response = AsyncMock()
        mock_response.json = lambda: {
            "id": "task-123",
            "description": "Buy milk",
            "is_completed": True,
            "completed_at": "2025-12-23T12:00:00Z"
        }
        mock_response.raise_for_status = AsyncMock()

        mock_client = AsyncMock()
        mock_client.patch = AsyncMock(return_value=mock_response)
        mock_client_class.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client_class.return_value.__aexit__ = AsyncMock(return_value=None)

        result = await complete_task(task_id="task-123")

        assert result.id == "task-123"
        assert result.is_completed is True


@pytest.mark.asyncio
async def test_reschedule_task():
    """Test reschedule_task tool."""
    with patch("src.mcp_server.tools.reschedule_task.httpx.AsyncClient") as mock_client_class:
        mock_response = AsyncMock()
        mock_response.json = lambda: {
            "id": "task-123",
            "description": "Buy milk",
            "due_date": "2025-12-26",
            "priority": "high",
            "updated_at": "2025-12-23T11:30:00Z"
        }
        mock_response.raise_for_status = AsyncMock()

        mock_client = AsyncMock()
        mock_client.put = AsyncMock(return_value=mock_response)
        mock_client_class.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client_class.return_value.__aexit__ = AsyncMock(return_value=None)

        result = await reschedule_task(
            task_id="task-123",
            due_date="2025-12-26"
        )

        assert result.id == "task-123"
        assert result.due_date == "2025-12-26"
