'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ProtectedAppLayout from '@/components/ProtectedAppLayout';
import TaskList from '@/components/TaskList';
import { Task, TaskCreateRequest } from '@/types/task';
import { taskAPI } from '@/services/api';

type DateFilter = 'overdue' | 'today' | 'tomorrow' | 'week' | 'next-week' | 'later' | 'no-date';

function UpcomingContent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<DateFilter>('week');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    filterTasksByDate();
  }, [tasks, selectedFilter]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await taskAPI.getTasks(0, 1000);
      setTasks(response.items);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const filterTasksByDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    const endOfNextWeek = new Date(today);
    endOfNextWeek.setDate(endOfNextWeek.getDate() + 14);

    const filtered = tasks.filter((task) => {
      // Don't show completed tasks in upcoming
      if (task.is_completed) return false;

      if (!task.due_date) {
        return selectedFilter === 'no-date';
      }

      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);

      switch (selectedFilter) {
        case 'overdue':
          return dueDate < today;
        case 'today':
          return dueDate.getTime() === today.getTime();
        case 'tomorrow':
          return dueDate.getTime() === tomorrow.getTime();
        case 'week':
          return dueDate >= today && dueDate < endOfWeek;
        case 'next-week':
          return dueDate >= endOfWeek && dueDate < endOfNextWeek;
        case 'later':
          return dueDate >= endOfNextWeek;
        case 'no-date':
          return !task.due_date;
        default:
          return false;
      }
    });

    setFilteredTasks(filtered);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  const handleTaskDelete = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success('Task deleted');
  };

  const filterButtons: { label: string; value: DateFilter; icon: string }[] = [
    { label: 'Overdue', value: 'overdue', icon: '⚠️' },
    { label: 'Today', value: 'today', icon: '📅' },
    { label: 'Tomorrow', value: 'tomorrow', icon: '➡️' },
    { label: 'This Week', value: 'week', icon: '📆' },
    { label: 'Next Week', value: 'next-week', icon: '📊' },
    { label: 'Later', value: 'later', icon: '🚀' },
    { label: 'No Due Date', value: 'no-date', icon: '∞' },
  ];

  return (
    <ProtectedAppLayout>
      <Toaster position="bottom-right" />

      {/* Header */}
      <header className="px-6 py-6 md:px-10 md:py-8 flex-shrink-0">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium tracking-tight text-white mb-2">
            Upcoming Tasks
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Stay on top of your deadlines and plan ahead
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {filterButtons.map((button) => (
            <motion.button
              key={button.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedFilter(button.value)}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                selectedFilter === button.value
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-lg shadow-amber-500/20'
                  : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="mr-1">{button.icon}</span>
              {button.label}
            </motion.button>
          ))}
        </div>
      </header>

      {/* Task List Container */}
      <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-20 md:pb-8 scroll-smooth">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-64 text-center"
          >
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-lg font-semibold text-white mb-2">All caught up!</h3>
            <p className="text-slate-400 text-sm">No tasks for {filterButtons.find((b) => b.value === selectedFilter)?.label.toLowerCase()}</p>
          </motion.div>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onUpdate={handleTaskUpdate}
            onDelete={handleTaskDelete}
            onEdit={() => {}} // Can be implemented if needed
            isLoading={isLoading}
          />
        )}
      </div>
    </ProtectedAppLayout>
  );
}

export default function UpcomingPage() {
  return (
    <ProtectedRoute>
      <UpcomingContent />
    </ProtectedRoute>
  );
}
