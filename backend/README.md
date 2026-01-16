# Evolution of Todo - Backend (Phase II)

FastAPI backend for the Evolution of Todo application with comprehensive testing and database migrations.

## Features

- RESTful API with FastAPI
- PostgreSQL database with SQLModel ORM
- Better Auth integration for authentication
- Comprehensive test suite (unit + integration)
- Database migrations with Alembic
- Full CRUD operations for tasks
- Advanced filtering, pagination, and search

## Project Structure

```
backend/
├── alembic/
│   ├── versions/
│   │   ├── 001_create_task_table.py
│   │   └── 002_create_task_tags_junction.py
│   ├── env.py
│   └── script.py.mako
├── src/
│   ├── api/
│   │   ├── routers/
│   │   │   └── tasks.py
│   │   └── schemas/
│   │       └── task.py
│   ├── auth/
│   │   ├── auth.py
│   │   └── dependencies.py
│   ├── db/
│   │   └── database.py
│   ├── models/
│   │   ├── task.py
│   │   └── better_auth.py
│   ├── repositories/
│   │   └── task_repository.py
│   ├── services/
│   │   └── task_service.py
│   └── main.py
├── tests/
│   ├── conftest.py
│   ├── unit/
│   │   ├── test_repository.py
│   │   └── test_service.py
│   └── integration/
│       └── test_api.py
├── alembic.ini
├── pyproject.toml
└── README.md
```

## Setup

### Prerequisites

- Python 3.11+
- PostgreSQL (or use local SQLite for development)
- Poetry (optional, or use pip)

### Installation

1. **Install dependencies:**

   ```bash
   # Using Poetry
   poetry install

   # Or using pip
   pip install -r requirements.txt
   ```

2. **Configure environment:**

   Create a `.env` file:

   ```env
   # Database Configuration
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   # Or use local SQLite for development
   USE_LOCAL_DB=true

   # Better Auth (configure in frontend)
   BETTER_AUTH_SECRET=your-secret-key
   ```

3. **Run database migrations:**

   ```bash
   # Upgrade to latest migration
   alembic upgrade head

   # Or create new migration (after model changes)
   alembic revision --autogenerate -m "description"
   ```

4. **Start the development server:**

   ```bash
   # Using Poetry
   poetry run uvicorn src.main:app --reload --port 8000

   # Or using uvicorn directly
   uvicorn src.main:app --reload --port 8000
   ```

   API will be available at `http://localhost:8000`

## Testing

### Run All Tests

```bash
# Using Poetry
poetry run pytest

# Or using pytest directly
pytest
```

### Run Specific Test Suites

```bash
# Unit tests only
pytest tests/unit/

# Integration tests only
pytest tests/integration/

# Specific test file
pytest tests/unit/test_repository.py

# Specific test class
pytest tests/unit/test_repository.py::TestTaskRepository

# Specific test method
pytest tests/unit/test_repository.py::TestTaskRepository::test_create_task
```

### Coverage Report

```bash
# Generate coverage report
pytest --cov=src --cov-report=html

# View HTML report
open htmlcov/index.html  # macOS
start htmlcov/index.html  # Windows
```

### Test Coverage Goals

- Repository layer: ≥ 90% coverage
- Service layer: ≥ 85% coverage
- API endpoints: ≥ 80% coverage
- Overall: ≥ 80% coverage

## Database Migrations

### Create a New Migration

```bash
# Auto-generate migration from model changes
alembic revision --autogenerate -m "Add new field to tasks"

# Create empty migration
alembic revision -m "Custom migration"
```

### Apply Migrations

```bash
# Upgrade to latest
alembic upgrade head

# Upgrade to specific revision
alembic upgrade <revision_id>

# Downgrade one revision
alembic downgrade -1

# Downgrade to specific revision
alembic downgrade <revision_id>

# Show current revision
alembic current

# Show migration history
alembic history
```

## API Documentation

Once the server is running, visit:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## API Endpoints

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tasks` | List tasks (with filters, pagination) |
| GET | `/api/v1/tasks/{id}` | Get single task |
| GET | `/api/v1/tasks/daily/all` | Get all daily tasks |
| POST | `/api/v1/tasks` | Create new task |
| PUT | `/api/v1/tasks/{id}` | Update task |
| PATCH | `/api/v1/tasks/{id}/complete` | Toggle task completion |
| DELETE | `/api/v1/tasks/{id}` | Delete task |

### Query Parameters

- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 50, max: 100)
- `is_completed`: Filter by completion status (true/false)
- `priority`: Filter by priority (low/medium/high)
- `search`: Search in task description

### Example Requests

**Create Task:**
```bash
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "X-User-ID: user-id-here" \
  -d '{
    "description": "Complete project documentation",
    "priority": "high",
    "tags": "work,documentation",
    "due_date": "2025-12-31T23:59:59Z",
    "is_daily": false
  }'
```

**List Tasks with Filters:**
```bash
curl "http://localhost:8000/api/v1/tasks?priority=high&is_completed=false&page=1&page_size=20" \
  -H "X-User-ID: user-id-here"
```

**Update Task:**
```bash
curl -X PUT http://localhost:8000/api/v1/tasks/1 \
  -H "Content-Type: application/json" \
  -H "X-User-ID: user-id-here" \
  -d '{
    "description": "Updated task description",
    "priority": "medium"
  }'
```

**Toggle Completion:**
```bash
curl -X PATCH http://localhost:8000/api/v1/tasks/1/complete \
  -H "X-User-ID: user-id-here"
```

## Authentication

The API uses Better Auth session-based authentication via the Next.js frontend proxy:

1. **Session Cookie**: Frontend handles Better Auth session
2. **Proxy Headers**: Next.js forwards `X-User-ID` and `X-User-Email` headers
3. **User Isolation**: All endpoints automatically filter by authenticated user

For direct API access (testing), include the `X-User-ID` header with a valid user ID.

## Development

### Code Quality

```bash
# Run linter (if configured)
flake8 src/ tests/

# Run type checker
mypy src/

# Format code
black src/ tests/
```

### Database Management

```bash
# Drop all tables (caution!)
alembic downgrade base

# Reset database
alembic downgrade base && alembic upgrade head
```

## Troubleshooting

### Common Issues

**1. Database Connection Errors**

- Verify `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Check firewall/network settings
- For Neon DB, verify connection string format

**2. Migration Conflicts**

```bash
# Check current state
alembic current

# Show pending migrations
alembic heads

# Resolve conflicts manually or reset
alembic downgrade base
alembic upgrade head
```

**3. Test Failures**

```bash
# Run with verbose output
pytest -vv

# Run with print statements
pytest -s

# Run single failing test
pytest tests/path/to/test.py::test_name -vv
```

**4. Import Errors**

- Ensure you're in the backend directory
- Verify virtual environment is activated
- Check `PYTHONPATH` includes project root

## Performance Optimization

### Database Indexes

The following indexes are created for optimal query performance:

- `user_id` - User task filtering
- `is_completed` - Completion status filtering
- `priority` - Priority filtering
- `due_date` - Date-based queries
- `created_at` - Sorting by creation date
- Composite indexes for common query patterns

### Query Optimization

- Pagination prevents full table scans
- Indexes on filtered columns
- Efficient JOIN operations
- Connection pooling for PostgreSQL

## Contributing

1. Create a feature branch
2. Write tests for new functionality
3. Ensure all tests pass
4. Update documentation
5. Submit pull request

## License

MIT License
