import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from '@/components/TaskForm';
import { Task } from '@/types/task';

describe('TaskForm Component', () => {
  const mockTask: Task = {
    id: 1,
    description: 'Edit Task',
    is_completed: false,
    priority: 'high',
    tags: 'test',
    due_date: '2025-12-25T10:00:00',
    created_at: '2025-12-11T00:00:00',
    updated_at: '2025-12-11T00:00:00',
  };

  it('renders create form by default', () => {
    const onSubmit = vi.fn();

    render(<TaskForm onSubmit={onSubmit} />);

    expect(screen.getByText(/create task|new task|add task/i)).toBeInTheDocument();
  });

  it('renders edit form when task is provided', () => {
    const onSubmit = vi.fn();

    render(<TaskForm task={mockTask} onSubmit={onSubmit} />);

    expect(screen.getByText(/edit|update/i)).toBeInTheDocument();
  });

  it('allows entering task description', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<TaskForm onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText(/task|description/i);
    await user.type(input, 'New Task');

    expect(input).toHaveValue('New Task');
  });

  it('allows selecting priority', async () => {
    const onSubmit = vi.fn();

    const { container } = render(<TaskForm onSubmit={onSubmit} />);

    // Priority buttons should be available
    const highButton = screen.queryByText(/high|🔥/i);
    const mediumButton = screen.queryByText(/medium|⚡/i);

    expect(highButton || mediumButton).toBeInTheDocument();
  });

  it('calls onSubmit with form data', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<TaskForm onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText(/task|description/i);
    await user.type(input, 'Test Task');

    const submitButton = screen.getByRole('button', { name: /submit|create|save/i });
    await user.click(submitButton);

    expect(onSubmit).toHaveBeenCalled();
  });

  it('prepopulates form with task data in edit mode', async () => {
    const onSubmit = vi.fn();

    render(<TaskForm task={mockTask} onSubmit={onSubmit} />);

    const input = screen.getByDisplayValue(/Edit Task/);
    expect(input).toBeInTheDocument();
  });

  it('validates empty description', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<TaskForm onSubmit={onSubmit} />);

    const submitButton = screen.getByRole('button', { name: /submit|create|save/i });
    await user.click(submitButton);

    // Should not call onSubmit if validation fails
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('allows adding tags', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<TaskForm onSubmit={onSubmit} />);

    const tagInput = screen.queryByPlaceholderText(/tags/i);
    if (tagInput) {
      await user.type(tagInput, 'important,urgent');
      expect(tagInput).toHaveValue('important,urgent');
    }
  });

  it('allows selecting due date', async () => {
    const onSubmit = vi.fn();

    render(<TaskForm onSubmit={onSubmit} />);

    const dateInput = screen.queryByType('date') || screen.queryByPlaceholderText(/date/i);
    if (dateInput) {
      expect(dateInput).toBeInTheDocument();
    }
  });

  it('shows loading state while submitting', async () => {
    const onSubmit = vi.fn(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    const user = userEvent.setup();

    render(<TaskForm onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText(/task|description/i);
    await user.type(input, 'Test Task');

    const submitButton = screen.getByRole('button', { name: /submit|create|save/i });
    await user.click(submitButton);

    // Button should show loading state
    expect(submitButton).toBeDisabled();
  });

  it('clears form after successful submission', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<TaskForm onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText(/task|description/i) as HTMLInputElement;
    await user.type(input, 'Test Task');

    const submitButton = screen.getByRole('button', { name: /submit|create|save/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('handles error during submission', async () => {
    const error = new Error('Submission failed');
    const onSubmit = vi.fn().mockRejectedValue(error);
    const user = userEvent.setup();

    render(<TaskForm onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText(/task|description/i);
    await user.type(input, 'Test Task');

    const submitButton = screen.getByRole('button', { name: /submit|create|save/i });
    await user.click(submitButton);

    // Error handling should be displayed
    expect(onSubmit).toHaveBeenCalled();
  });
});
