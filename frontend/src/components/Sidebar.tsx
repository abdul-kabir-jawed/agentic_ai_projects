'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

interface SidebarProps {
  completedCount: number;
  totalCount: number;
}

const navItems = [
  { href: '/', icon: 'lucide:layout-dashboard', label: 'Dashboard' },
  { href: '/upcoming', icon: 'lucide:calendar', label: 'Upcoming' },
  { href: '/projects', icon: 'lucide:folder', label: 'Projects' },
  { href: '/daily', icon: 'lucide:flame', label: 'Daily' },
];

export default function Sidebar({ completedCount, totalCount }: SidebarProps) {
  const pathname = usePathname();
  const completionPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <nav className="hidden md:flex w-72 flex-col glass-panel border-r border-white/5 relative">
      {/* Background Glow */}
      <div className="absolute top-20 left-1/2 w-32 h-32 bg-gold/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="p-8 pb-4">
        {/* Logo */}
        <Link href="/landing" className="flex items-center gap-3 mb-6 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-bright flex items-center justify-center shadow-gold">
            <span className="font-serif font-bold text-lg text-void">ET</span>
          </div>
          <div>
            <span className="font-serif font-bold text-lg tracking-tight text-text-primary block">
              Evolution
            </span>
            <span className="text-[10px] tracking-widest uppercase text-text-tertiary">
              of Todo
            </span>
          </div>
        </Link>

        {/* Home Button */}
        <Link
          href="/landing"
          className="flex items-center gap-3 px-4 py-3 mb-4 rounded-lg text-text-secondary hover:text-gold hover:bg-gold/5 transition-all duration-300 border border-white/5 hover:border-gold/20"
        >
          <Icon icon="lucide:home" className="w-5 h-5" />
          <span className="text-sm font-medium">Home</span>
          <Icon icon="lucide:external-link" className="w-3 h-3 ml-auto opacity-50" />
        </Link>

        {/* Navigation */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group relative ${
                  isActive
                    ? 'bg-gold/10 text-gold border-l-2 border-gold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gold/10 rounded-lg border-l-2 border-gold"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <Icon
                  icon={item.icon}
                  className={`w-5 h-5 relative z-10 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-gold' : ''
                  }`}
                />
                <span className="text-sm font-medium relative z-10">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Chat Button */}
          <Link
            href="/chat"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group relative ${
              pathname === '/chat'
                ? 'bg-gold/10 text-gold border-l-2 border-gold'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
          >
            {pathname === '/chat' && (
              <motion.div
                layoutId="activeNav"
                className="absolute inset-0 bg-gold/10 rounded-lg border-l-2 border-gold"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <Icon
              icon="lucide:message-circle"
              className={`w-5 h-5 relative z-10 transition-transform group-hover:scale-110 ${
                pathname === '/chat' ? 'text-gold' : ''
              }`}
            />
            <span className="text-sm font-medium relative z-10">Chat</span>
          </Link>

          {/* Profile Button */}
          <Link
            href="/profile"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group relative ${
              pathname === '/profile'
                ? 'bg-gold/10 text-gold border-l-2 border-gold'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`}
          >
            {pathname === '/profile' && (
              <motion.div
                layoutId="activeNav"
                className="absolute inset-0 bg-gold/10 rounded-lg border-l-2 border-gold"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <Icon
              icon="lucide:user"
              className={`w-5 h-5 relative z-10 transition-transform group-hover:scale-110 ${
                pathname === '/profile' ? 'text-gold' : ''
              }`}
            />
            <span className="text-sm font-medium relative z-10">Profile</span>
          </Link>
        </div>
      </div>

      {/* Daily Goal Card */}
      <div className="mt-auto p-8 pt-0">
        <motion.div
          whileHover={{ y: -2 }}
          className="glass-card-static p-5 rounded-xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gold/10 blur-2xl group-hover:bg-gold/20 transition-colors pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-medium text-text-tertiary uppercase tracking-widest">
                Daily Progress
              </h3>
              <Icon
                icon="lucide:flame"
                className="w-4 h-4 text-gold fire-animated"
              />
            </div>

            {/* Progress Ring */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <svg className="w-full h-full progress-ring" viewBox="0 0 36 36">
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
                    stroke="url(#goldGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${completionPercentage} 100`}
                    initial={{ strokeDasharray: '0 100' }}
                    animate={{
                      strokeDasharray: `${completionPercentage} 100`,
                    }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                  <defs>
                    <linearGradient
                      id="goldGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#c9a962" />
                      <stop offset="100%" stopColor="#e4c77b" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-text-primary">
                    {completionPercentage}%
                  </span>
                </div>
              </div>

              <div>
                <p className="text-2xl font-serif font-medium text-text-primary">
                  {completedCount}
                  <span className="text-text-tertiary">/{totalCount}</span>
                </p>
                <p className="text-xs text-text-tertiary">tasks completed</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-gold to-gold-bright rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="glass-card-static p-3 rounded-lg text-center">
            <p className="text-lg font-serif font-medium text-text-primary">
              {totalCount - completedCount}
            </p>
            <p className="text-[10px] text-text-tertiary uppercase tracking-wider">
              Remaining
            </p>
          </div>
          <div className="glass-card-static p-3 rounded-lg text-center">
            <p className="text-lg font-serif font-medium text-gold">
              {completedCount}
            </p>
            <p className="text-[10px] text-text-tertiary uppercase tracking-wider">
              Done
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}
