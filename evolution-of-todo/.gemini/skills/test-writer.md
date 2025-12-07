---
name: test-writer
description: Generates comprehensive test suites for Python and TypeScript code that achieve ≥80% coverage. Use when writing new code, before committing, when coverage drops below threshold, or when refactoring. Tests happy path, error cases, edge cases, and integration points.
allowed-tools: Read, Write, Edit, Run Terminal, Grep
---

# Test-Writer

This Skill automatically generates comprehensive test suites that achieve ≥80% code coverage, following testing best practices.

## When to Use

- After writing new code
- Before committing changes
- When coverage drops below threshold (80%)
- When refactoring code
- When new function/class is created
- When existing code is modified

## Instructions

### Step 1: Analyze Source Code
1. Use **Read** to read the source code file
2. Identify functions, classes, and methods to test
3. Identify dependencies and external calls
4. Determine test framework (pytest for Python, Jest for TypeScript)

### Step 2: Identify Test Cases
1. **Happy Path:** Normal operation with valid inputs
2. **Error Cases:** Invalid inputs, missing data, exceptions
3. **Edge Cases:** Boundary conditions, null values, empty collections
4. **Integration Points:** External API calls, database operations

### Step 3: Generate Test Structure
1. Use **Write** to create test file: `test_<module_name>.py` or `<module>.test.ts`
2. Import necessary testing libraries
3. Set up test fixtures and mocks
4. Create test class or describe block

### Step 4: Write Test Functions
For each function/method:
1. Write test for happy path
2. Write tests for error cases
3. Write tests for edge cases
4. Use descriptive test names: `test_<function>_<condition>_<expected_result>`

### Step 5: Set Up Mocks and Fixtures
1. Mock external dependencies (APIs, databases, file system)
2. Create test data fixtures
3. Set up test database (if needed)
4. Configure test environment

### Step 6: Verify Coverage
1. Use **Run Terminal** to run coverage tool: `pytest --cov` or `jest --coverage`
2. Verify coverage ≥80%
3. Use **Grep** to identify uncovered lines
4. Add tests for uncovered code

## Quality Checks

1. **Test Independence:** Each test can run independently
2. **Repeatability:** Tests produce same results on every run
3. **Clarity:** Test names clearly describe what they test
4. **Completeness:** All code paths tested
5. **Maintainability:** Tests are easy to update when code changes

## Example

**Input:**
```python
# src/task_manager.py
class TaskManager:
    def add_task(self, title: str, description: str | None = None) -> Task:
        if not title:
            raise ValueError("Title cannot be empty")
        # ... implementation
```

**Output:**
```python
# tests/test_task_manager.py
import pytest
from src.task_manager import TaskManager
from src.models import Task

class TestTaskManager:
    def test_add_task_with_title_and_description_returns_task(self):
        manager = TaskManager()
        task = manager.add_task("Test", "Description")
        assert task.title == "Test"
        assert task.description == "Description"
    
    def test_add_task_with_empty_title_raises_value_error(self):
        manager = TaskManager()
        with pytest.raises(ValueError, match="Title cannot be empty"):
            manager.add_task("")
    
    def test_add_task_with_none_description_returns_task(self):
        manager = TaskManager()
        task = manager.add_task("Test", None)
        assert task.description is None
```

## Common Pitfalls to Avoid

1. **Testing Implementation Details:** Test behavior, not implementation
2. **Over-Mocking:** Don't mock everything; test real behavior when possible
3. **Flaky Tests:** Avoid time-dependent or random data
4. **Test Duplication:** Reuse fixtures and helpers
5. **Missing Edge Cases:** Always test boundary conditions
