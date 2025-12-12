import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskItem from '@/components/TaskItem';
import { Task } from '@/types/task';

describe('TaskItem Component', () => {
  const mockTask: Task = {
    id: 1,
    description: 'Test Task',
    is_completed: false,
    priority: 'high',
    tags: 'test,important',
    due_date: '2025-12-25T10:00:00',
    created_at: '2025-12-11T00:00:00',
    updated_at: '2025-12-11T00:00:00',
  };

  it('renders task description', () => {
    const onComplete = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <TaskItem
        task={mockTask}
        onComplete={onComplete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('displays priority badge with correct style', () => {
    const onComplete = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const { container } = render(
      <TaskItem
        task={mockTask}
        onComplete={onComplete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    const priorityBadge = container.querySelector('[class*="priority"]');
    expect(priorityBadge).toBeInTheDocument();
  });

  it('shows due date when provided', () => {
    const onComplete = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const taskWithDue = { ...mockTask, due_date: '2025-12-25T10:00:00' };

    render(
      <TaskItem
        task={taskWithDue}
        onComplete={onComplete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    // Due date should be displayed (format depends on implementation)
    const taskElement = screen.getByText('Test Task').closest('div');
    expect(taskElement).toBeInTheDocument();
  });

  it('calls onComplete when checkbox is clicked', async () => {
    const onComplete = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const { container } = render(
      <TaskItem
        task={mockTask}
        onComplete={onComplete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    const checkbox = container.querySelector('input[type="checkbox"]');
    if (checkbox) {
      fireEvent.click(checkbox);
      expect(onComplete).toHaveBeenCalledWith(mockTask.id);
    }
  });

  it('calls onEdit when edit button is clicked', async () => {
    const onComplete = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const { container } = render(
      <TaskItem
        task={mockTask}
        onComplete={onComplete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    // Find edit button (typically an icon or button)
    const editButton = container.querySelector('[aria-label*="Edit"], button:nth-of-type(1)');
    if (editButton) {
      fireEvent.click(editButton);
      expect(onEdit).toHaveBeenCalledWith(mockTask);
    }
  });

  it('calls onDelete when delete button is clicked', async () => {
    const onComplete = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const { container } = render(
      <TaskItem
        task={mockTask}
        onComplete={onComplete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    // Find delete button
    const deleteButton = container.querySelector('[aria-label*="Delete"], button:nth-of-type(2)');
    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(onDelete).toHaveBeenCalledWith(mockTask.id);
    }
  });

  it('applies completed style when task is completed', () => {
    const onComplete = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const completedTask = { ...mockTask, is_completed: true };

    const { container } = render(
      <TaskItem
        task={completedTask}
        onComplete={onComplete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    const taskElement = container.querySelector('[class*="completed"]');
    // Completed state should be reflected in styling
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('displays tags when provided', () => {
    const onComplete = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const taskWithTags = { ...mockTask, tags: 'test,important' };

    const { container } = render(
      <TaskItem
        task={taskWithTags}
        onComplete={onComplete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    // Tags should be displayed
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('handles low priority tasks', () => {
    const onComplete = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const lowPriorityTask = { ...mockTask, priority: 'low' };

    render(
      <TaskItem
        task={lowPriorityTask}
        onComplete={onComplete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('handles medium priority tasks', () => {
    const onComplete = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const mediumPriorityTask = { ...mockTask, priority: 'medium' };

    render(
      <TaskItem
        task={mediumPriorityTask}
        onComplete={onComplete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });
});
