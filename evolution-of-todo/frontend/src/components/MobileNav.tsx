'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

const navItems = [
  { href: '/landing', label: 'Home', icon: 'lucide:home' },
  { href: '/', label: 'Tasks', icon: 'lucide:layout-dashboard' },
  { href: '/upcoming', label: 'Upcoming', icon: 'lucide:calendar' },
  { href: '/daily', label: 'Daily', icon: 'lucide:flame' },
  { href: '/profile', label: 'Profile', icon: 'lucide:user' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 glass-nav border-t border-white/5 z-50"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex justify-around items-center py-2 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-1 px-3 py-2"
            >
              {isActive && (
                <motion.div
                  layoutId="mobileNavActive"
                  className="absolute inset-0 bg-gold/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                icon={item.icon}
                className={`w-5 h-5 relative z-10 transition-colors ${
                  isActive ? 'text-gold' : 'text-text-tertiary'
                }`}
              />
              <span
                className={`text-[10px] font-medium relative z-10 transition-colors ${
                  isActive ? 'text-gold' : 'text-text-tertiary'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
