'use client';

import React, { useState, memo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Task, Priority } from '@/types/task';
import { taskAPI } from '@/services/api';
import { useFocusMode } from '@/contexts/FocusModeContext';

interface TaskItemProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const priorityConfig: Record<Priority, { icon: string; color: string; bgColor: string; label: string }> = {
  high: { icon: 'lucide:flame', color: 'text-orange-400', bgColor: 'bg-orange-500/10 border-orange-500/20', label: 'Urgent' },
  medium: { icon: 'lucide:zap', color: 'text-gold', bgColor: 'bg-gold/10 border-gold/20', label: 'Important' },
  low: { icon: 'lucide:coffee', color: 'text-text-tertiary', bgColor: 'bg-white/5 border-white/10', label: 'Low' },
};

function TaskItem({ task, onUpdate, onDelete, onEdit }: TaskItemProps) {
  const router = useRouter();
  const { startFocusMode } = useFocusMode();
  const [isLoading, setIsLoading] = useState(false);
  const taskRef = useRef<HTMLDivElement>(null);

  const handleStartFocus = async () => {
    await startFocusMode(task.id);
    router.push(`/focus?taskId=${task.id}`);
  };

  const createParticles = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const colors = ['#c9a962', '#e4c77b', '#d4919b', '#b76e79'];

    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      document.body.appendChild(particle);

      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;

      const tx = (Math.random() - 0.5) * 150 + 'px';
      const ty = (Math.random() - 0.5) * 150 + 'px';
      particle.style.setProperty('--tx', tx);
      particle.style.setProperty('--ty', ty);

      setTimeout(() => particle.remove(), 600);
    }
  };

  const toggleCompletion = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const updated = await taskAPI.markTaskComplete(task.id);

      if (updated.is_completed && taskRef.current) {
        createParticles(taskRef.current);
      }

      onUpdate(updated);
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await taskAPI.deleteTask(task.id);
      onDelete(task.id);
    } catch (error) {
      console.error('Failed to delete task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const priorityInfo = priorityConfig[task.priority as Priority];
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = dueDate && new Date(dueDate.setHours(0, 0, 0, 0)) < today && !task.is_completed;

  const formatDueDate = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days === -1) return 'Yesterday';
    if (days < -1) return `${Math.abs(days)} days ago`;
    if (days < 7) return `In ${days} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      ref={taskRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      whileHover={{ y: -2 }}
      className={`group relative ${task.is_completed ? 'opacity-60' : ''}`}
    >
      <div className={`glass-card-static p-4 rounded-xl flex items-start gap-4 transition-all duration-300
        ${task.is_completed ? '' : 'hover:border-gold/20 hover:shadow-gold/5 hover:shadow-lg'}
        ${isOverdue ? 'border-rose/30' : ''}
      `}>
        {/* Priority Accent Line */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-opacity
          ${task.priority === 'high' ? 'bg-gradient-to-b from-orange-400 to-rose' : ''}
          ${task.priority === 'medium' ? 'bg-gradient-to-b from-gold to-gold-bright' : ''}
          ${task.priority === 'low' ? 'bg-gradient-to-b from-text-tertiary to-text-secondary' : ''}
          ${task.is_completed ? 'opacity-30' : 'opacity-0 group-hover:opacity-100'}
        `} />

        {/* Checkbox */}
        <button
          onClick={toggleCompletion}
          disabled={isLoading}
          className="flex-shrink-0 relative mt-0.5"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300
              ${task.is_completed
                ? 'bg-gold border-gold'
                : `border-white/20 hover:border-gold/50 ${isOverdue ? 'border-rose/50' : ''}`
              }
            `}
          >
            {task.is_completed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <Icon icon="lucide:check" className="w-4 h-4 text-void" />
              </motion.div>
            )}
          </motion.div>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium leading-relaxed transition-all duration-300 ${
            task.is_completed
              ? 'line-through text-text-tertiary'
              : 'text-text-primary group-hover:text-gold-bright'
          }`}>
            {task.description}
          </h4>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* Priority Badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${priorityInfo.bgColor} ${priorityInfo.color}`}>
              <Icon icon={priorityInfo.icon} className="w-3 h-3" />
              {priorityInfo.label}
            </span>

            {/* Due Date */}
            {dueDate && (
              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border
                ${isOverdue
                  ? 'bg-rose/10 border-rose/20 text-rose'
                  : 'bg-white/5 border-white/10 text-text-tertiary'
                }
              `}>
                <Icon icon={isOverdue ? 'lucide:alert-circle' : 'lucide:calendar'} className="w-3 h-3" />
                {formatDueDate(new Date(task.due_date!))}
              </span>
            )}

            {/* Daily Badge */}
            {task.is_daily && (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose/10 border border-rose/20 text-rose-bright">
                <Icon icon="lucide:repeat" className="w-3 h-3" />
                Daily
              </span>
            )}

            {/* Tags */}
            {task.tags && task.tags.split(',').filter(t => t.trim()).map((tag) => (
              <span
                key={tag.trim()}
                className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20"
              >
                #{tag.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {/* Focus Mode Button - only show for incomplete tasks */}
          {!task.is_completed && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleStartFocus}
              disabled={isLoading}
              className="p-2 hover:bg-gold/10 rounded-lg transition-colors"
              title="Focus on this task"
            >
              <Icon icon="lucide:target" className="w-4 h-4 text-text-tertiary hover:text-gold" />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(task)}
            disabled={isLoading}
            className="p-2 hover:bg-gold/10 rounded-lg transition-colors"
            title="Edit"
          >
            <Icon icon="lucide:pencil" className="w-4 h-4 text-text-tertiary hover:text-gold" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            disabled={isLoading}
            className="p-2 hover:bg-rose/10 rounded-lg transition-colors"
            title="Delete"
          >
            <Icon icon="lucide:trash-2" className="w-4 h-4 text-text-tertiary hover:text-rose" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(TaskItem);
