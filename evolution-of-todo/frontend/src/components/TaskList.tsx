'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskItem from './TaskItem';
import { Task } from '@/types/task';

interface TaskListProps {
  tasks: Task[];
  onUpdate: (task: Task) => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function TaskList({
  tasks,
  onUpdate,
  onDelete,
  onEdit,
  isLoading = false,
  emptyMessage = 'No tasks yet. Create one to get started!',
}: TaskListProps) {
  // Group tasks by priority
  const groupedTasks = {
    high: tasks.filter((t) => t.priority === 'high' && !t.is_completed),
    medium: tasks.filter((t) => t.priority === 'medium' && !t.is_completed),
    low: tasks.filter((t) => t.priority === 'low' && !t.is_completed),
    completed: tasks.filter((t) => t.is_completed),
  };

  const priorityOrder = [
    { key: 'high' as const, label: 'High Priority', icon: '🔥', color: 'text-orange-400/90' },
    { key: 'medium' as const, label: 'Medium Priority', icon: '⚡', color: 'text-amber-400/90' },
    { key: 'low' as const, label: 'Low Priority', icon: '☕', color: 'text-slate-400/90' },
    { key: 'completed' as const, label: 'Completed', icon: '✅', color: 'text-emerald-400/90' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-amber-400/30 border-t-amber-400 rounded-full"
        />
      </div>
    );
  }

  const hasAnyTasks = Object.values(groupedTasks).some((group) => group.length > 0);

  if (!hasAnyTasks) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-96 text-white/60"
      >
        <div className="text-6xl mb-4">📝</div>
        <p className="text-lg">{emptyMessage}</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {priorityOrder.map(({ key, label, icon, color }) => {
        const groupTasks = groupedTasks[key];
        if (groupTasks.length === 0) return null;

        return (
          <motion.section
            key={key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className={`flex items-center gap-2 mb-4 ${color}`}>
              <span className={`${key === 'high' ? 'animate-bounce' : ''}`}>{icon}</span>
              <h3 className="text-xs font-semibold uppercase tracking-widest opacity-80">
                {label}
              </h3>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {groupTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
        );
      })}
    </div>
  );
}
