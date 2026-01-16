# Phase I: Console Todo Manager

**Part of**: Evolution of Todo – 5-Phase AI-Native Todo System  
**Status**: In Development  
**Phase**: I - Console Todo

## Overview

A console-based todo manager with in-memory storage. This is the foundational phase that implements core CRUD operations (create, read, update, delete, mark complete) through a command-line interface.

## Features

- ✅ Add new tasks
- ✅ View all tasks
- ✅ Mark tasks as complete
- ✅ Update task descriptions
- ✅ Delete tasks
- ✅ In-memory storage (session-based)

## Requirements

- Python 3.11 or higher
- pytest (for running tests)

## Setup

1. Install dependencies:
   ```bash
   pip install -e ".[dev]"
   ```

2. Run the application using one of these methods:

   **Option 1: Run as a module (recommended)**
   ```bash
   python -m src.cli.main
   ```

   **Option 2: Use the console script (after installation)**
   ```bash
   todo-cli
   ```

   **Option 3: Run directly (from phase-i-console directory)**
   ```bash
   python src/cli/main.py
   ```

## Usage

The application provides an interactive menu-driven interface:

```
=== Todo Manager ===
1. Add task
2. List tasks
3. Mark task complete
4. Update task
5. Delete task
6. Exit

Enter your choice:
```

### Commands

- **Add task**: Prompts for a task description and creates a new task
- **List tasks**: Displays all tasks with their ID, description, and completion status
- **Mark task complete**: Prompts for task ID and marks it as completed
- **Update task**: Prompts for task ID and new description, updates the task
- **Delete task**: Prompts for task ID and removes the task
- **Exit**: Gracefully exits the application

## Testing

### Unit Tests

Run unit tests with coverage:
```bash
pytest
```

### Manual Testing

Run the manual test script:
```bash
bash tests/manual/test_console.sh
```

## Project Structure

```
phase-i-console/
├── src/
│   ├── models/
│   │   └── task.py          # Task domain model
│   ├── repositories/
│   │   └── in_memory_repo.py # In-memory task storage
│   ├── services/
│   │   └── task_service.py  # Business logic
│   └── cli/
│       └── main.py           # CLI entry point
└── tests/
    ├── unit/                 # Unit tests
    └── manual/               # Manual test scripts
```

## Success Criteria

- ✅ SC-001: All CRUD operations work reliably without crashes
- ✅ SC-002: Changes are immediately consistent (no delay between operation and visibility)

## Next Phase

After Phase I is complete and validated, proceed to **Phase II: Web Todo with Persistence** which adds:
- Web-based UI (Next.js)
- Persistent storage (Neon PostgreSQL)
- Priorities, tags, and due dates
- Search, filter, and sort capabilities
