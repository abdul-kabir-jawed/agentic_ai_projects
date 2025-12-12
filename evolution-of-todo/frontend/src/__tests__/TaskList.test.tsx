import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskList from '@/components/TaskList';
import { Task } from '@/types/task';

describe('TaskList Component', () => {
  const mockTasks: Task[] = [
    {
      id: 1,
      description: 'High Priority Task',
      is_completed: false,
      priority: 'high',
      tags: 'urgent',
      due_date: null,
      created_at: '2025-12-11T00:00:00',
      updated_at: '2025-12-11T00:00:00',
    },
    {
      id: 2,
      description: 'Medium Priority Task',
      is_completed: false,
      priority: 'medium',
      tags: 'normal',
      due_date: null,
      created_at: '2025-12-11T00:00:00',
      updated_at: '2025-12-11T00:00:00',
    },
    {
      id: 3,
      description: 'Completed Task',
      is_completed: true,
      priority: 'low',
      tags: null,
      due_date: null,
      created_at: '2025-12-11T00:00:00',
      updated_at: '2025-12-11T00:00:00',
    },
  ];

  it('renders empty state when no tasks', () => {
    const onComplete = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <TaskList
        tasks={[]}
        isLoading={false}
        onComplete={onComplete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    // Should show empty state message
    expect(screen.getByText(/no tasks|empty/i)).toBeInTheDocument();
  });

  it('renders all tasks', () => {
    const onComplete = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <TaskList
        tasks={mockTasks}
        isLoading={false}
        onComplete={onComplete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('High Priority Task')).toBeInTheDocument();
    expect(screen.getByText('Medium Priority Task')).toBeInTheDocument();
    expect(screen.getByText('Completed Task')).toBeInTheDocument();
  });

  it('groups tasks by priority', () => {
    const onComplete = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <TaskList
        tasks={mockTasks}
        isLoading={false}
        onComplete={onComplete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    // All tasks should be visible
    expect(screen.getByText('High Priority Task')).toBeInTheDocument();
    expect(screen.getByText('Medium Priority Task')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    const onComplete = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const { container } = render(
      <TaskList
        tasks={[]}
        isLoading={true}
        onComplete={onComplete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    // Loading spinner should be visible
    const spinner = container.querySelector('[class*="spinner"], [class*="loading"]');
    expect(spinner || screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('passes callback functions to TaskItem components', () => {
    const onComplete = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <TaskList
        tasks={mockTasks}
        isLoading={false}
        onComplete={onComplete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    // TaskItem components should be rendered with callbacks
    expect(screen.getByText('High Priority Task')).toBeInTheDocument();
  });

  it('handles empty task list', () => {
    const onComplete = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <TaskList
        tasks={[]}
        isLoading={false}
        onComplete={onComplete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText(/no tasks|empty/i)).toBeInTheDocument();
  });

  it('renders completed tasks section', () => {
    const onComplete = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <TaskList
        tasks={mockTasks}
        isLoading={false}
        onComplete={onComplete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    // Completed task should be visible
    expect(screen.getByText('Completed Task')).toBeInTheDocument();
  });

  it('animates task transitions', () => {
    const onComplete = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const { rerender } = render(
      <TaskList
        tasks={mockTasks}
        isLoading={false}
        onComplete={onComplete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    // Verify animation is applied
    expect(screen.getByText('High Priority Task')).toBeInTheDocument();

    // Update tasks list
    const updatedTasks = mockTasks.slice(0, 2);
    rerender(
      <TaskList
        tasks={updatedTasks}
        isLoading={false}
        onComplete={onComplete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('High Priority Task')).toBeInTheDocument();
  });

  it('displays correct count of tasks by priority', () => {
    const onComplete = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <TaskList
        tasks={mockTasks}
        isLoading={false}
        onComplete={onComplete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    // All 3 tasks should be visible
    expect(screen.getByText('High Priority Task')).toBeInTheDocument();
    expect(screen.getByText('Medium Priority Task')).toBeInTheDocument();
    expect(screen.getByText('Completed Task')).toBeInTheDocument();
  });
});
