'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ProtectedAppLayout from '@/components/ProtectedAppLayout';
import { Task } from '@/types/task';
import { taskAPI } from '@/services/api';

interface ProjectGroup {
  tag: string;
  tasks: Task[];
  completedCount: number;
  totalCount: number;
  progressPercent: number;
  icon: string;
  color: string;
}

const projectColors = [
  { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', gradient: 'from-purple-500 to-purple-600' },
  { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', gradient: 'from-cyan-500 to-cyan-600' },
  { bg: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-400', gradient: 'from-pink-500 to-pink-600' },
  { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', gradient: 'from-green-500 to-green-600' },
  { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-400', gradient: 'from-orange-500 to-orange-600' },
  { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', gradient: 'from-blue-500 to-blue-600' },
  { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', gradient: 'from-rose-500 to-rose-600' },
  { bg: 'bg-gold/10', border: 'border-gold/20', text: 'text-gold', gradient: 'from-gold to-gold-bright' },
];

const projectIcons = ['lucide:briefcase', 'lucide:code', 'lucide:home', 'lucide:heart', 'lucide:star', 'lucide:zap', 'lucide:rocket', 'lucide:book'];

function ProjectsContent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<ProjectGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const taskRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    groupTasksByTags();
  }, [tasks]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await taskAPI.getTasks(0, 100);
      if (Array.isArray(response?.items)) {
        setTasks(response.items);
      } else {
        setTasks([]);
      }
    } catch (error) {
      toast.error('Failed to load projects');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const groupTasksByTags = () => {
    if (!Array.isArray(tasks)) {
      setProjects([]);
      return;
    }

    const tagMap: { [key: string]: Task[] } = {};
    const noTagsTasks: Task[] = [];

    tasks.forEach((task) => {
      if (task.tags) {
        const tagsArray = typeof task.tags === 'string'
          ? task.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : Array.isArray(task.tags) ? task.tags : [task.tags];

        tagsArray.forEach((tag) => {
          if (tag) {
            if (!tagMap[tag]) {
              tagMap[tag] = [];
            }
            tagMap[tag].push(task);
          }
        });
      } else {
        noTagsTasks.push(task);
      }
    });

    const projectList: ProjectGroup[] = Object.entries(tagMap).map(([tag, tagTasks], index) => {
      const completedCount = tagTasks.filter((t) => t.is_completed).length;
      const colorIndex = index % projectColors.length;
      return {
        tag,
        tasks: tagTasks,
        completedCount,
        totalCount: tagTasks.length,
        progressPercent: Math.round((completedCount / tagTasks.length) * 100),
        icon: projectIcons[index % projectIcons.length],
        color: projectColors[colorIndex].gradient,
      };
    });

    if (noTagsTasks.length > 0) {
      const completedCount = noTagsTasks.filter((t) => t.is_completed).length;
      projectList.unshift({
        tag: 'Untagged',
        tasks: noTagsTasks,
        completedCount,
        totalCount: noTagsTasks.length,
        progressPercent: Math.round((completedCount / noTagsTasks.length) * 100),
        icon: 'lucide:inbox',
        color: 'from-white/20 to-white/10',
      });
    }

    projectList.sort((a, b) => a.progressPercent - b.progressPercent);
    setProjects(projectList);
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

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.is_completed).length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getColorForIndex = (index: number) => projectColors[index % projectColors.length];

  return (
    <ProtectedAppLayout completedCount={completedTasks} totalCount={totalTasks}>
      {/* Header */}
      <header className="px-6 py-6 md:px-10 md:py-8 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-serif font-medium text-text-primary mb-2"
            >
              Projects
            </motion.h1>
            <p className="text-text-secondary text-sm">
              Organize and track progress on your tagged projects
            </p>
          </div>

          {/* Stats Summary */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-4"
          >
            <div className="glass-card-static px-4 py-3 rounded-xl text-center">
              <p className="text-2xl font-serif font-bold text-gold">{projects.length}</p>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Projects</p>
            </div>
            <div className="glass-card-static px-4 py-3 rounded-xl text-center">
              <p className="text-2xl font-serif font-bold text-text-primary">{totalTasks}</p>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Tasks</p>
            </div>
            <div className="glass-card-static px-4 py-3 rounded-xl text-center">
              <p className="text-2xl font-serif font-bold text-green-400">{overallProgress}%</p>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Complete</p>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-24 md:pb-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-text-tertiary text-sm">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mb-6">
              <Icon icon="lucide:folder" className="w-10 h-10 text-gold" />
            </div>
            <h3 className="text-xl font-serif font-medium text-text-primary mb-2">
              No projects yet
            </h3>
            <p className="text-text-tertiary text-sm mb-6 max-w-sm">
              Add tags to your tasks to organize them into projects.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project, index) => {
                const colorScheme = getColorForIndex(index);
                const isExpanded = expandedProject === project.tag;

                return (
                  <motion.div
                    key={project.tag}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setExpandedProject(isExpanded ? null : project.tag)}
                    className={`glass-card-static p-5 rounded-xl cursor-pointer transition-all duration-300 group ${
                      isExpanded ? 'ring-2 ring-gold/50' : 'hover:border-gold/20'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${project.color} flex items-center justify-center`}>
                          <Icon icon={project.icon} className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-text-primary group-hover:text-gold transition-colors">
                            {project.tag}
                          </h3>
                          <p className="text-xs text-text-tertiary">
                            {project.completedCount}/{project.totalCount} completed
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-2xl font-serif font-bold ${
                          project.progressPercent === 100 ? 'text-green-400' : 'text-gold'
                        }`}>
                          {project.progressPercent}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progressPercent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.05 }}
                        className={`h-full rounded-full relative overflow-hidden ${
                          project.progressPercent === 100
                            ? 'bg-gradient-to-r from-green-500 to-green-400'
                            : 'bg-gradient-to-r from-gold to-gold-bright'
                        }`}
                      >
                        <div className="absolute inset-0 bg-white/30 animate-shimmer" />
                      </motion.div>
                    </div>

                    {/* Tags Preview */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:list-todo" className="w-4 h-4 text-text-tertiary" />
                        <span className="text-xs text-text-tertiary">
                          {project.totalCount - project.completedCount} remaining
                        </span>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon icon="lucide:chevron-down" className="w-4 h-4 text-text-tertiary" />
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Expanded Project Tasks */}
            <AnimatePresence>
              {expandedProject && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="glass-card-static p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Icon icon="lucide:folder-open" className="w-5 h-5 text-gold" />
                        <h2 className="text-lg font-serif font-medium text-text-primary">
                          {expandedProject}
                        </h2>
                        <span className="text-xs text-gold bg-gold/10 px-2 py-0.5 rounded-full">
                          {projects.find(p => p.tag === expandedProject)?.totalCount || 0} tasks
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedProject(null);
                        }}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <Icon icon="lucide:x" className="w-5 h-5 text-text-tertiary" />
                      </button>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {projects
                        .find((p) => p.tag === expandedProject)
                        ?.tasks.map((task, idx) => (
                          <motion.div
                            key={task.id}
                            ref={(el) => {
                              if (el) taskRefs.current.set(task.id, el);
                            }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className={`group glass-card-static p-4 rounded-xl flex items-center gap-4 transition-all duration-300 ${
                              task.is_completed ? 'opacity-60' : 'hover:border-gold/20'
                            }`}
                          >
                            {/* Checkbox */}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTaskToggle(task);
                              }}
                              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                task.is_completed
                                  ? 'bg-gold border-gold'
                                  : 'border-white/20 hover:border-gold/50'
                              }`}
                            >
                              {task.is_completed && (
                                <Icon icon="lucide:check" className="w-4 h-4 text-void" />
                              )}
                            </motion.button>

                            {/* Task Content */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium transition-all duration-300 ${
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
                                {task.due_date && (
                                  <span className="text-[10px] text-text-tertiary">
                                    <Icon icon="lucide:calendar" className="w-3 h-3 inline mr-1" />
                                    {new Date(task.due_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Delete Button */}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTaskDelete(task.id);
                              }}
                              className="p-2 hover:bg-rose/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Icon icon="lucide:trash-2" className="w-4 h-4 text-text-tertiary hover:text-rose" />
                            </motion.button>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </ProtectedAppLayout>
  );
}

export default function ProjectsPage() {
  return (
    <ProtectedRoute>
      <ProjectsContent />
    </ProtectedRoute>
  );
}
