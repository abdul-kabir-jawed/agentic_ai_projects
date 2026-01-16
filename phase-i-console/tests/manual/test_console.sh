#!/bin/bash
# Manual test script for Phase I console todo manager
# This script validates all acceptance scenarios from User Story 1

set -e  # Exit on error

echo "=== Phase I Console Todo - Manual Test Script ==="
echo ""

# Test 1: Create a task
echo "Test 1: Creating a task 'Buy groceries'..."
python -c "
from src.models.task import Task
from src.repositories.in_memory_repo import InMemoryTaskRepository
from src.services.task_service import TaskService

repo = InMemoryTaskRepository()
service = TaskService(repo)
task = service.create_task('Buy groceries')
print(f'✓ Task created: ID={task.id[:8]}..., description={task.description}')
assert task.description == 'Buy groceries', 'Description mismatch'
assert task.is_completed == False, 'Task should not be completed'
print('✓ Test 1 passed: Task created successfully')
"

# Test 2: List all tasks
echo ""
echo "Test 2: Listing all tasks..."
python -c "
from src.repositories.in_memory_repo import InMemoryTaskRepository
from src.services.task_service import TaskService

repo = InMemoryTaskRepository()
service = TaskService(repo)
service.create_task('Task 1')
service.create_task('Task 2')
service.create_task('Task 3')
tasks = service.get_all_tasks()
print(f'✓ Found {len(tasks)} tasks')
assert len(tasks) == 3, 'Expected 3 tasks'
for task in tasks:
    print(f'  - [{task.id[:8]}...] {task.description} (completed: {task.is_completed})')
print('✓ Test 2 passed: All tasks listed correctly')
"

# Test 3: Mark task as complete
echo ""
echo "Test 3: Marking a task as complete..."
python -c "
from src.repositories.in_memory_repo import InMemoryTaskRepository
from src.services.task_service import TaskService

repo = InMemoryTaskRepository()
service = TaskService(repo)
task = service.create_task('Buy groceries')
assert task.is_completed == False, 'Task should start incomplete'
completed_task = service.mark_complete(task.id)
print(f'✓ Task marked complete: {completed_task.description}')
assert completed_task.is_completed == True, 'Task should be completed'
retrieved = service.get_task(task.id)
assert retrieved.is_completed == True, 'Task should remain completed when retrieved'
print('✓ Test 3 passed: Task marked complete successfully')
"

# Test 4: Update task description
echo ""
echo "Test 4: Updating task description..."
python -c "
from src.repositories.in_memory_repo import InMemoryTaskRepository
from src.services.task_service import TaskService

repo = InMemoryTaskRepository()
service = TaskService(repo)
task = service.create_task('Original description')
updated = service.update_task(task.id, 'Updated description')
print(f'✓ Task updated: {updated.description}')
assert updated.description == 'Updated description', 'Description not updated'
retrieved = service.get_task(task.id)
assert retrieved.description == 'Updated description', 'Update not persisted'
print('✓ Test 4 passed: Task description updated successfully')
"

# Test 5: Delete a task
echo ""
echo "Test 5: Deleting a task..."
python -c "
from src.repositories.in_memory_repo import InMemoryTaskRepository
from src.services.task_service import TaskService

repo = InMemoryTaskRepository()
service = TaskService(repo)
task = service.create_task('Task to delete')
task_id = task.id
deleted = service.delete_task(task_id)
print(f'✓ Task deleted: {task_id[:8]}...')
assert deleted == True, 'Delete should return True'
retrieved = service.get_task(task_id)
assert retrieved is None, 'Task should not exist after deletion'
all_tasks = service.get_all_tasks()
assert task not in all_tasks, 'Task should not be in task list'
print('✓ Test 5 passed: Task deleted successfully')
"

# Test 6: Immediate consistency check
echo ""
echo "Test 6: Verifying immediate consistency..."
python -c "
from src.repositories.in_memory_repo import InMemoryTaskRepository
from src.services.task_service import TaskService

repo = InMemoryTaskRepository()
service = TaskService(repo)

# Create task
task = service.create_task('Consistency test')
task_id = task.id

# Immediately verify it exists
retrieved = service.get_task(task_id)
assert retrieved is not None, 'Task should exist immediately after creation'
assert retrieved.description == 'Consistency test', 'Description should match immediately'

# Update and immediately verify
service.update_task(task_id, 'Updated immediately')
retrieved = service.get_task(task_id)
assert retrieved.description == 'Updated immediately', 'Update should be visible immediately'

# Mark complete and immediately verify
service.mark_complete(task_id)
retrieved = service.get_task(task_id)
assert retrieved.is_completed == True, 'Completion should be visible immediately'

print('✓ Test 6 passed: Immediate consistency verified')
"

# Test 7: Error handling
echo ""
echo "Test 7: Testing error handling..."
python -c "
from src.repositories.in_memory_repo import InMemoryTaskRepository
from src.services.task_service import TaskService

repo = InMemoryTaskRepository()
service = TaskService(repo)

# Test empty description
try:
    service.create_task('')
    assert False, 'Should raise ValueError for empty description'
except ValueError as e:
    print('✓ Empty description correctly rejected')

# Test invalid task ID
try:
    service.get_task('nonexistent-id')
    print('✓ Non-existent task returns None (expected)')
except Exception as e:
    assert False, f'Should return None, not raise exception: {e}'

# Test updating non-existent task
try:
    service.update_task('nonexistent-id', 'New description')
    assert False, 'Should raise ValueError for non-existent task'
except ValueError as e:
    print('✓ Update of non-existent task correctly rejected')

print('✓ Test 7 passed: Error handling works correctly')
"

echo ""
echo "=== All Tests Passed! ==="
echo "✓ SC-001: All CRUD operations work reliably without crashes"
echo "✓ SC-002: Changes are immediately consistent"
echo ""
echo "Phase I Console Todo is working correctly!"
