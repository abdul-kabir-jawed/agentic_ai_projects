"""MCP Server for Todo Management."""

import json
import logging
from typing import Any

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent, ToolResultContent

from .tools import (
    create_task,
    read_tasks,
    update_task,
    delete_task,
    complete_task,
    reschedule_task,
)

logger = logging.getLogger(__name__)

# Initialize MCP server
server = Server("evolution-of-todo")


@server.list_tools()
async def list_tools() -> list[Tool]:
    """List all available MCP tools."""
    return [
        Tool(
            name="create_task",
            description="Create a new task with description, priority, tags, and due date",
            inputSchema={
                "type": "object",
                "properties": {
                    "description": {
                        "type": "string",
                        "description": "Task description (required)"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high"],
                        "description": "Task priority (default: medium)"
                    },
                    "tags": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of tags for the task"
                    },
                    "due_date": {
                        "type": "string",
                        "description": "Due date in ISO format (YYYY-MM-DD)"
                    }
                },
                "required": ["description"]
            }
        ),
        Tool(
            name="read_tasks",
            description="Read/list tasks with optional search, filter, and sort parameters",
            inputSchema={
                "type": "object",
                "properties": {
                    "search": {
                        "type": "string",
                        "description": "Search query for task descriptions"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high"],
                        "description": "Filter by priority"
                    },
                    "tags": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Filter by tags"
                    },
                    "is_completed": {
                        "type": "boolean",
                        "description": "Filter by completion status"
                    },
                    "sort_by": {
                        "type": "string",
                        "enum": ["due_date", "priority", "created_at"],
                        "description": "Sort field (default: created_at)"
                    },
                    "sort_order": {
                        "type": "string",
                        "enum": ["asc", "desc"],
                        "description": "Sort order (default: desc)"
                    },
                    "page": {
                        "type": "integer",
                        "description": "Page number (default: 1)"
                    },
                    "page_size": {
                        "type": "integer",
                        "description": "Tasks per page (default: 50)"
                    }
                }
            }
        ),
        Tool(
            name="update_task",
            description="Update an existing task",
            inputSchema={
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "ID of the task to update (required)"
                    },
                    "description": {
                        "type": "string",
                        "description": "New task description"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high"],
                        "description": "New priority"
                    },
                    "tags": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "New list of tags"
                    },
                    "due_date": {
                        "type": "string",
                        "description": "New due date in ISO format (YYYY-MM-DD)"
                    }
                },
                "required": ["task_id"]
            }
        ),
        Tool(
            name="delete_task",
            description="Delete a task by ID",
            inputSchema={
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "ID of the task to delete (required)"
                    }
                },
                "required": ["task_id"]
            }
        ),
        Tool(
            name="complete_task",
            description="Mark a task as complete",
            inputSchema={
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "ID of the task to mark complete (required)"
                    }
                },
                "required": ["task_id"]
            }
        ),
        Tool(
            name="reschedule_task",
            description="Reschedule a task by updating its due date",
            inputSchema={
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "ID of the task to reschedule (required)"
                    },
                    "due_date": {
                        "type": "string",
                        "description": "New due date in ISO format (YYYY-MM-DD) (required)"
                    }
                },
                "required": ["task_id", "due_date"]
            }
        )
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent | ToolResultContent]:
    """Execute a tool by name with the given arguments."""
    logger.info(f"Calling tool: {name} with args: {arguments}")

    try:
        if name == "create_task":
            result = await create_task(**arguments)
            return [TextContent(
                type="text",
                text=json.dumps(result.dict())
            )]

        elif name == "read_tasks":
            result = await read_tasks(**arguments)
            return [TextContent(
                type="text",
                text=json.dumps(result.dict())
            )]

        elif name == "update_task":
            result = await update_task(**arguments)
            return [TextContent(
                type="text",
                text=json.dumps(result.dict())
            )]

        elif name == "delete_task":
            result = await delete_task(**arguments)
            return [TextContent(
                type="text",
                text=json.dumps(result.dict())
            )]

        elif name == "complete_task":
            result = await complete_task(**arguments)
            return [TextContent(
                type="text",
                text=json.dumps(result.dict())
            )]

        elif name == "reschedule_task":
            result = await reschedule_task(**arguments)
            return [TextContent(
                type="text",
                text=json.dumps(result.dict())
            )]

        else:
            return [TextContent(
                type="text",
                text=f"Unknown tool: {name}"
            )]

    except Exception as e:
        logger.error(f"Error calling tool {name}: {str(e)}")
        return [TextContent(
            type="text",
            text=f"Error: {str(e)}"
        )]


async def main():
    """Run the MCP server."""
    async with stdio_server(server) as streams:
        await streams.wait_closed()


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
