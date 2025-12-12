'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ProtectedAppLayout from '@/components/ProtectedAppLayout';
import { taskAPI } from '@/services/api';

interface UserProfile {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  profile_picture_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  high_priority_pending: number;
  overdue_tasks: number;
  tasks_due_this_week: number;
  most_productive_day: string;
  weekly_completion_rate: number;
}

function ProfileContent() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const userRes = await taskAPI.getCurrentUser();
      setUser(userRes);
      if (userRes.profile_picture_url) {
        setPreviewUrl(userRes.profile_picture_url);
      }

      // Try to load stats, but don't block if it fails
      try {
        const statsRes = await taskAPI.getUserStats();
        setStats(statsRes);
      } catch (statsError) {
        // Don't show error toast, just continue without stats
      }
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    try {
      const updated = await taskAPI.uploadAvatar(file);
      setUser(updated);
      toast.success('Profile picture updated!');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to upload image';
      toast.error(errorMsg);
      setPreviewUrl(user?.profile_picture_url || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarDelete = async () => {
    setIsUploading(true);
    try {
      const updated = await taskAPI.deleteAvatar();
      setUser(updated);
      setPreviewUrl(null);
      toast.success('Profile picture removed!');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete image';
      toast.error(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('app-preferences');
    window.location.href = '/login';
  };

  const getInitials = (username?: string) => {
    return username ? username.substring(0, 2).toUpperCase() : 'U';
  };

  if (isLoading) {
    return (
      <ProtectedAppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-12 h-12 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
        </div>
      </ProtectedAppLayout>
    );
  }

  if (!user) {
    return (
      <ProtectedAppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-white text-lg mb-4">Failed to load profile data</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
            >
              Retry
            </button>
          </div>
        </div>
      </ProtectedAppLayout>
    );
  }

  return (
    <ProtectedAppLayout>
      <Toaster position="bottom-right" />

      {/* Header */}
      <header className="px-6 py-6 md:px-10 md:py-8 flex-shrink-0">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium tracking-tight text-white mb-2">
          My Profile
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          View your profile and task statistics
        </p>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-20 md:pb-8 scroll-smooth">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <div className="glass-panel p-8 rounded-2xl text-center sticky top-6">
              {/* Avatar Section */}
              <div className="mb-12 relative inline-block mx-auto">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-5xl font-bold text-white border-4 border-amber-400/20 overflow-hidden">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user.username)
                  )}
                </div>

                {/* Upload Button */}
                <label className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-600 flex items-center justify-center cursor-pointer text-white transition-colors disabled:opacity-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <span className="text-lg">📷</span>
                </label>

                {/* Delete Button */}
                {previewUrl && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAvatarDelete}
                    disabled={isUploading}
                    className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50"
                  >
                    Remove
                  </motion.button>
                )}
              </div>

              {/* User Info */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-1">
                  {user.full_name || user.username}
                </h3>
                <p className="text-sm text-cyan-400 font-medium mb-1">
                  @{user.username}
                </p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:shadow-lg hover:shadow-red-500/50 transition-all text-sm font-medium"
                >
                  Logout
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Statistics Grid */}
          <div className="lg:col-span-2 space-y-6">
            {stats ? (
            <>
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4"
            >
              {[
                {
                  label: 'Total Tasks',
                  value: stats.total_tasks,
                  icon: '📝',
                  color: 'from-cyan-500 to-blue-600',
                },
                {
                  label: 'Completed',
                  value: stats.completed_tasks,
                  icon: '✅',
                  color: 'from-green-500 to-emerald-600',
                },
                {
                  label: 'Completion Rate',
                  value: `${stats.completion_rate}%`,
                  icon: '📊',
                  color: 'from-purple-500 to-pink-600',
                },
                {
                  label: 'High Priority',
                  value: stats.high_priority_pending,
                  icon: '🔥',
                  color: 'from-orange-500 to-red-600',
                },
                {
                  label: 'Overdue',
                  value: stats.overdue_tasks,
                  icon: '⚠️',
                  color: 'from-pink-500 to-rose-600',
                },
                {
                  label: 'This Week',
                  value: stats.tasks_due_this_week,
                  icon: '📅',
                  color: 'from-indigo-500 to-purple-600',
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className={`glass-card p-4 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10 border border-white/10`}
                >
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Weekly Completion */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-panel p-6 rounded-2xl border border-white/10"
            >
              <h4 className="text-lg font-semibold text-white mb-4">
                This Week's Performance
              </h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Completion Rate</p>
                  <p className="text-3xl font-bold text-green-400">
                    {stats.weekly_completion_rate}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400 mb-1">Due This Week</p>
                  <p className="text-3xl font-bold text-amber-400">
                    {stats.tasks_due_this_week}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.weekly_completion_rate}%` }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                />
              </div>
            </motion.div>
            </>
            ) : (
              <div className="glass-panel p-6 rounded-2xl border border-white/10 text-center">
                <p className="text-slate-400">Statistics failed to load</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedAppLayout>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
