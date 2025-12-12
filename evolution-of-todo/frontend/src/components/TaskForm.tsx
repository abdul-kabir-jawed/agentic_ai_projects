'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Task, Priority } from '@/types/task';

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: {
    description: string;
    priority: Priority;
    tags?: string;
    due_date?: string;
    is_daily?: boolean;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const priorities: Priority[] = ['high', 'medium', 'low'];

export default function TaskForm({
  task,
  onSubmit,
  onCancel,
  isLoading = false,
}: TaskFormProps) {
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<Priority>(task?.priority || 'medium');
  const [tags, setTags] = useState(task?.tags || '');
  const [dueDate, setDueDate] = useState(
    task?.due_date ? task.due_date.split('T')[0] : ''
  );
  const [isDaily, setIsDaily] = useState(task?.is_daily || false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Task description is required');
      return;
    }

    try {
      await onSubmit({
        description: description.trim(),
        priority,
        tags: tags.trim() || undefined,
        due_date: dueDate || undefined,
        is_daily: isDaily,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onSubmit={handleSubmit}
      className="glass p-6 md:p-8 rounded-2xl space-y-4 md:space-y-6"
    >
      <h2 className="text-2xl font-bold text-white">
        {task ? 'Edit Task' : 'Create New Task'}
      </h2>

      {error && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-3 md:p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm md:text-base"
        >
          {error}
        </motion.div>
      )}

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-white/80 mb-2">
          Task Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          placeholder="What needs to be done?"
          className="input-base h-24 md:h-32 resize-none"
        />
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm font-semibold text-white/80 mb-2">
          Priority
        </label>
        <div className="flex gap-2 md:gap-3">
          {priorities.map((p) => (
            <motion.button
              key={p}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPriority(p)}
              disabled={isLoading}
              className={`px-3 md:px-4 py-2 rounded-lg font-semibold transition-all capitalize ${
                priority === p
                  ? 'bg-amber-500 text-black ring-2 ring-amber-300'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {p}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-semibold text-white/80 mb-2">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          disabled={isLoading}
          placeholder="work, urgent, personal"
          className="input-base"
        />
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-semibold text-white/80 mb-2">
          Due Date
        </label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={isLoading}
          className="input-base"
        />
      </div>

      {/* Daily Task Toggle */}
      <div className="flex items-center gap-3 p-3 md:p-4 bg-white/5 border border-white/10 rounded-lg">
        <input
          type="checkbox"
          id="isDaily"
          checked={isDaily}
          onChange={(e) => setIsDaily(e.target.checked)}
          disabled={isLoading}
          className="w-5 h-5 rounded cursor-pointer"
        />
        <label htmlFor="isDaily" className="text-sm font-semibold text-white/80 cursor-pointer flex-1">
          Mark as Daily Task
        </label>
        <span className="text-xs text-amber-400 font-medium">📅</span>
      </div>

      {/* Actions */}
      <div className="flex gap-3 md:gap-4 pt-4">
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isLoading}
          className="btn-primary flex-1"
        >
          {isLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCancel}
          disabled={isLoading}
          className="btn-secondary flex-1"
        >
          Cancel
        </motion.button>
      </div>
    </motion.form>
  );
}
