"""
Tests for MCP server functionality.
"""

import pytest
import json
from unittest.mock import AsyncMock, MagicMock, patch

from src.mcp_server.server import list_tools, call_tool


class TestListTools:
    """Test list_tools function."""

    @pytest.mark.asyncio
    async def test_list_tools_returns_all_tools(self):
        """Test that list_tools returns all available tools."""
        tools = await list_tools()

        # Should return a list of tools
        assert isinstance(tools, list)
        assert len(tools) == 6

        # Check tool names
        tool_names = [tool.name for tool in tools]
        assert "create_task" in tool_names
        assert "read_tasks" in tool_names
        assert "update_task" in tool_names
        assert "delete_task" in tool_names
        assert "complete_task" in tool_names
        assert "reschedule_task" in tool_names

    @pytest.mark.asyncio
    async def test_create_task_tool_schema(self):
        """Test create_task tool schema."""
        tools = await list_tools()
        create_task_tool = [t for t in tools if t.name == "create_task"][0]

        # Check input schema
        assert create_task_tool.inputSchema is not None
        assert "properties" in create_task_tool.inputSchema
        assert "description" in create_task_tool.inputSchema["properties"]
        assert "priority" in create_task_tool.inputSchema["properties"]
        assert "tags" in create_task_tool.inputSchema["properties"]

    @pytest.mark.asyncio
    async def test_read_tasks_tool_schema(self):
        """Test read_tasks tool schema."""
        tools = await list_tools()
        read_tasks_tool = [t for t in tools if t.name == "read_tasks"][0]

        # Check input schema
        assert read_tasks_tool.inputSchema is not None
        assert "properties" in read_tasks_tool.inputSchema


class TestCallTool:
    """Test call_tool function."""

    @pytest.mark.asyncio
    @patch('src.mcp_server.server.create_task')
    async def test_call_create_task(self, mock_create):
        """Test calling create_task tool."""
        mock_result = MagicMock()
        mock_result.dict = MagicMock(return_value={
            "id": "task-1",
            "description": "Test task",
            "priority": "high",
        })
        mock_create.return_value = mock_result

        result = await call_tool("create_task", {
            "description": "Test task",
            "priority": "high",
        })

        assert isinstance(result, list)
        assert len(result) > 0
        assert result[0].type == "text"

    @pytest.mark.asyncio
    @patch('src.mcp_server.server.read_tasks')
    async def test_call_read_tasks(self, mock_read):
        """Test calling read_tasks tool."""
        mock_result = MagicMock()
        mock_result.dict = MagicMock(return_value={
            "tasks": [],
            "total": 0,
            "page": 1,
            "page_size": 50,
        })
        mock_read.return_value = mock_result

        result = await call_tool("read_tasks", {})

        assert isinstance(result, list)
        assert len(result) > 0

    @pytest.mark.asyncio
    async def test_call_unknown_tool(self):
        """Test calling an unknown tool."""
        result = await call_tool("unknown_tool", {})

        assert isinstance(result, list)
        assert len(result) > 0
        assert "Unknown tool" in result[0].text

    @pytest.mark.asyncio
    @patch('src.mcp_server.server.update_task')
    async def test_call_update_task(self, mock_update):
        """Test calling update_task tool."""
        mock_result = MagicMock()
        mock_result.dict = MagicMock(return_value={
            "id": "task-1",
            "description": "Updated task",
        })
        mock_update.return_value = mock_result

        result = await call_tool("update_task", {
            "task_id": "task-1",
            "description": "Updated task",
        })

        assert isinstance(result, list)
        assert len(result) > 0

    @pytest.mark.asyncio
    @patch('src.mcp_server.server.delete_task')
    async def test_call_delete_task(self, mock_delete):
        """Test calling delete_task tool."""
        mock_result = MagicMock()
        mock_result.dict = MagicMock(return_value={
            "success": True,
            "task_id": "task-1",
        })
        mock_delete.return_value = mock_result

        result = await call_tool("delete_task", {"task_id": "task-1"})

        assert isinstance(result, list)
        assert len(result) > 0

    @pytest.mark.asyncio
    @patch('src.mcp_server.server.complete_task')
    async def test_call_complete_task(self, mock_complete):
        """Test calling complete_task tool."""
        mock_result = MagicMock()
        mock_result.dict = MagicMock(return_value={
            "id": "task-1",
            "is_completed": True,
        })
        mock_complete.return_value = mock_result

        result = await call_tool("complete_task", {"task_id": "task-1"})

        assert isinstance(result, list)
        assert len(result) > 0

    @pytest.mark.asyncio
    @patch('src.mcp_server.server.reschedule_task')
    async def test_call_reschedule_task(self, mock_reschedule):
        """Test calling reschedule_task tool."""
        mock_result = MagicMock()
        mock_result.dict = MagicMock(return_value={
            "id": "task-1",
            "due_date": "2025-12-25",
        })
        mock_reschedule.return_value = mock_result

        result = await call_tool("reschedule_task", {
            "task_id": "task-1",
            "due_date": "2025-12-25",
        })

        assert isinstance(result, list)
        assert len(result) > 0

    @pytest.mark.asyncio
    @patch('src.mcp_server.server.create_task')
    async def test_call_tool_exception_handling(self, mock_create):
        """Test exception handling in call_tool."""
        mock_create.side_effect = Exception("Test error")

        result = await call_tool("create_task", {"description": "Test"})

        assert isinstance(result, list)
        assert len(result) > 0
        assert "Error" in result[0].text or "error" in result[0].text.lower()
