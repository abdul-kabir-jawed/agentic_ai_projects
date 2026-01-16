'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { Icon } from '@iconify/react';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import TaskItem from '@/components/TaskItem';
import TaskForm from '@/components/TaskForm';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useChatModal } from '@/contexts/ChatModalContext';
import { Task, TaskCreateRequest, Priority } from '@/types/task';
import { taskAPI } from '@/services/api';

function HomeContent() {
  const { user } = useAuth();
  const { onTaskChange } = useChatModal();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<Priority | 'all'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'due_date' | 'priority'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await taskAPI.getTasks(0, 100, {
        search: searchQuery || undefined,
        priority: activeFilter !== 'all' ? activeFilter : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      if (Array.isArray(response?.items)) {
        setTasks(response.items);
      } else {
        setTasks([]);
      }
    } catch (error) {
      setTasks([]);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, activeFilter, sortBy, sortOrder]);

  // Listen for task changes from AI chat
  useEffect(() => {
    const unsubscribe = onTaskChange(() => {
      // Refresh tasks when AI chat creates/updates/deletes tasks
      fetchTasks();
    });
    return unsubscribe;
  }, [onTaskChange, fetchTasks]);

  useEffect(() => {
    const debounce = setTimeout(fetchTasks, 300);
    return () => clearTimeout(debounce);
  }, [fetchTasks]);

  const handleCreateTask = async (data: TaskCreateRequest) => {
    try {
      const newTask = await taskAPI.createTask(data);
      setTasks((prev) => [newTask, ...prev]);
      setShowForm(false);
      toast.success('Task created!');
    } catch (error) {
      toast.error('Failed to create task');
      throw error;
    }
  };

  const handleUpdateTask = async (data: TaskCreateRequest) => {
    if (!editingTask) return;
    try {
      const updated = await taskAPI.updateTask(editingTask.id, data);
      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updated : t)));
      setEditingTask(undefined);
      setShowForm(false);
      toast.success('Task updated!');
    } catch (error) {
      toast.error('Failed to update task');
      throw error;
    }
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    if (updatedTask.is_completed) {
      toast.success('Task completed!');
    }
  };

  const handleTaskDelete = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success('Task deleted');
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const completedCount = safeTasks.filter((t) => t.is_completed).length;
  const totalCount = safeTasks.length;
  const highPriorityCount = safeTasks.filter((t) => t.priority === 'high' && !t.is_completed).length;

  // Group tasks by priority and completion
  const groupedTasks = {
    high: safeTasks.filter((t) => t.priority === 'high' && !t.is_completed),
    medium: safeTasks.filter((t) => t.priority === 'medium' && !t.is_completed),
    low: safeTasks.filter((t) => t.priority === 'low' && !t.is_completed),
    completed: safeTasks.filter((t) => t.is_completed),
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden relative bg-void">
      <Toaster position="bottom-right" />

      {/* Background Effects - Matching Landing Page */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-gold/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-rose/5 rounded-full blur-[120px]" />

        {/* Grid overlay for depth */}
        <div 
          className="absolute inset-0 opacity-20" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='rgba(255,255,255,0.02)' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Sidebar */}
      <Sidebar completedCount={completedCount} totalCount={totalCount} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden z-10 relative">
        {/* Header */}
        <header className="px-6 py-6 md:px-10 md:py-8 flex-shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            {/* Greeting */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-serif font-medium text-text-primary mb-2"
              >
                {getGreeting()}, <span className="text-gradient-gold">{user?.username || 'there'}</span>
              </motion.h1>
              <p className="text-text-secondary text-sm">
                {highPriorityCount > 0 ? (
                  <>You have <span className="text-orange-400 font-medium">{highPriorityCount} urgent</span> {highPriorityCount === 1 ? 'task' : 'tasks'} to focus on.</>
                ) : completedCount === totalCount && totalCount > 0 ? (
                  <span className="text-gold">All tasks completed! Well done.</span>
                ) : (
                  'What will you accomplish today?'
                )}
              </p>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Icon icon="lucide:search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="w-64 bg-surface border border-white/10 rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all duration-300 pl-10 pr-4 py-2.5"
                />
              </div>
            </div>
          </div>

          {/* Filters & Controls */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {(['all', 'high', 'medium', 'low'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeFilter === filter
                      ? filter === 'high'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : filter === 'medium'
                        ? 'bg-gold/20 text-gold border border-gold/30'
                        : filter === 'low'
                        ? 'bg-white/10 text-text-primary border border-white/20'
                        : 'bg-gold/10 text-gold border border-gold/30'
                      : 'bg-white/5 text-text-tertiary border border-white/5 hover:border-white/20'
                  }`}
                >
                  {filter === 'all' ? 'All Tasks' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2 ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'created_at' | 'due_date' | 'priority')}
                className="bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-text-secondary focus:outline-none focus:border-gold/50"
              >
                <option value="created_at">Date Created</option>
                <option value="due_date">Due Date</option>
                <option value="priority">Priority</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 rounded-lg border border-white/10 bg-surface hover:border-gold/30 transition-colors"
              >
                <Icon
                  icon={sortOrder === 'asc' ? 'lucide:arrow-up' : 'lucide:arrow-down'}
                  className="w-4 h-4 text-text-secondary"
                />
              </button>
            </div>
          </div>
        </header>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-24 md:pb-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-text-tertiary text-sm">Loading tasks...</p>
            </div>
          ) : safeTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mb-6">
                <Icon icon="lucide:clipboard-list" className="w-10 h-10 text-gold" />
              </div>
              <h3 className="text-xl font-serif font-medium text-text-primary mb-2">
                {searchQuery || activeFilter !== 'all' ? 'No tasks found' : 'No tasks yet'}
              </h3>
              <p className="text-text-tertiary text-sm mb-6 max-w-sm">
                {searchQuery || activeFilter !== 'all'
                  ? 'Try adjusting your filters or search query.'
                  : 'Start by creating your first task to organize your day.'}
              </p>
              {!searchQuery && activeFilter === 'all' && (
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-gold px-6 py-3 rounded-lg font-semibold text-deep flex items-center gap-2"
                >
                  <Icon icon="lucide:plus" className="w-4 h-4" />
                  Create Task
                </button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-8">
              {/* Urgent Tasks */}
              {groupedTasks.high.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Icon icon="lucide:flame" className="w-5 h-5 text-orange-400" />
                    <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider">Urgent</h2>
                    <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">{groupedTasks.high.length}</span>
                  </div>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {groupedTasks.high.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onUpdate={handleTaskUpdate}
                          onDelete={handleTaskDelete}
                          onEdit={handleEdit}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )}

              {/* Important Tasks */}
              {groupedTasks.medium.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Icon icon="lucide:zap" className="w-5 h-5 text-gold" />
                    <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider">Important</h2>
                    <span className="text-xs text-gold bg-gold/10 px-2 py-0.5 rounded-full">{groupedTasks.medium.length}</span>
                  </div>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {groupedTasks.medium.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onUpdate={handleTaskUpdate}
                          onDelete={handleTaskDelete}
                          onEdit={handleEdit}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )}

              {/* Low Priority Tasks */}
              {groupedTasks.low.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Icon icon="lucide:coffee" className="w-5 h-5 text-text-tertiary" />
                    <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider">Later</h2>
                    <span className="text-xs text-text-tertiary bg-white/5 px-2 py-0.5 rounded-full">{groupedTasks.low.length}</span>
                  </div>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {groupedTasks.low.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onUpdate={handleTaskUpdate}
                          onDelete={handleTaskDelete}
                          onEdit={handleEdit}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )}

              {/* Completed Tasks */}
              {groupedTasks.completed.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Icon icon="lucide:check-circle" className="w-5 h-5 text-green-500" />
                    <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider">Completed</h2>
                    <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">{groupedTasks.completed.length}</span>
                  </div>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {groupedTasks.completed.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onUpdate={handleTaskUpdate}
                          onDelete={handleTaskDelete}
                          onEdit={handleEdit}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <MobileNav />
      </main>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setEditingTask(undefined);
          setShowForm(true);
        }}
        className="fab"
      >
        <Icon icon="lucide:plus" className="w-6 h-6" />
      </motion.button>

      {/* Task Form Modal */}
      <AnimatePresence>
        {showForm && (
          <TaskForm
            task={editingTask}
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            onCancel={() => {
              setShowForm(false);
              setEditingTask(undefined);
            }}
            isLoading={isLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}
