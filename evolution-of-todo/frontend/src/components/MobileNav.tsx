'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: '/', label: 'Tasks', icon: 'ic:outline-note-alt' },
    { href: '/upcoming', label: 'Upcoming', icon: 'ic:outline-calendar-today' },
    { href: '/daily', label: 'Daily', icon: 'ic:outline-event-repeat' },
    { href: '/projects', label: 'Projects', icon: 'ic:outline-folder' },
    { href: '/profile', label: 'Profile', icon: 'ic:outline-person' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-white/5 flex justify-around py-3 px-4 z-20 overflow-x-auto" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex flex-col items-center gap-1 transition-colors whitespace-nowrap ${isActive(item.href) ? 'text-yellow-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Icon icon={item.icon} className="w-5 h-5 flex-shrink-0" />
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
    </div>
  );
}
