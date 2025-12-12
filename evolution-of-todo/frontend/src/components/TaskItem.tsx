'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Task, Priority } from '@/types/task';
import { taskAPI } from '@/services/api';

interface TaskItemProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
}

const priorityConfig: Record<Priority, { icon: string; gradient: string; label: string }> = {
  high: { icon: '🔥', gradient: 'from-orange-400 to-pink-500', label: 'Urgent' },
  medium: { icon: '⚡', gradient: 'from-amber-400 to-yellow-500', label: 'Important' },
  low: { icon: '☕', gradient: 'from-slate-400 to-slate-600', label: 'Low' },
};

export default function TaskItem({
  task,
  onUpdate,
  onDelete,
  onEdit,
}: TaskItemProps) {
  const [isLoading, setIsLoading] = useState(false);

  const createParticles = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const colors = ['#c9a962', '#e4c77b', '#d4919b'];

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      document.body.appendChild(particle);

      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;

      const tx = (Math.random() - 0.5) * 200 + 'px';
      const ty = (Math.random() - 0.5) * 200 + 'px';
      particle.style.setProperty('--tx', tx);
      particle.style.setProperty('--ty', ty);

      setTimeout(() => particle.remove(), 600);
    }
  };

  const handleToggle = async (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    setIsLoading(true);
    try {
      const updated = await taskAPI.markTaskComplete(task.id);
      if (updated.is_completed) {
        createParticles(e.currentTarget);

        // For regular tasks: delete after marking complete
        // For daily tasks: keep them (allow undo)
        if (!task.is_daily) {
          // Show strikethrough effect briefly, then delete
          setTimeout(() => {
            onDelete(task.id);
          }, 300);
        } else {
          // Daily tasks: just update state
          onUpdate(updated);
        }
      } else {
        // Task was marked as incomplete (undo)
        onUpdate(updated);
      }
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
      // Handle error silently
    } finally {
      setIsLoading(false);
    }
  };

  const priorityInfo = priorityConfig[task.priority as Priority];
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const isOverdue = dueDate && dueDate < new Date() && !task.is_completed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      className={`task-item glass-card p-4 rounded-xl flex items-center gap-4 group cursor-pointer relative overflow-hidden ${
        task.is_completed ? 'completed' : ''
      }`}
      onClick={handleToggle}
    >
      {/* Accent Border */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${priorityInfo.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

      {/* Checkbox */}
      <label className="custom-checkbox relative flex items-center justify-center w-6 h-6 cursor-pointer z-10" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          className="hidden"
          checked={task.is_completed}
          onChange={() => {}}
          disabled={isLoading}
        />
        <div className="w-5 h-5 border-2 border-slate-600 rounded-md transition-all duration-300 flex items-center justify-center hover:border-amber-400 bg-slate-800/50">
          <svg className="w-3.5 h-3.5 text-slate-900 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path className="checkmark-path" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      </label>

      {/* Content */}
      <div className="flex-1 min-w-0 z-10">
        <h4 className={`task-text text-sm font-medium transition-colors truncate ${
          task.is_completed
            ? 'line-through text-slate-500'
            : 'text-white group-hover:text-amber-100'
        }`}>
          {task.description}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          {dueDate && (
            <>
              <span className={`text-xs ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                {isOverdue ? 'Overdue: ' : ''}{dueDate.toLocaleDateString()}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-600"></span>
            </>
          )}
          <span className={`text-[10px] px-1.5 py-0.5 rounded priority-badge-${task.priority}`}>
            {priorityInfo.label}
          </span>
          {task.tags && task.tags.split(',').map((tag) => (
            <span key={tag.trim()} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {tag.trim()}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
          disabled={isLoading}
          className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors"
          title="Edit"
        >
          <Icon icon="ic:outline-edit" className="w-4 h-4 text-slate-400 hover:text-purple-400" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          disabled={isLoading}
          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
          title="Delete"
        >
          <Icon icon="ic:outline-delete" className="w-4 h-4 text-slate-400 hover:text-red-400" />
        </motion.button>
      </div>
    </motion.div>
  );
}
