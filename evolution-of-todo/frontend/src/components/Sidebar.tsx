'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import NivioLogo from './NivioLogo';

interface SidebarProps {
  completedCount: number;
  totalCount: number;
}

export default function Sidebar({ completedCount, totalCount }: SidebarProps) {
  const pathname = usePathname();
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="hidden md:flex w-64 flex-col glass-panel z-10 border-r border-white/5 relative">
      <div className="p-8 pb-4">
        {/* Logo */}
        <div className="mb-8">
          <NivioLogo size="sm" href="/" />
        </div>

        {/* Navigation */}
        <div className="space-y-1">
          <Link href="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive('/') ? 'bg-white/10 text-yellow-300 border border-white/5 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Icon icon="ic:outline-dashboard" className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>

          <Link href="/upcoming" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive('/upcoming') ? 'bg-white/10 text-yellow-300 border border-white/5 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Icon icon="ic:outline-calendar-today" className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Upcoming</span>
          </Link>

          <Link href="/projects" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive('/projects') ? 'bg-white/10 text-yellow-300 border border-white/5 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Icon icon="ic:outline-folder" className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Projects</span>
          </Link>

          <Link href="/daily" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive('/daily') ? 'bg-white/10 text-yellow-300 border border-white/5 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Icon icon="ic:outline-event-repeat" className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Daily</span>
          </Link>

          <Link href="/profile" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive('/profile') ? 'bg-white/10 text-yellow-300 border border-white/5 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Icon icon="ic:outline-person" className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Profile</span>
          </Link>
        </div>
      </div>

      {/* Daily Goal Card */}
      <motion.div className="mt-auto p-8 pt-0" whileHover={{ y: -2 }}>
        <div className="glass-card p-4 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/20 blur-xl group-hover:bg-yellow-500/30 transition-colors"></div>
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-3">Daily Goal</h3>
          <div className="flex items-end justify-between mb-2">
            <span className="text-2xl font-semibold text-white">{completedCount}/{totalCount}</span>
            <span className="text-xs text-emerald-400">{completionPercentage}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full relative overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.6 }}
            >
              <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </nav>
  );
}
