'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ProtectedAppLayout from '@/components/ProtectedAppLayout';
import TaskList from '@/components/TaskList';
import { Task } from '@/types/task';
import { taskAPI } from '@/services/api';

interface ProjectGroup {
  tag: string;
  tasks: Task[];
  completedCount: number;
  totalCount: number;
  progressPercent: number;
}

function ProjectsContent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<ProjectGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    groupTasksByTags();
  }, [tasks]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await taskAPI.getTasks(0, 1000);
      setTasks(response.items);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const groupTasksByTags = () => {
    const tagMap: { [key: string]: Task[] } = {};
    const noTagsTasks: Task[] = [];

    tasks.forEach((task) => {
      if (task.tags) {
        try {
          // Parse tags if it's a JSON string
          const tagsArray = typeof task.tags === 'string' ? task.tags.split(',').map((t) => t.trim()) : Array.isArray(task.tags) ? task.tags : [task.tags];

          tagsArray.forEach((tag) => {
            if (tag) {
              if (!tagMap[tag]) {
                tagMap[tag] = [];
              }
              tagMap[tag].push(task);
            }
          });
        } catch (e) {
          noTagsTasks.push(task);
        }
      } else {
        noTagsTasks.push(task);
      }
    });

    // Convert to ProjectGroup array
    const projectList: ProjectGroup[] = Object.entries(tagMap).map(([tag, tagTasks]) => {
      const completedCount = tagTasks.filter((t) => t.is_completed).length;
      return {
        tag,
        tasks: tagTasks,
        completedCount,
        totalCount: tagTasks.length,
        progressPercent: Math.round((completedCount / tagTasks.length) * 100),
      };
    });

    // Add untagged project if there are tasks without tags
    if (noTagsTasks.length > 0) {
      const completedCount = noTagsTasks.filter((t) => t.is_completed).length;
      projectList.unshift({
        tag: 'Untagged',
        tasks: noTagsTasks,
        completedCount,
        totalCount: noTagsTasks.length,
        progressPercent: Math.round((completedCount / noTagsTasks.length) * 100),
      });
    }

    // Sort by progress (incomplete first)
    projectList.sort((a, b) => a.progressPercent - b.progressPercent);
    setProjects(projectList);
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

  const getTagColor = (index: number) => {
    const colors = [
      'from-cyan-500 to-cyan-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-orange-500 to-orange-600',
      'from-green-500 to-green-600',
      'from-blue-500 to-blue-600',
      'from-indigo-500 to-indigo-600',
      'from-rose-500 to-rose-600',
    ];
    return colors[index % colors.length];
  };

  return (
    <ProtectedAppLayout>
      <Toaster position="bottom-right" />

      {/* Header */}
      <header className="px-6 py-6 md:px-10 md:py-8 flex-shrink-0">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium tracking-tight text-white mb-2">
            Projects
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Organize and track progress on your tagged projects
          </p>
        </div>
        <div className="text-xs sm:text-sm text-amber-400">
          {projects.length} project{projects.length !== 1 ? 's' : ''} • {tasks.length} total task{tasks.length !== 1 ? 's' : ''}
        </div>
      </header>

      {/* Projects Grid */}
      <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-20 md:pb-8 scroll-smooth">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-64 text-center"
          >
            <div className="text-5xl mb-4">📁</div>
            <h3 className="text-lg font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-slate-400 text-sm">Add tags to your tasks to organize them into projects</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.tag}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-5 sm:p-6 rounded-2xl cursor-pointer hover:scale-105 transition-transform"
                onClick={() =>
                  setExpandedProject(
                    expandedProject === project.tag ? null : project.tag
                  )
                }
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getTagColor(index)} flex-shrink-0 flex items-center justify-center`}
                    >
                      <span className="text-lg">📊</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                        {project.tag}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {project.completedCount}/{project.totalCount} completed
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xl sm:text-2xl font-bold text-amber-400">
                      {project.progressPercent}%
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progressPercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-600"
                  />
                </div>

                {/* Stats */}
                <div className="flex gap-2 text-xs sm:text-sm">
                  <span className="text-slate-400">
                    📌 {project.totalCount} task{project.totalCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Expanded Project Tasks */}
        {expandedProject && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 glass-panel p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                {expandedProject} - Tasks
              </h3>
              <button
                onClick={() => setExpandedProject(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <TaskList
                tasks={
                  projects.find((p) => p.tag === expandedProject)?.tasks || []
                }
                onUpdate={handleTaskUpdate}
                onDelete={handleTaskDelete}
                onEdit={() => {}}
                isLoading={false}
              />
            </div>
          </motion.div>
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
