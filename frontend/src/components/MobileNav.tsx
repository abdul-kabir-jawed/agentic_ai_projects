'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useFocusMode } from '@/contexts/FocusModeContext';

const navItems = [
  { href: '/landing', label: 'Home', icon: 'lucide:home' },
  { href: '/', label: 'Tasks', icon: 'lucide:check-square' },
  { href: '/projects', label: 'Projects', icon: 'lucide:folder' },
  { href: '/daily', label: 'Daily', icon: 'lucide:sun' },
  { href: '/upcoming', label: 'Upcoming', icon: 'lucide:calendar' },
  { href: '/chat', label: 'Chat', icon: 'lucide:message-circle' },
  { href: '/profile', label: 'Profile', icon: 'lucide:user' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { isFocusModeActive } = useFocusMode();
  const [isVisible, setIsVisible] = useState(!isFocusModeActive);

  // Re-check visibility when pathname or focus mode changes
  useEffect(() => {
    // Small delay to ensure state has propagated after navigation
    const timer = setTimeout(() => {
      setIsVisible(!isFocusModeActive);
    }, 50);
    return () => clearTimeout(timer);
  }, [pathname, isFocusModeActive]);

  // Hide when in focus mode for distraction-free experience
  if (isFocusModeActive || !isVisible) {
    return null;
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Background with blur and gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-void via-deep/95 to-deep/80 backdrop-blur-xl border-t border-white/10" />

      {/* Nav container */}
      <div className="relative flex items-center justify-around py-2 px-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center py-2 px-2 min-w-0 flex-1 touch-manipulation"
            >
              {isActive && (
                <motion.div
                  layoutId="mobileNavActive"
                  className="absolute inset-1 bg-gold/15 rounded-xl"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                icon={item.icon}
                className={`w-5 h-5 relative z-10 transition-colors duration-200 ${
                  isActive ? 'text-gold' : 'text-text-tertiary hover:text-text-secondary'
                }`}
              />
              <span
                className={`text-[10px] font-medium relative z-10 transition-colors duration-200 mt-1 truncate max-w-full ${
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
