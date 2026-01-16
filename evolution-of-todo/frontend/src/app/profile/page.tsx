'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
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

      try {
        const statsRes = await taskAPI.getUserStats();
        setStats(statsRes);
      } catch {
        // Stats failed to load, continue without them
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

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const updated = await taskAPI.uploadAvatar(file);
      setUser(updated);
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error('Failed to upload image');
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
      toast.error('Failed to delete image');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <ProtectedAppLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-text-tertiary text-sm">Loading profile...</p>
        </div>
      </ProtectedAppLayout>
    );
  }

  if (!user) {
    return (
      <ProtectedAppLayout>
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-20 h-20 rounded-full bg-rose/10 flex items-center justify-center mb-6">
            <Icon icon="lucide:alert-circle" className="w-10 h-10 text-rose" />
          </div>
          <h3 className="text-xl font-serif font-medium text-text-primary mb-2">
            Failed to load profile
          </h3>
          <p className="text-text-tertiary text-sm mb-6">
            Something went wrong while loading your profile data.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-gold px-6 py-3 rounded-lg font-semibold text-deep"
          >
            Try Again
          </button>
        </div>
      </ProtectedAppLayout>
    );
  }

  const statCards = [
    {
      label: 'Total Tasks',
      value: stats?.total_tasks ?? 0,
      icon: 'lucide:list-todo',
      color: 'gold',
    },
    {
      label: 'Completed',
      value: stats?.completed_tasks ?? 0,
      icon: 'lucide:check-circle',
      color: 'green',
    },
    {
      label: 'Completion Rate',
      value: `${stats?.completion_rate ?? 0}%`,
      icon: 'lucide:trending-up',
      color: 'cyan',
    },
    {
      label: 'High Priority',
      value: stats?.high_priority_pending ?? 0,
      icon: 'lucide:flame',
      color: 'orange',
    },
    {
      label: 'Overdue',
      value: stats?.overdue_tasks ?? 0,
      icon: 'lucide:alert-triangle',
      color: 'rose',
    },
    {
      label: 'This Week',
      value: stats?.tasks_due_this_week ?? 0,
      icon: 'lucide:calendar',
      color: 'purple',
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; text: string; border: string } } = {
      gold: { bg: 'bg-gold/10', text: 'text-gold', border: 'border-gold/20' },
      green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
      cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
      orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
      rose: { bg: 'bg-rose/10', text: 'text-rose', border: 'border-rose/20' },
      purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
    };
    return colorMap[color] || colorMap.gold;
  };

  return (
    <ProtectedAppLayout completedCount={stats?.completed_tasks ?? 0} totalCount={stats?.total_tasks ?? 0}>
      {/* Header */}
      <header className="px-6 py-6 md:px-10 md:py-8 flex-shrink-0">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-serif font-medium text-text-primary mb-2"
        >
          Profile
        </motion.h1>
        <p className="text-text-secondary text-sm">
          Manage your account and view your statistics
        </p>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-24 md:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <div className="glass-card-static p-8 rounded-2xl text-center sticky top-6">
              {/* Avatar Section */}
              <div className="relative inline-block mb-6">
                {/* Avatar Ring */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-gold via-gold-bright to-gold opacity-50 blur-sm" />

                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-gold to-gold-bright flex items-center justify-center text-4xl font-serif font-bold text-void border-4 border-gold/20 overflow-hidden">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user.username)
                  )}
                </div>

                {/* Upload Button */}
                <label className={`absolute bottom-0 right-0 w-10 h-10 rounded-full bg-gold hover:bg-gold-bright flex items-center justify-center cursor-pointer transition-colors shadow-gold ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-void border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Icon icon="lucide:camera" className="w-5 h-5 text-void" />
                  )}
                </label>
              </div>

              {/* Remove Photo */}
              {previewUrl && (
                <button
                  onClick={handleAvatarDelete}
                  disabled={isUploading}
                  className="text-xs text-text-tertiary hover:text-rose transition-colors mb-6 block mx-auto"
                >
                  Remove photo
                </button>
              )}

              {/* User Info */}
              <div className="mb-6">
                <h3 className="text-2xl font-serif font-medium text-text-primary mb-1">
                  {user.full_name || user.username}
                </h3>
                <p className="text-sm text-gold font-medium mb-1">@{user.username}</p>
                <p className="text-xs text-text-tertiary">{user.email}</p>
              </div>

              {/* Member Since */}
              <div className="glass-card-static p-4 rounded-xl mb-6">
                <div className="flex items-center justify-center gap-2 text-text-tertiary text-sm">
                  <Icon icon="lucide:calendar" className="w-4 h-4" />
                  <span>Member since {formatDate(user.created_at)}</span>
                </div>
              </div>

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full py-3 px-4 rounded-xl bg-rose/10 border border-rose/20 text-rose font-medium flex items-center justify-center gap-2 hover:bg-rose/20 transition-colors"
              >
                <Icon icon="lucide:log-out" className="w-5 h-5" />
                Sign Out
              </motion.button>
            </div>
          </motion.div>

          {/* Statistics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Header */}
            <div className="flex items-center gap-2">
              <Icon icon="lucide:bar-chart-3" className="w-5 h-5 text-gold" />
              <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider">Statistics</h2>
            </div>

            {stats ? (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {statCards.map((stat, index) => {
                    const colorClasses = getColorClasses(stat.color);
                    return (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`glass-card-static p-5 rounded-xl border ${colorClasses.border}`}
                      >
                        <div className={`w-10 h-10 rounded-lg ${colorClasses.bg} flex items-center justify-center mb-3`}>
                          <Icon icon={stat.icon} className={`w-5 h-5 ${colorClasses.text}`} />
                        </div>
                        <p className="text-3xl font-serif font-bold text-text-primary mb-1">
                          {stat.value}
                        </p>
                        <p className="text-xs text-text-tertiary uppercase tracking-wider">
                          {stat.label}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Weekly Performance */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card-static p-6 rounded-xl"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Icon icon="lucide:activity" className="w-5 h-5 text-gold" />
                    <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                      Weekly Performance
                    </h3>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs text-text-tertiary mb-1">Completion Rate</p>
                      <p className="text-4xl font-serif font-bold text-green-400">
                        {stats.weekly_completion_rate ?? 0}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-text-tertiary mb-1">Due This Week</p>
                      <p className="text-4xl font-serif font-bold text-gold">
                        {stats.tasks_due_this_week ?? 0}
                      </p>
                    </div>
                    {stats.most_productive_day && (
                      <div className="text-right">
                        <p className="text-xs text-text-tertiary mb-1">Most Productive</p>
                        <p className="text-lg font-medium text-text-primary">
                          {stats.most_productive_day}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.weekly_completion_rate ?? 0}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-gold to-gold-bright rounded-full relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/30 animate-shimmer" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Productivity Insights */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass-card-static p-6 rounded-xl"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Icon icon="lucide:lightbulb" className="w-5 h-5 text-gold" />
                    <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                      Insights
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {stats.overdue_tasks > 0 && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-rose/5 border border-rose/10">
                        <Icon icon="lucide:alert-circle" className="w-5 h-5 text-rose flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-text-primary">
                            You have <span className="text-rose font-medium">{stats.overdue_tasks} overdue</span> tasks
                          </p>
                          <p className="text-xs text-text-tertiary mt-1">
                            Consider prioritizing these to stay on track
                          </p>
                        </div>
                      </div>
                    )}

                    {stats.high_priority_pending > 0 && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
                        <Icon icon="lucide:flame" className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-text-primary">
                            <span className="text-orange-400 font-medium">{stats.high_priority_pending} high priority</span> tasks need attention
                          </p>
                          <p className="text-xs text-text-tertiary mt-1">
                            Focus on these first for maximum impact
                          </p>
                        </div>
                      </div>
                    )}

                    {stats.completion_rate >= 80 && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gold/5 border border-gold/10">
                        <Icon icon="lucide:trophy" className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-text-primary">
                            Excellent work! You have a <span className="text-gold font-medium">{stats.completion_rate}%</span> completion rate
                          </p>
                          <p className="text-xs text-text-tertiary mt-1">
                            Keep up the great momentum
                          </p>
                        </div>
                      </div>
                    )}

                    {stats.completion_rate < 50 && stats.total_tasks > 0 && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
                        <Icon icon="lucide:target" className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-text-primary">
                            Room for improvement with <span className="text-cyan-400 font-medium">{stats.completion_rate}%</span> completion
                          </p>
                          <p className="text-xs text-text-tertiary mt-1">
                            Try breaking tasks into smaller steps
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card-static p-10 rounded-xl text-center"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Icon icon="lucide:bar-chart-2" className="w-8 h-8 text-text-tertiary" />
                </div>
                <p className="text-text-tertiary">Statistics are currently unavailable</p>
              </motion.div>
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
