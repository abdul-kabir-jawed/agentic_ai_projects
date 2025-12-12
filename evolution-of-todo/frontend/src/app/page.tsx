'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { Icon } from '@iconify/react';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import SearchBar from '@/components/SearchBar';
import FilterControls from '@/components/FilterControls';
import SortControls from '@/components/SortControls';
import FocusMode from '@/components/FocusMode';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import UserMenu from '@/components/UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import { Task, TaskCreateRequest } from '@/types/task';
import { taskAPI } from '@/services/api';

function HomeContent() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [isFocusModeActive, setIsFocusModeActive] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    priority: undefined as string | undefined,
    is_completed: undefined as boolean | undefined,
  });
  const [sort, setSort] = useState({
    sort_by: 'created_at' as 'created_at' | 'due_date' | 'priority',
    sort_order: 'desc' as 'asc' | 'desc',
  });

  useEffect(() => {
    fetchTasks();
  }, [filters, sort]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await taskAPI.getTasks(0, 100, {
        search: filters.search || undefined,
        priority: filters.priority,
        is_completed: filters.is_completed,
        sort_by: sort.sort_by,
        sort_order: sort.sort_order,
      });
      setTasks(response.items);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load tasks';
      toast.error(errorMsg.includes('Network') ? 'Backend unavailable - check if server is running' : errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (data: TaskCreateRequest) => {
    try {
      const newTask = await taskAPI.createTask(data);
      setTasks((prev) => [newTask, ...prev]);
      setShowForm(false);
      toast.success(data.is_daily ? 'Daily task created! 📅' : 'Task created successfully!');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create task';
      if (errorMsg.includes('Network') || errorMsg.includes('ECONNREFUSED')) {
        toast.error('Backend unavailable - make sure the server is running on port 8000');
      } else if (errorMsg.includes('400')) {
        toast.error('Invalid task data - check your input');
      } else {
        toast.error(errorMsg);
      }
      throw error;
    }
  };

  const handleUpdateTask = async (data: TaskCreateRequest) => {
    if (!editingTask) return;
    try {
      const updated = await taskAPI.updateTask(editingTask.id, data);
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? updated : t))
      );
      setEditingTask(undefined);
      setShowForm(false);
      toast.success('Task updated successfully!');
    } catch (error) {
      toast.error('Failed to update task');
      throw error;
    }
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

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTask(undefined);
  };

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const totalCount = tasks.length;
  const highPriorityCount = tasks.filter((t) => t.priority === 'high' && !t.is_completed).length;

  return (
    <ErrorBoundary>
      <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden relative">
      <Toaster position="bottom-right" />

      {/* Cosmic Aurora Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-900/30 rounded-full blur-[120px] animate-aurora-1 mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-fuchsia-900/20 rounded-full blur-[100px] animate-aurora-2 mix-blend-screen"></div>
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-cyan-900/20 rounded-full blur-[90px] animate-pulse-glow mix-blend-screen"></div>
        {/* Stars/Particles */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyIiBjeT0iMiIgcj0iMSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-30"></div>
      </div>

      {/* Left Sidebar */}
      <Sidebar completedCount={completedCount} totalCount={totalCount} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden z-10 relative">
        {/* Header & Search */}
        <header className="px-6 py-6 md:px-10 md:py-8 flex-shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium tracking-tight text-white mb-1">
                Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400">{user?.username || 'Guest'}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 line-clamp-2">
                {highPriorityCount > 0
                  ? `You have ${highPriorityCount} high-priority task${highPriorityCount !== 1 ? 's' : ''} remaining.`
                  : 'All caught up! Great work.'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <SearchBar
                onSearch={(query) => setFilters((prev) => ({ ...prev, search: query }))}
                isLoading={isLoading}
              />

              <button className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-slate-300 hover:text-white relative">
                <Icon icon="ic:outline-notifications" className="text-xl" />
                {highPriorityCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
                )}
              </button>
            </div>
          </div>

          {/* Filters & Sort */}
          <div className="mt-8 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-fit">
              <FilterControls
                onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
                isLoading={isLoading}
              />
            </div>
            <div className="hidden lg:flex">
              <SortControls
                onSortChange={(newSort) => setSort(newSort)}
                isLoading={isLoading}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const firstIncomplete = tasks.find((t) => !t.is_completed);
                if (firstIncomplete) {
                  setFocusTask(firstIncomplete);
                  setIsFocusModeActive(true);
                } else {
                  toast.error('No incomplete tasks to focus on');
                }
              }}
              disabled={isLoading}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all text-xs font-medium whitespace-nowrap"
            >
              <Icon icon="ic:outline-flash-on" className="w-4 h-4" />
              Focus Mode
            </motion.button>
          </div>
        </header>

        {/* Task List Container */}
        <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-20 md:pb-8 scroll-smooth">
          {showForm ? (
            <TaskForm
              task={editingTask}
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              onCancel={handleFormCancel}
              isLoading={isLoading}
            />
          ) : (
            <TaskList
              tasks={tasks}
              onUpdate={handleTaskUpdate}
              onDelete={handleTaskDelete}
              onEdit={handleEdit}
              isLoading={isLoading}
              emptyMessage={
                filters.search || filters.priority !== undefined
                  ? 'No tasks match your filters'
                  : 'No tasks yet. Create one to get started!'
              }
            />
          )}
        </div>

        {/* Desktop Add Task Button */}
        <div className="hidden md:block absolute bottom-8 right-8 z-30">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingTask(undefined);
              setShowForm(true);
            }}
            className="px-6 py-3 text-sm font-medium rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 text-white hover:shadow-lg hover:shadow-amber-500/40 transition-all flex items-center gap-2"
          >
            <Icon icon="ic:outline-add" className="w-4 h-4" />
            New Task
          </motion.button>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </main>

      {/* Focus Mode Overlay */}
      <FocusMode
        task={focusTask}
        isActive={isFocusModeActive}
        onExit={() => setIsFocusModeActive(false)}
      />

      {/* Floating Add Task Button for Mobile/Tablet */}
      <div className="fixed bottom-24 right-6 z-40 xl:hidden flex flex-col gap-4 items-end">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditingTask(undefined);
            setShowForm(true);
          }}
          className="md:hidden w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg shadow-amber-500/40 flex items-center justify-center transition-transform group"
          title="Add new task"
        >
          <Icon icon="ic:outline-add" className="w-6 h-6" />
        </motion.button>
      </div>
      </div>
    </ErrorBoundary>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}
