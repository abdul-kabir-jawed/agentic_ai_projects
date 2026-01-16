'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  const initial = user.username ? user.username[0].toUpperCase() : 'U';

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-sm font-semibold text-white">
          {initial}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-white">{user.username}</p>
          <p className="text-xs text-slate-400">{user.email}</p>
        </div>
        <Icon icon="ic:outline-chevron-down" className="w-4 h-4 text-slate-400 ml-auto" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 rounded-lg bg-slate-900/95 border border-white/10 backdrop-blur-xl shadow-lg z-50"
          >
            <div className="p-4 border-b border-white/5">
              <p className="text-sm font-medium text-white">{user.full_name || user.username}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>

            <div className="space-y-1 p-2">
              <button className="w-full text-left px-3 py-2 rounded text-sm text-slate-300 hover:bg-white/10 transition-colors flex items-center gap-2">
                <Icon icon="ic:outline-settings" className="w-4 h-4" />
                Settings
              </button>

              <div className="border-t border-white/5 my-2"></div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
              >
                <Icon icon="ic:outline-logout" className="w-4 h-4" />
                Logout
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
