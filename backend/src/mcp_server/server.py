"""
MCP Server for Todo Management (OPTIMIZED)

BEST PRACTICES APPLIED:
✅ Comprehensive error handling with custom exceptions
✅ Input validation with Pydantic schemas
✅ Logging for observability and debugging
✅ Type safety throughout
✅ Async/await for I/O operations
✅ Consistent response format
✅ Security considerations (rate limiting ready)
✅ Proper separation of concerns
"""

import json
import logging
from typing import Any, Optional, Dict, List
from datetime import datetime

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent, ToolResultContent
from pydantic import BaseModel, Field, validator

from .tools import (
    create_task,
    read_tasks,
    update_task,
    delete_task,
    complete_task,
    reschedule_task,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============================================================================
# PYDANTIC SCHEMAS FOR VALIDATION
# ============================================================================

class TaskCreateInput(BaseModel):
    """Input validation for task creation."""
    description: str = Field(..., min_length=1, max_length=500)
    priority: str = Field(default="medium", pattern="^(low|medium|high)$")
    tags: Optional[List[str]] = Field(default=None, max_items=10)
    due_date: Optional[str] = Field(default=None)
    
    @validator('description')
    def description_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Description cannot be empty')
        return v.strip()
    
    @validator('due_date')
    def validate_date_format(cls, v):
        if v:
            try:
                datetime.fromisoformat(v.replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                raise ValueError('Invalid date format. Use YYYY-MM-DD')
        return v


class TaskUpdateInput(BaseModel):
    """Input validation for task updates."""
    task_id: str = Field(..., min_length=1)
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$")
    tags: Optional[List[str]] = Field(None, max_items=10)
    due_date: Optional[str] = None


class TaskQueryInput(BaseModel):
    """Input validation for task queries."""
    search: Optional[str] = Field(None, max_length=200)
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$")
    tags: Optional[List[str]] = Field(None, max_items=10)
    is_completed: Optional[bool] = None
    sort_by: str = Field(default="created_at", pattern="^(due_date|priority|created_at)$")
    sort_order: str = Field(default="desc", pattern="^(asc|desc)$")
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=50, ge=1, le=100)


# ============================================================================
# CUSTOM EXCEPTIONS
# ============================================================================

class MCPError(Exception):
    """Base exception for MCP operations."""
    pass


class ValidationError(MCPError):
    """Raised when input validation fails."""
    pass


class ToolExecutionError(MCPError):
    """Raised when tool execution fails."""
    pass


# ============================================================================
# MCP SERVER INITIALIZATION
# ============================================================================

server = Server("evolution-of-todo")

# Server metadata
SERVER_VERSION = "1.0.0"
SERVER_DESCRIPTION = "MCP server for Evolution of Todo task management"


@server.list_tools()
async def list_tools() -> List[Tool]:
    """
    List all available MCP tools with comprehensive schemas.
    
    Returns:
        List of Tool definitions with input schemas
    """
    logger.info("Listing available MCP tools")
    
    return [
        Tool(
            name="create_task",
            description=(
                "Create a new task with description, priority, tags, and due date. "
                "Returns the created task with its unique ID."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "description": {
                        "type": "string",
                        "description": "Task description (1-500 characters, required)",
                        "minLength": 1,
                        "maxLength": 500
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high"],
                        "default": "medium",
                        "description": "Task priority level"
                    },
                    "tags": {
                        "type": "array",
                        "items": {"type": "string"},
                        "maxItems": 10,
                        "description": "List of tags for categorization"
                    },
                    "due_date": {
                        "type": "string",
                        "format": "date",
                        "description": "Due date in ISO format (YYYY-MM-DD)"
                    }
                },
                "required": ["description"]
            }
        ),
        
        Tool(
            name="read_tasks",
            description=(
                "Read/list tasks with advanced search, filter, and sort capabilities. "
                "Supports pagination for large task lists."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "search": {
                        "type": "string",
                        "maxLength": 200,
                        "description": "Search query for task descriptions"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high"],
                        "description": "Filter by priority level"
                    },
                    "tags": {
                        "type": "array",
                        "items": {"type": "string"},
                        "maxItems": 10,
                        "description": "Filter by tags (AND logic)"
                    },
                    "is_completed": {
                        "type": "boolean",
                        "description": "Filter by completion status"
                    },
                    "sort_by": {
                        "type": "string",
                        "enum": ["due_date", "priority", "created_at"],
                        "default": "created_at",
                        "description": "Field to sort by"
                    },
                    "sort_order": {
                        "type": "string",
                        "enum": ["asc", "desc"],
                        "default": "desc",
                        "description": "Sort order (ascending/descending)"
                    },
                    "page": {
                        "type": "integer",
                        "minimum": 1,
                        "default": 1,
                        "description": "Page number for pagination"
                    },
                    "page_size": {
                        "type": "integer",
                        "minimum": 1,
                        "maximum": 100,
                        "default": 50,
                        "description": "Number of tasks per page"
                    }
                }
            }
        ),
        
        Tool(
            name="update_task",
            description=(
                "Update an existing task's properties. "
                "Only provided fields will be updated."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "ID of the task to update (required)",
                        "minLength": 1
                    },
                    "description": {
                        "type": "string",
                        "minLength": 1,
                        "maxLength": 500,
                        "description": "New task description"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high"],
                        "description": "New priority level"
                    },
                    "tags": {
                        "type": "array",
                        "items": {"type": "string"},
                        "maxItems": 10,
                        "description": "New list of tags"
                    },
                    "due_date": {
                        "type": "string",
                        "format": "date",
                        "description": "New due date in ISO format"
                    }
                },
                "required": ["task_id"]
            }
        ),
        
        Tool(
            name="delete_task",
            description=(
                "Permanently delete a task by ID. "
                "This action cannot be undone."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "ID of the task to delete (required)",
                        "minLength": 1
                    }
                },
                "required": ["task_id"]
            }
        ),
        
        Tool(
            name="complete_task",
            description=(
                "Mark a task as complete. "
                "Records completion timestamp and updates status."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "ID of the task to mark complete (required)",
                        "minLength": 1
                    }
                },
                "required": ["task_id"]
            }
        ),
        
        Tool(
            name="reschedule_task",
            description=(
                "Reschedule a task by updating its due date. "
                "Useful for postponing or advancing deadlines."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "string",
                        "description": "ID of the task to reschedule (required)",
                        "minLength": 1
                    },
                    "due_date": {
                        "type": "string",
                        "format": "date",
                        "description": "New due date in ISO format (YYYY-MM-DD) (required)"
                    }
                },
                "required": ["task_id", "due_date"]
            }
        )
    ]


# ============================================================================
# TOOL EXECUTION
# ============================================================================

@server.call_tool()
async def call_tool(
    name: str, 
    arguments: Dict[str, Any]
) -> List[TextContent | ToolResultContent]:
    """
    Execute a tool by name with the given arguments.
    
    Args:
        name: Tool name to execute
        arguments: Tool arguments as dictionary
    
    Returns:
        List of content items (text or tool results)
    
    Raises:
        ToolExecutionError: If tool execution fails
    """
    logger.info(f"Executing tool: {name} with args: {arguments}")
    
    try:
        # Route to appropriate tool handler
        if name == "create_task":
            result = await _handle_create_task(arguments)
            
        elif name == "read_tasks":
            result = await _handle_read_tasks(arguments)
            
        elif name == "update_task":
            result = await _handle_update_task(arguments)
            
        elif name == "delete_task":
            result = await _handle_delete_task(arguments)
            
        elif name == "complete_task":
            result = await _handle_complete_task(arguments)
            
        elif name == "reschedule_task":
            result = await _handle_reschedule_task(arguments)
            
        else:
            logger.error(f"Unknown tool requested: {name}")
            return [TextContent(
                type="text",
                text=json.dumps({
                    "error": True,
                    "message": f"Unknown tool: {name}"
                })
            )]
        
        logger.info(f"Tool {name} executed successfully")
        
        return [TextContent(
            type="text",
            text=json.dumps(result)
        )]
        
    except ValidationError as e:
        logger.error(f"Validation error in tool {name}: {str(e)}")
        return [TextContent(
            type="text",
            text=json.dumps({
                "error": True,
                "error_type": "validation_error",
                "message": str(e)
            })
        )]
        
    except Exception as e:
        logger.error(f"Error executing tool {name}: {str(e)}", exc_info=True)
        return [TextContent(
            type="text",
            text=json.dumps({
                "error": True,
                "error_type": "execution_error",
                "message": f"Failed to execute tool: {str(e)}"
            })
        )]


# ============================================================================
# TOOL HANDLERS (with validation)
# ============================================================================

async def _handle_create_task(arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Handle create_task tool execution."""
    # Validate input
    validated = TaskCreateInput(**arguments)
    
    result = await create_task(
        description=validated.description,
        priority=validated.priority,
        tags=validated.tags,
        due_date=validated.due_date
    )
    
    return result.dict()


async def _handle_read_tasks(arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Handle read_tasks tool execution."""
    # Validate input
    validated = TaskQueryInput(**arguments)
    
    result = await read_tasks(
        search=validated.search,
        priority=validated.priority,
        tags=validated.tags,
        is_completed=validated.is_completed,
        sort_by=validated.sort_by,
        sort_order=validated.sort_order,
        page=validated.page,
        page_size=validated.page_size
    )
    
    return result.dict()


async def _handle_update_task(arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Handle update_task tool execution."""
    # Validate input
    validated = TaskUpdateInput(**arguments)
    
    result = await update_task(
        task_id=validated.task_id,
        description=validated.description,
        priority=validated.priority,
        tags=validated.tags,
        due_date=validated.due_date
    )
    
    return result.dict()


async def _handle_delete_task(arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Handle delete_task tool execution."""
    task_id = arguments.get("task_id")
    if not task_id:
        raise ValidationError("task_id is required")
    
    result = await delete_task(task_id=task_id)
    return result.dict()


async def _handle_complete_task(arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Handle complete_task tool execution."""
    task_id = arguments.get("task_id")
    if not task_id:
        raise ValidationError("task_id is required")
    
    result = await complete_task(task_id=task_id)
    return result.dict()


async def _handle_reschedule_task(arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Handle reschedule_task tool execution."""
    task_id = arguments.get("task_id")
    due_date = arguments.get("due_date")
    
    if not task_id or not due_date:
        raise ValidationError("task_id and due_date are required")
    
    result = await reschedule_task(
        task_id=task_id,
        due_date=due_date
    )
    
    return result.dict()


# ============================================================================
# SERVER LIFECYCLE
# ============================================================================

async def main():
    """
    Run the MCP server with stdio transport.
    
    This is the main entry point for the MCP server.
    """
    logger.info(f"Starting MCP server: {SERVER_DESCRIPTION} v{SERVER_VERSION}")
    
    try:
        async with stdio_server(server) as streams:
            logger.info("MCP server started successfully")
            await streams.wait_closed()
            
    except KeyboardInterrupt:
        logger.info("MCP server shutting down (KeyboardInterrupt)")
        
    except Exception as e:
        logger.error(f"MCP server error: {str(e)}", exc_info=True)
        raise
        
    finally:
        logger.info("MCP server stopped")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
    