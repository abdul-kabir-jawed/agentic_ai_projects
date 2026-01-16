'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
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

const priorityOptions: { value: Priority; icon: string; label: string; color: string }[] = [
  { value: 'high', icon: 'lucide:flame', label: 'Urgent', color: 'orange' },
  { value: 'medium', icon: 'lucide:zap', label: 'Important', color: 'gold' },
  { value: 'low', icon: 'lucide:coffee', label: 'Low', color: 'slate' },
];

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg"
      >
        <form
          onSubmit={handleSubmit}
          className="glass-card-static rounded-xl p-6 md:p-8 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-medium text-text-primary">
              {task ? 'Edit Task' : 'New Task'}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Icon icon="lucide:x" className="w-5 h-5 text-text-tertiary" />
            </button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-3 bg-rose/10 border border-rose/20 rounded-lg text-rose text-sm"
              >
                <Icon icon="lucide:alert-circle" className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">What needs to be done?</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              placeholder="Enter task description..."
              className="input-gold h-24 resize-none"
              autoFocus
            />
          </div>

          {/* Priority */}
          <div className="form-group">
            <label className="form-label">Priority</label>
            <div className="grid grid-cols-3 gap-3">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  disabled={isLoading}
                  className={`p-3 rounded-lg border transition-all duration-300 flex flex-col items-center gap-2 ${
                    priority === opt.value
                      ? opt.color === 'orange'
                        ? 'bg-orange-500/10 border-orange-500/50 text-orange-400'
                        : opt.color === 'gold'
                        ? 'bg-gold/10 border-gold/50 text-gold'
                        : 'bg-white/10 border-white/30 text-text-primary'
                      : 'bg-white/5 border-white/10 text-text-tertiary hover:border-white/20'
                  }`}
                >
                  <Icon icon={opt.icon} className="w-5 h-5" />
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">
              <Icon icon="lucide:tag" className="w-4 h-4 inline mr-2" />
              Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={isLoading}
              placeholder="work, personal, urgent (comma-separated)"
              className="input-gold"
            />
          </div>

          {/* Due Date */}
          <div className="form-group">
            <label className="form-label">
              <Icon icon="lucide:calendar" className="w-4 h-4 inline mr-2" />
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isLoading}
              className="input-gold"
            />
          </div>

          {/* Daily Toggle */}
          <label className="flex items-center gap-4 p-4 glass-card-static rounded-lg cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={isDaily}
                onChange={(e) => setIsDaily(e.target.checked)}
                disabled={isLoading}
                className="sr-only"
              />
              <div className={`w-12 h-6 rounded-full transition-all duration-300 ${
                isDaily ? 'bg-gold' : 'bg-white/10'
              }`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-lg transform transition-transform duration-300 absolute top-0.5 ${
                  isDaily ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </div>
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-text-primary block">Daily Task</span>
              <span className="text-xs text-text-tertiary">This task repeats every day</span>
            </div>
            <Icon icon="lucide:repeat" className={`w-5 h-5 transition-colors ${isDaily ? 'text-gold' : 'text-text-tertiary'}`} />
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-lg btn-gold-outline font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-lg btn-gold font-semibold text-deep flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-deep/30 border-t-deep rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Icon icon={task ? 'lucide:check' : 'lucide:plus'} className="w-4 h-4" />
                  <span>{task ? 'Update' : 'Create'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
