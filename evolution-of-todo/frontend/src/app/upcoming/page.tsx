'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ProtectedAppLayout from '@/components/ProtectedAppLayout';
import { Task } from '@/types/task';
import { taskAPI } from '@/services/api';

type DateFilter = 'all' | 'overdue' | 'today' | 'tomorrow' | 'week' | 'later';

interface TimelineGroup {
  label: string;
  icon: string;
  color: string;
  tasks: Task[];
  isOverdue?: boolean;
}

function UpcomingContent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<DateFilter>('all');
  const taskRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await taskAPI.getTasks(0, 100, { sort_by: 'due_date', sort_order: 'asc' });
      if (Array.isArray(response?.items)) {
        setTasks(response.items);
      } else {
        setTasks([]);
      }
    } catch (error) {
      toast.error('Failed to load tasks');
      setTasks([]);
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

  const getTimelineGroups = (): TimelineGroup[] => {
    if (!Array.isArray(tasks)) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const groups: { [key: string]: Task[] } = {
      overdue: [],
      today: [],
      tomorrow: [],
      week: [],
      later: [],
      noDate: [],
    };

    tasks.forEach((task) => {
      if (task.is_completed) return;

      if (!task.due_date) {
        groups.noDate.push(task);
        return;
      }

      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        groups.overdue.push(task);
      } else if (dueDate.getTime() === today.getTime()) {
        groups.today.push(task);
      } else if (dueDate.getTime() === tomorrow.getTime()) {
        groups.tomorrow.push(task);
      } else if (dueDate < endOfWeek) {
        groups.week.push(task);
      } else {
        groups.later.push(task);
      }
    });

    const timelineGroups: TimelineGroup[] = [];

    if (groups.overdue.length > 0 && (selectedFilter === 'all' || selectedFilter === 'overdue')) {
      timelineGroups.push({
        label: 'Overdue',
        icon: 'lucide:alert-triangle',
        color: 'rose',
        tasks: groups.overdue,
        isOverdue: true,
      });
    }

    if (groups.today.length > 0 && (selectedFilter === 'all' || selectedFilter === 'today')) {
      timelineGroups.push({
        label: 'Today',
        icon: 'lucide:sun',
        color: 'gold',
        tasks: groups.today,
      });
    }

    if (groups.tomorrow.length > 0 && (selectedFilter === 'all' || selectedFilter === 'tomorrow')) {
      timelineGroups.push({
        label: 'Tomorrow',
        icon: 'lucide:sunrise',
        color: 'orange',
        tasks: groups.tomorrow,
      });
    }

    if (groups.week.length > 0 && (selectedFilter === 'all' || selectedFilter === 'week')) {
      timelineGroups.push({
        label: 'This Week',
        icon: 'lucide:calendar',
        color: 'cyan',
        tasks: groups.week,
      });
    }

    if (groups.later.length > 0 && (selectedFilter === 'all' || selectedFilter === 'later')) {
      timelineGroups.push({
        label: 'Later',
        icon: 'lucide:clock',
        color: 'purple',
        tasks: groups.later,
      });
    }

    if (groups.noDate.length > 0 && selectedFilter === 'all') {
      timelineGroups.push({
        label: 'No Due Date',
        icon: 'lucide:infinity',
        color: 'slate',
        tasks: groups.noDate,
      });
    }

    return timelineGroups;
  };

  const handleTaskToggle = async (task: Task) => {
    try {
      const updated = await taskAPI.markTaskComplete(task.id);

      if (updated.is_completed) {
        const taskElement = taskRefs.current.get(task.id);
        if (taskElement) {
          createParticles(taskElement);
        }
        toast.success('Task completed!');
      }

      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? updated : t))
      );
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleTaskDelete = async (taskId: number) => {
    try {
      await taskAPI.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const timelineGroups = getTimelineGroups();
  const totalUpcoming = tasks.filter(t => !t.is_completed).length;
  const overdueCount = tasks.filter(t => {
    if (t.is_completed || !t.due_date) return false;
    const dueDate = new Date(t.due_date);
    dueDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  }).length;

  const filterButtons: { label: string; value: DateFilter; icon: string }[] = [
    { label: 'All', value: 'all', icon: 'lucide:layers' },
    { label: 'Overdue', value: 'overdue', icon: 'lucide:alert-triangle' },
    { label: 'Today', value: 'today', icon: 'lucide:sun' },
    { label: 'Tomorrow', value: 'tomorrow', icon: 'lucide:sunrise' },
    { label: 'This Week', value: 'week', icon: 'lucide:calendar' },
    { label: 'Later', value: 'later', icon: 'lucide:clock' },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; border: string; text: string; line: string } } = {
      rose: { bg: 'bg-rose/10', border: 'border-rose/30', text: 'text-rose', line: 'bg-rose' },
      gold: { bg: 'bg-gold/10', border: 'border-gold/30', text: 'text-gold', line: 'bg-gold' },
      orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', line: 'bg-orange-400' },
      cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', line: 'bg-cyan-400' },
      purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', line: 'bg-purple-400' },
      slate: { bg: 'bg-white/5', border: 'border-white/10', text: 'text-text-tertiary', line: 'bg-white/20' },
    };
    return colorMap[color] || colorMap.slate;
  };

  return (
    <ProtectedAppLayout completedCount={tasks.filter(t => t.is_completed).length} totalCount={tasks.length}>
      {/* Header */}
      <header className="px-6 py-6 md:px-10 md:py-8 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-serif font-medium text-text-primary mb-2"
            >
              Upcoming
            </motion.h1>
            <p className="text-text-secondary text-sm">
              {overdueCount > 0 ? (
                <>
                  <span className="text-rose font-medium">{overdueCount} overdue</span> tasks need your attention
                </>
              ) : (
                'Stay on top of your deadlines and plan ahead'
              )}
            </p>
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4"
          >
            <div className="glass-card-static px-4 py-3 rounded-xl text-center">
              <p className="text-2xl font-serif font-bold text-gold">{totalUpcoming}</p>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Upcoming</p>
            </div>
            {overdueCount > 0 && (
              <div className="glass-card-static px-4 py-3 rounded-xl text-center border border-rose/20">
                <p className="text-2xl font-serif font-bold text-rose">{overdueCount}</p>
                <p className="text-[10px] text-rose/60 uppercase tracking-wider">Overdue</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Filter Pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2"
        >
          {filterButtons.map((button) => (
            <button
              key={button.value}
              onClick={() => setSelectedFilter(button.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                selectedFilter === button.value
                  ? button.value === 'overdue'
                    ? 'bg-rose/20 text-rose border border-rose/30'
                    : 'bg-gold/20 text-gold border border-gold/30'
                  : 'bg-white/5 text-text-tertiary border border-white/5 hover:border-white/20'
              }`}
            >
              <Icon icon={button.icon} className="w-4 h-4" />
              {button.label}
            </button>
          ))}
        </motion.div>
      </header>

      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-24 md:pb-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-text-tertiary text-sm">Loading tasks...</p>
          </div>
        ) : timelineGroups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mb-6">
              <Icon icon="lucide:calendar-check" className="w-10 h-10 text-gold" />
            </div>
            <h3 className="text-xl font-serif font-medium text-text-primary mb-2">
              All caught up!
            </h3>
            <p className="text-text-tertiary text-sm mb-6 max-w-sm">
              No upcoming tasks for this period. Great job staying on top of things!
            </p>
          </motion.div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-gold/50 via-gold/20 to-transparent" />

            {/* Timeline Groups */}
            <div className="space-y-8">
              {timelineGroups.map((group, groupIndex) => {
                const colorClasses = getColorClasses(group.color);

                return (
                  <motion.div
                    key={group.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: groupIndex * 0.1 }}
                  >
                    {/* Group Header */}
                    <div className="flex items-center gap-4 mb-4">
                      {/* Timeline Node */}
                      <div className={`relative z-10 w-12 h-12 rounded-xl ${colorClasses.bg} border ${colorClasses.border} flex items-center justify-center`}>
                        <Icon icon={group.icon} className={`w-6 h-6 ${colorClasses.text}`} />
                      </div>
                      <div>
                        <h2 className={`text-lg font-serif font-medium ${colorClasses.text}`}>
                          {group.label}
                        </h2>
                        <p className="text-xs text-text-tertiary">
                          {group.tasks.length} task{group.tasks.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Tasks */}
                    <div className="ml-6 pl-10 border-l border-white/5 space-y-3">
                      <AnimatePresence>
                        {group.tasks.map((task, taskIndex) => (
                          <motion.div
                            key={task.id}
                            ref={(el) => {
                              if (el) taskRefs.current.set(task.id, el);
                            }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: taskIndex * 0.03 }}
                            className={`group glass-card-static p-4 rounded-xl flex items-center gap-4 transition-all duration-300 ${
                              group.isOverdue ? 'border-rose/20' : 'hover:border-gold/20'
                            }`}
                          >
                            {/* Checkbox */}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleTaskToggle(task)}
                              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                group.isOverdue
                                  ? 'border-rose/50 hover:border-rose'
                                  : 'border-white/20 hover:border-gold/50'
                              }`}
                            />

                            {/* Task Content */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text-primary">
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
                                {task.due_date && (
                                  <span className={`text-[10px] ${group.isOverdue ? 'text-rose' : 'text-text-tertiary'}`}>
                                    <Icon icon="lucide:calendar" className="w-3 h-3 inline mr-1" />
                                    {formatDueDate(task.due_date)}
                                  </span>
                                )}
                                {task.tags && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                    #{task.tags.split(',')[0].trim()}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Overdue Warning */}
                            {group.isOverdue && (
                              <div className="flex-shrink-0">
                                <Icon icon="lucide:alert-circle" className="w-5 h-5 text-rose" />
                              </div>
                            )}

                            {/* Delete Button */}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleTaskDelete(task.id)}
                              className="p-2 hover:bg-rose/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Icon icon="lucide:trash-2" className="w-4 h-4 text-text-tertiary hover:text-rose" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
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
