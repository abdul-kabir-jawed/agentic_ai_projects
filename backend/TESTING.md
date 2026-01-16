# Testing Guide - Evolution of Todo Backend

This guide explains the testing strategy and how to run tests for the Evolution of Todo backend.

## Test Structure

```
tests/
├── conftest.py ................... Shared fixtures
├── unit/
│   ├── test_repository.py ........ Database repository tests
│   └── test_service.py ........... Business logic tests
└── integration/
    └── test_api.py ............... API endpoint tests
```

## Testing Philosophy

### Test Pyramid

1. **Unit Tests** (70%): Fast, isolated tests for repository and service layers
2. **Integration Tests** (30%): End-to-end API tests with database
3. **Manual Tests**: User acceptance testing via frontend

### Coverage Goals

- Repository Layer: ≥ 90%
- Service Layer: ≥ 85%
- API Endpoints: ≥ 80%
- Overall: ≥ 80%

## Running Tests

### Quick Start

```bash
# Run all tests
pytest

# Run all tests with coverage
pytest --cov=src --cov-report=term-missing

# Using the test runner script
python run_tests.py
```

### Specific Test Suites

```bash
# Unit tests only
pytest tests/unit/
# or
python run_tests.py unit

# Integration tests only
pytest tests/integration/
# or
python run_tests.py integration

# Specific file
pytest tests/unit/test_repository.py

# Specific test class
pytest tests/unit/test_repository.py::TestTaskRepository

# Specific test
pytest tests/unit/test_repository.py::TestTaskRepository::test_create_task
```

### Test Filtering

```bash
# Run tests matching a pattern
pytest -k "test_create"

# Run tests for a specific feature
pytest -k "task and not delete"

# Exclude tests
pytest -k "not integration"
```

### Useful Options

```bash
# Stop on first failure
pytest -x

# Re-run last failed tests
pytest --lf

# Run tests in parallel (requires pytest-xdist)
pytest -n auto

# Show print statements
pytest -s

# Verbose output
pytest -v

# Extra verbose
pytest -vv

# Show local variables on failure
pytest -l
```

## Test Fixtures

### Database Fixtures

- `engine`: In-memory SQLite database engine
- `session`: Database session for tests
- `client`: FastAPI TestClient with test database

### User Fixtures

- `test_user`: Primary test user (Better Auth)
- `test_user2`: Secondary user for isolation tests
- `test_session`: Authentication session

### Task Fixtures

- `sample_task`: Single task for testing
- `sample_tasks`: Multiple tasks for pagination/filtering tests

### Example Usage

```python
def test_example(session, test_user, sample_task):
    """All fixtures are automatically provided by pytest."""
    repo = TaskRepository(session)
    task = repo.get_by_id(sample_task.id, test_user.id)
    assert task is not None
```

## Writing Tests

### Unit Test Example

```python
def test_create_task(session, test_user):
    """Test creating a task."""
    repo = TaskRepository(session)

    task = Task(
        user_id=test_user.id,
        description="Test task",
        priority="high",
    )

    created = repo.create(task)

    assert created.id is not None
    assert created.description == "Test task"
```

### Integration Test Example

```python
def test_create_task_api(client, test_user):
    """Test task creation via API."""
    response = client.post(
        "/api/v1/tasks",
        json={"description": "API test task"},
        headers={
            "X-User-ID": test_user.id,
            "X-User-Email": test_user.email,
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["description"] == "API test task"
```

## Coverage Reports

### Generate Coverage Report

```bash
# Terminal report
pytest --cov=src --cov-report=term-missing

# HTML report (opens in browser)
pytest --cov=src --cov-report=html
open htmlcov/index.html  # macOS
start htmlcov/index.html  # Windows

# XML report (for CI/CD)
pytest --cov=src --cov-report=xml
```

### Understanding Coverage

```
Name                           Stmts   Miss  Cover   Missing
------------------------------------------------------------
src/repositories/task_repository.py   120      5    96%   45-49
src/services/task_service.py           95      8    92%   102, 156-160
src/api/routers/tasks.py               65      3    95%   78-80
------------------------------------------------------------
TOTAL                                 280     16    94%
```

- **Stmts**: Total statements
- **Miss**: Uncovered statements
- **Cover**: Coverage percentage
- **Missing**: Line numbers not covered

## Test Organization

### Repository Tests (test_repository.py)

Tests for `TaskRepository` CRUD operations:

- ✓ Create task with all attributes
- ✓ Get task by ID
- ✓ Get task not found (404)
- ✓ List all tasks with pagination
- ✓ Search tasks (case-insensitive)
- ✓ Filter by priority
- ✓ Filter by completion status
- ✓ Update task
- ✓ Delete task
- ✓ User isolation
- ✓ Pagination logic
- ✓ Combined filters

### Service Tests (test_service.py)

Tests for `TaskService` business logic:

- ✓ Create task with validation
- ✓ Get task with error handling
- ✓ Get tasks with filters
- ✓ Update task updates timestamp
- ✓ Complete task toggles status
- ✓ Delete task
- ✓ Service pagination
- ✓ User isolation

### API Tests (test_api.py)

Tests for API endpoints:

- ✓ Create task endpoint (POST)
- ✓ List tasks endpoint (GET)
- ✓ Get single task (GET /:id)
- ✓ Update task (PUT /:id)
- ✓ Delete task (DELETE /:id)
- ✓ Complete task (PATCH /:id/complete)
- ✓ Authentication required
- ✓ Error responses (400, 404, 422)
- ✓ User isolation via API
- ✓ Filter and search
- ✓ Pagination

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install poetry
          poetry install

      - name: Run tests
        run: poetry run pytest --cov=src --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Debugging Tests

### Print Debugging

```python
def test_example(session, test_user):
    task = create_task()
    print(f"Task ID: {task.id}")  # Will show with pytest -s
    assert task.id is not None
```

### Breakpoint Debugging

```python
def test_example(session, test_user):
    task = create_task()
    import pdb; pdb.set_trace()  # Debugger will stop here
    assert task.id is not None
```

### VS Code Debugging

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: Pytest",
      "type": "python",
      "request": "launch",
      "module": "pytest",
      "args": ["-v", "${file}"],
      "console": "integratedTerminal"
    }
  ]
}
```

## Common Issues

### 1. Database Conflicts

**Issue**: Tests fail due to existing data

**Solution**: Each test gets a fresh in-memory database via fixtures

```python
# conftest.py already handles this
@pytest.fixture(name="session")
def session_fixture(engine):
    with Session(engine) as session:
        yield session
    # Session is automatically rolled back
```

### 2. Async Test Issues

**Issue**: Tests hang or fail with async code

**Solution**: Use `pytest-asyncio` (already configured)

```python
@pytest.mark.asyncio
async def test_async_function():
    result = await async_operation()
    assert result is not None
```

### 3. Authentication in Tests

**Issue**: Tests fail due to missing authentication

**Solution**: Use headers in test requests

```python
def test_with_auth(client, test_user):
    response = client.get(
        "/api/v1/tasks",
        headers={
            "X-User-ID": test_user.id,
            "X-User-Email": test_user.email,
        },
    )
    assert response.status_code == 200
```

## Best Practices

### 1. Test Naming

```python
# Good: Descriptive names
def test_create_task_with_all_attributes()
def test_get_task_returns_404_when_not_found()
def test_update_task_changes_updated_at_timestamp()

# Bad: Vague names
def test_task()
def test_1()
```

### 2. Arrange-Act-Assert Pattern

```python
def test_example(session, test_user):
    # Arrange: Set up test data
    repo = TaskRepository(session)
    task = Task(user_id=test_user.id, description="Test")

    # Act: Perform the action
    created = repo.create(task)

    # Assert: Verify the result
    assert created.id is not None
    assert created.description == "Test"
```

### 3. Test Independence

```python
# Good: Each test is independent
def test_create_task(session):
    task = create_task()
    assert task.id is not None

def test_delete_task(session):
    task = create_task()  # Don't rely on previous test
    delete_task(task.id)
    assert get_task(task.id) is None

# Bad: Tests depend on each other
# (Order matters, can't run individually)
```

### 4. Use Fixtures

```python
# Good: Use fixtures for common setup
def test_example(sample_task):
    assert sample_task.id is not None

# Bad: Duplicate setup code
def test_example(session):
    task = Task(...)
    session.add(task)
    session.commit()
    # ... duplicate in every test
```

## Performance

### Optimize Test Speed

1. **Use in-memory SQLite**: Already configured (much faster than PostgreSQL)
2. **Minimal fixtures**: Only create what you need
3. **Parallel execution**: `pytest -n auto` (requires pytest-xdist)
4. **Skip slow tests during development**: Use markers

```python
@pytest.mark.slow
def test_slow_operation():
    # Long-running test
    pass

# Skip slow tests
pytest -m "not slow"
```

## Summary

- Run all tests: `pytest`
- Run with coverage: `pytest --cov=src`
- Run specific suite: `pytest tests/unit/`
- Run specific test: `pytest -k "test_name"`
- Generate HTML report: `pytest --cov=src --cov-report=html`

For more pytest features, see: https://docs.pytest.org/
