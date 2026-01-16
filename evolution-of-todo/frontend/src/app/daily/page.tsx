'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ProtectedAppLayout from '@/components/ProtectedAppLayout';
import { Task } from '@/types/task';
import { taskAPI } from '@/services/api';

function DailyTasksContent() {
  const [dailyTasks, setDailyTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const taskRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    fetchDailyTasks();
  }, []);

  const fetchDailyTasks = async () => {
    setIsLoading(true);
    try {
      const tasks = await taskAPI.getDailyTasks();
      setDailyTasks(tasks);
    } catch (error) {
      toast.error('Failed to load daily tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const createParticles = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const colors = ['#c9a962', '#e4c77b', '#d4919b', '#b76e79'];

    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      document.body.appendChild(particle);

      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;

      const tx = (Math.random() - 0.5) * 120 + 'px';
      const ty = (Math.random() - 0.5) * 120 + 'px';
      particle.style.setProperty('--tx', tx);
      particle.style.setProperty('--ty', ty);

      setTimeout(() => particle.remove(), 600);
    }
  };

  const handleTaskToggle = async (task: Task) => {
    try {
      const updated = await taskAPI.markTaskComplete(task.id);

      if (updated.is_completed) {
        const taskElement = taskRefs.current.get(task.id);
        if (taskElement) {
          createParticles(taskElement);
        }
        toast.success('Daily task completed!');
      }

      setDailyTasks((prev) =>
        prev.map((t) => (t.id === task.id ? updated : t))
      );
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await taskAPI.deleteTask(taskId);
      setDailyTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success('Daily task removed');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const completedCount = dailyTasks.filter((t) => t.is_completed).length;
  const totalCount = dailyTasks.length;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Get today's date formatted
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateFormatted = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

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

  // Calculate streak (simulated - would come from backend in real app)
  const currentStreak = completedCount === totalCount && totalCount > 0 ? 1 : 0;
  const bestStreak = 7; // Would be fetched from backend

  // Motivational messages based on progress
  const getMotivationalMessage = () => {
    if (totalCount === 0) return "Add some daily habits to track your progress!";
    if (completionPercent === 100) return "Perfect day! You've completed all your daily tasks!";
    if (completionPercent >= 75) return "Almost there! You're doing great!";
    if (completionPercent >= 50) return "Halfway through! Keep pushing!";
    if (completionPercent >= 25) return "Good start! Stay focused!";
    return "Let's get started on today's goals!";
  };

  return (
    <ProtectedAppLayout completedCount={completedCount} totalCount={totalCount}>
      {/* Header */}
      <header className="px-6 py-6 md:px-10 md:py-8 flex-shrink-0">
        {/* Date Header */}
        <div className="mb-8">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gold text-sm font-medium uppercase tracking-widest mb-1"
          >
            {dayName}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-serif font-medium text-text-primary"
          >
            {dateFormatted}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary text-sm mt-2"
          >
            {getMotivationalMessage()}
          </motion.p>
        </div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card-static p-6 rounded-2xl"
        >
          <div className="flex items-center justify-between gap-6">
            {/* Progress Ring */}
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="3"
                />
                <motion.circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="url(#dailyGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="100"
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 100 - completionPercent }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="dailyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#c9a962" />
                    <stop offset="100%" stopColor="#e4c77b" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-text-primary">{completionPercent}%</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-serif font-bold text-gold">{completedCount}</span>
                <span className="text-text-tertiary">/ {totalCount}</span>
              </div>
              <p className="text-text-secondary text-sm mb-3">tasks completed today</p>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold to-gold-bright rounded-full relative overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-shimmer" />
                </motion.div>
              </div>
            </div>

            {/* Flame Icon */}
            {completionPercent === 100 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                className="flex-shrink-0"
              >
                <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center">
                  <Icon icon="lucide:flame" className="w-8 h-8 text-gold fire-animated" />
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-24 md:pb-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-text-tertiary text-sm">Loading daily tasks...</p>
          </div>
        ) : dailyTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mb-6">
              <Icon icon="lucide:repeat" className="w-10 h-10 text-gold" />
            </div>
            <h3 className="text-xl font-serif font-medium text-text-primary mb-2">
              No daily tasks yet
            </h3>
            <p className="text-text-tertiary text-sm mb-6 max-w-sm">
              Create tasks and mark them as "Daily" to track your daily habits here.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Daily Tasks List */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Icon icon="lucide:target" className="w-5 h-5 text-gold" />
                <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider">Today's Habits</h2>
                <span className="text-xs text-gold bg-gold/10 px-2 py-0.5 rounded-full">{totalCount}</span>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {dailyTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      ref={(el) => {
                        if (el) taskRefs.current.set(task.id, el);
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className={`group glass-card-static p-4 rounded-xl flex items-center gap-4 transition-all duration-300 ${
                        task.is_completed ? 'opacity-60' : 'hover:border-gold/20'
                      }`}
                    >
                      {/* Habit Checkbox */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleTaskToggle(task)}
                        className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                          task.is_completed
                            ? 'bg-gold border-gold'
                            : 'border-white/20 hover:border-gold/50'
                        }`}
                      >
                        {task.is_completed && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          >
                            <Icon icon="lucide:check" className="w-5 h-5 text-void" />
                          </motion.div>
                        )}
                      </motion.button>

                      {/* Task Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium transition-all duration-300 ${
                          task.is_completed
                            ? 'line-through text-text-tertiary'
                            : 'text-text-primary'
                        }`}>
                          {task.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${
                            task.priority === 'high'
                              ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                              : task.priority === 'medium'
                              ? 'bg-gold/10 border-gold/20 text-gold'
                              : 'bg-white/5 border-white/10 text-text-tertiary'
                          }`}>
                            <Icon
                              icon={task.priority === 'high' ? 'lucide:flame' : task.priority === 'medium' ? 'lucide:zap' : 'lucide:coffee'}
                              className="w-3 h-3"
                            />
                            {task.priority}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose/10 border border-rose/20 text-rose-bright">
                            <Icon icon="lucide:repeat" className="w-3 h-3" />
                            Daily
                          </span>
                        </div>
                      </div>

                      {/* Completed Badge */}
                      {task.is_completed && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex-shrink-0"
                        >
                          <Icon icon="lucide:sparkles" className="w-5 h-5 text-gold" />
                        </motion.div>
                      )}

                      {/* Delete Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 hover:bg-rose/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Icon icon="lucide:trash-2" className="w-4 h-4 text-text-tertiary hover:text-rose" />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>

            {/* 10-Day History */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Icon icon="lucide:calendar-days" className="w-5 h-5 text-gold" />
                <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider">10-Day History</h2>
              </div>

              <div className="glass-card-static p-5 rounded-xl overflow-x-auto">
                <div className="space-y-4">
                  {dailyTasks.map((task) => (
                    <div key={task.id} className="pb-4 border-b border-white/5 last:border-b-0 last:pb-0">
                      <p className="text-sm font-medium text-text-primary mb-3 truncate">{task.description}</p>
                      <div className="flex gap-2">
                        {last10Days.map((date, idx) => {
                          const dayNum = date.getDate();
                          const isToday = new Date().toDateString() === date.toDateString();
                          const isCompleted = task.is_completed && isToday;

                          return (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.03 }}
                              className="flex flex-col items-center gap-1"
                            >
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                                isCompleted
                                  ? 'bg-gold/20 border border-gold/40 text-gold'
                                  : isToday
                                  ? 'bg-white/10 border border-white/20 text-text-secondary'
                                  : 'bg-white/5 border border-white/5 text-text-tertiary'
                              }`}>
                                {isCompleted ? (
                                  <Icon icon="lucide:check" className="w-4 h-4" />
                                ) : (
                                  <span className="opacity-50">-</span>
                                )}
                              </div>
                              <span className={`text-[10px] ${isToday ? 'text-gold' : 'text-text-tertiary'}`}>
                                {dayNum}
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Stats Cards */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Icon icon="lucide:bar-chart-3" className="w-5 h-5 text-gold" />
                <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider">Statistics</h2>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card-static p-4 rounded-xl text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-3">
                    <Icon icon="lucide:flame" className="w-5 h-5 text-orange-400" />
                  </div>
                  <p className="text-2xl font-serif font-bold text-text-primary">{currentStreak}</p>
                  <p className="text-[10px] text-text-tertiary uppercase tracking-wider mt-1">Current Streak</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card-static p-4 rounded-xl text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
                    <Icon icon="lucide:trophy" className="w-5 h-5 text-gold" />
                  </div>
                  <p className="text-2xl font-serif font-bold text-text-primary">{bestStreak}</p>
                  <p className="text-[10px] text-text-tertiary uppercase tracking-wider mt-1">Best Streak</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card-static p-4 rounded-xl text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                    <Icon icon="lucide:percent" className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-2xl font-serif font-bold text-text-primary">{completionPercent}%</p>
                  <p className="text-[10px] text-text-tertiary uppercase tracking-wider mt-1">Completion Rate</p>
                </motion.div>
              </div>
            </section>
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
