'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ProtectedAppLayout from '@/components/ProtectedAppLayout';
import { Task } from '@/types/task';
import { taskAPI } from '@/services/api';

function DailyTasksContent() {
  const [dailyTasks, setDailyTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDailyTasks();
  }, []);

  const fetchDailyTasks = async () => {
    setIsLoading(true);
    try {
      const tasks = await taskAPI.getDailyTasks();
      setDailyTasks(tasks);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load daily tasks';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskToggle = async (task: Task) => {
    try {
      const updated = await taskAPI.markTaskComplete(task.id);
      setDailyTasks((prev) =>
        prev.map((t) => (t.id === task.id ? updated : t))
      );
      toast.success(updated.is_completed ? 'Task completed! Great job! 🎉' : 'Task marked as incomplete');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update task';
      toast.error(errorMsg);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await taskAPI.deleteTask(taskId);
      setDailyTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success('Daily task deleted');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete task';
      toast.error(errorMsg);
    }
  };

  const completedCount = dailyTasks.filter((t) => t.is_completed).length;
  const totalCount = dailyTasks.length;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Generate last 10 days
  const getLast10Days = () => {
    const days = [];
    for (let i = 9; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const last10Days = getLast10Days();

  return (
    <ProtectedAppLayout>
      <Toaster position="bottom-right" />

      {/* Header */}
      <header className="px-6 py-6 md:px-10 md:py-8 flex-shrink-0">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium tracking-tight text-white mb-2">
            Daily Tasks
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Your daily habits and recurring tasks
          </p>
        </div>

        {/* Daily Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-4 sm:p-6 rounded-2xl border border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Today's Completion</p>
              <p className="text-2xl sm:text-3xl font-bold text-amber-400">
                {completedCount}/{totalCount}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400">
                {completionPercent}%
              </div>
            </div>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-600"
            />
          </div>
        </motion.div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-20 md:pb-8 scroll-smooth">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
          </div>
        ) : dailyTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-64 text-center"
          >
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-white mb-2">No daily tasks yet</h3>
            <p className="text-slate-400 text-sm">Mark tasks as daily to track them here</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Today's Daily Tasks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">🎯</span> Today's Tasks
              </h3>
              <div className="space-y-3">
                {dailyTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`glass-card p-4 rounded-xl flex items-center gap-4 group transition-all ${
                      task.is_completed ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className="w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer hover:border-amber-400"
                      style={{
                        borderColor: task.is_completed ? '#c9a962' : '#64748b',
                        backgroundColor: task.is_completed ? '#c9a962' : 'transparent',
                      }}
                      onClick={() => handleTaskToggle(task)}
                    >
                      {task.is_completed && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>

                    {/* Task Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        task.is_completed
                          ? 'line-through text-slate-500'
                          : 'text-white'
                      }`}>
                        {task.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          task.priority === 'high'
                            ? 'bg-orange-500/10 text-orange-400'
                            : task.priority === 'medium'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-slate-500/10 text-slate-400'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>

                    {/* Status Icon */}
                    {task.is_completed && (
                      <div className="text-2xl flex-shrink-0">✨</div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.error('Edit feature coming soon');
                        }}
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
                          handleDeleteTask(task.id);
                        }}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Icon icon="ic:outline-delete" className="w-4 h-4 text-slate-400 hover:text-red-400" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* 10-Day History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span> 10-Day History
              </h3>

              {/* Days Header */}
              <div className="glass-panel p-4 rounded-2xl border border-white/10 overflow-x-auto">
                <div className="space-y-4">
                  {dailyTasks.map((task) => (
                    <div key={task.id} className="pb-4 border-b border-white/10 last:border-b-0">
                      <p className="text-sm font-medium text-white mb-3">{task.description}</p>
                      <div className="flex gap-2 justify-between">
                        {last10Days.map((date, idx) => {
                          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          const isToday = new Date().toDateString() === date.toDateString();
                          // Simulated completion status - in real app would fetch from backend
                          const isCompleted = task.is_completed && isToday;

                          return (
                            <div key={idx} className="flex flex-col items-center gap-1">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all text-xs font-medium ${
                                isCompleted
                                  ? 'bg-amber-500/30 border border-amber-500/50 text-amber-300'
                                  : isToday
                                  ? 'bg-white/10 border border-white/20 text-slate-400'
                                  : 'bg-slate-800/30 border border-slate-700/50 text-slate-500'
                              }`}>
                                {isCompleted ? '✓' : '-'}
                              </div>
                              <span className="text-xs text-slate-500">{dateStr}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card p-4 rounded-xl text-center border border-white/10"
                >
                  <p className="text-xs text-slate-400 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-green-400">{completedCount}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card p-4 rounded-xl text-center border border-white/10"
                >
                  <p className="text-xs text-slate-400 mb-1">Remaining</p>
                  <p className="text-2xl font-bold text-orange-400">{totalCount - completedCount}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="glass-card p-4 rounded-xl text-center border border-white/10"
                >
                  <p className="text-xs text-slate-400 mb-1">Completion Rate</p>
                  <p className="text-2xl font-bold text-amber-400">{completionPercent}%</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </ProtectedAppLayout>
  );
}

export default function DailyTasksPage() {
  return (
    <ProtectedRoute>
      <DailyTasksContent />
    </ProtectedRoute>
  );
}
