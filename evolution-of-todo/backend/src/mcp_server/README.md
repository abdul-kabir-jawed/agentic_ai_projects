# MCP Server for Evolution of Todo

This is a Model Context Protocol (MCP) server that provides tools for managing tasks via natural language through an AI agent.

## Overview

The MCP server implements a set of tools that allow the todo agent to interact with the backend API. Each tool corresponds to a task management operation (CRUD + special operations).

## Architecture

```
backend/src/mcp_server/
├── __init__.py           # Package initialization
├── server.py             # MCP server implementation
├── tools/                # Tool implementations
│   ├── __init__.py
│   ├── create_task.py    # Create new task
│   ├── read_tasks.py     # List/search tasks
│   ├── update_task.py    # Update task
│   ├── delete_task.py    # Delete task
│   ├── complete_task.py  # Mark task complete
│   └── reschedule_task.py # Update due date
└── resources/            # Optional: Resource implementations
```

## Tools

### 1. create_task

Creates a new task with the specified attributes.

**Parameters:**
- `description` (string, required): Task description
- `priority` (string, optional): Task priority (low, medium, high)
- `tags` (array, optional): List of tags
- `due_date` (string, optional): Due date in ISO format (YYYY-MM-DD)

**Returns:**
- Task object with id, description, priority, tags, due_date, is_completed, created_at

**Example:**
```
Input: {
  "description": "Buy milk",
  "priority": "high",
  "tags": ["shopping"],
  "due_date": "2025-12-24"
}

Output: {
  "id": "task-123",
  "description": "Buy milk",
  "priority": "high",
  "tags": ["shopping"],
  "due_date": "2025-12-24",
  "is_completed": false,
  "created_at": "2025-12-23T10:00:00Z"
}
```

### 2. read_tasks

Lists tasks with optional search, filter, and sort parameters.

**Parameters:**
- `search` (string, optional): Search query for descriptions
- `priority` (string, optional): Filter by priority
- `tags` (array, optional): Filter by tags
- `is_completed` (boolean, optional): Filter by completion status
- `sort_by` (string, optional): Sort field (due_date, priority, created_at)
- `sort_order` (string, optional): Sort order (asc, desc)
- `page` (integer, optional): Page number (default: 1)
- `page_size` (integer, optional): Tasks per page (default: 50)

**Returns:**
- Object with tasks array, total count, page, page_size

**Example:**
```
Input: {
  "search": "milk",
  "priority": "high",
  "sort_by": "due_date"
}

Output: {
  "tasks": [
    {
      "id": "task-123",
      "description": "Buy milk",
      "priority": "high",
      "tags": ["shopping"],
      "due_date": "2025-12-24",
      "is_completed": false,
      "created_at": "2025-12-23T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 50
}
```

### 3. update_task

Updates an existing task.

**Parameters:**
- `task_id` (string, required): Task ID to update
- `description` (string, optional): New description
- `priority` (string, optional): New priority
- `tags` (array, optional): New tags
- `due_date` (string, optional): New due date

**Returns:**
- Updated task object with updated_at timestamp

### 4. delete_task

Deletes a task permanently.

**Parameters:**
- `task_id` (string, required): Task ID to delete

**Returns:**
- Confirmation object with success flag

### 5. complete_task

Marks a task as complete.

**Parameters:**
- `task_id` (string, required): Task ID to mark complete

**Returns:**
- Updated task object with completion status and completed_at timestamp

### 6. reschedule_task

Updates a task's due date.

**Parameters:**
- `task_id` (string, required): Task ID to reschedule
- `due_date` (string, required): New due date in ISO format

**Returns:**
- Updated task object with new due_date and updated_at timestamp

## Integration with Todo Agent

The MCP server is used by the TodoAgent to execute task management operations. The agent parses natural language input and determines which tool to call with the appropriate parameters.

### Agent Flow

1. User sends natural language command (e.g., "Create a task to buy milk")
2. Agent analyzes the command and identifies the appropriate tool
3. Agent extracts parameters from the natural language
4. MCP server executes the tool with those parameters
5. Tool returns result to agent
6. Agent formats response for user

### Natural Language Examples

| User Input | Tool Called | Parameters |
|-----------|-------------|------------|
| "Create a task to buy milk" | create_task | {description: "buy milk"} |
| "What tasks are due this week?" | read_tasks | {sort_by: "due_date"} |
| "Mark task complete" | complete_task | {task_id: "..."} |
| "Delete old tasks" | delete_task | {task_id: "..."} |
| "Move meeting to Friday" | reschedule_task | {task_id: "...", due_date: "..."} |

## Error Handling

Tools may return errors in these scenarios:

- **Invalid task ID**: Task does not exist
- **Invalid due date format**: Date not in ISO format
- **Invalid priority**: Priority not in (low, medium, high)
- **Network error**: Backend API unreachable
- **Validation error**: Missing required fields

All errors are propagated to the agent, which handles user-friendly error messages.

## Testing

Unit tests for all tools are located in `backend/tests/mcp/test_tools.py`.

Conversational flow tests are located in `backend/tests/mcp/test_conversational_flows.py`.

### Running Tests

```bash
# Run all MCP tests
pytest backend/tests/mcp/

# Run specific test file
pytest backend/tests/mcp/test_tools.py

# Run with coverage
pytest backend/tests/mcp/ --cov=src/mcp_server
```

## Configuration

The MCP server uses the following environment variables:

- `OPENAI_API_KEY`: OpenAI API key for agent (required for agent integration)
- `API_BASE_URL`: Base URL for backend API (default: http://localhost:8000)

## Running the MCP Server

```bash
# Start the MCP server
python -m src.mcp_server.server

# With custom API base URL
API_BASE_URL=http://api.example.com python -m src.mcp_server.server
```

## API Contract

All tools follow a consistent contract:

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "...": "..."
  }
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Future Extensions

Potential tools to add in future phases:

- `create_recurring_task`: Create recurring tasks
- `bulk_update_tasks`: Update multiple tasks at once
- `export_tasks`: Export tasks to various formats
- `import_tasks`: Import tasks from files
- `share_tasks`: Share tasks with other users
- `set_reminders`: Set reminders for tasks

## Related Documentation

- [Todo Agent Guide](../../agents/README.md)
- [Backend API Documentation](../../../docs/api.md)
- [Chatbot Usage Guide](../../../docs/chatbot-guide.md)
