'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import { useFocusMode } from '@/contexts/FocusModeContext';

export function FocusTaskCard() {
  const router = useRouter();
  const { focusedTask, completeTask, totalSessionPomodoros, endFocusMode, isFocusModeActive } = useFocusMode();
  const exitRequestedRef = useRef(false);

  // Watch for focus mode to become inactive after exit requested
  useEffect(() => {
    if (exitRequestedRef.current && !isFocusModeActive) {
      exitRequestedRef.current = false;
      router.push('/');
    }
  }, [isFocusModeActive, router]);

  const handleExitFocusMode = () => {
    exitRequestedRef.current = true;
    endFocusMode();
    // Use replace instead of push and add longer delay to ensure state propagates
    setTimeout(() => {
      if (exitRequestedRef.current) {
        exitRequestedRef.current = false;
        router.replace('/');
      }
    }, 250);
  };

  if (!focusedTask) {
    return (
      <div className="glass-card-static rounded-2xl p-8 text-center max-w-xl mx-auto">
        <Icon icon="lucide:target" className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
        <p className="text-text-secondary">No task selected</p>
      </div>
    );
  }

  const priorityConfig = {
    high: { color: 'text-rose', bg: 'bg-rose/10', border: 'border-rose/30', icon: 'lucide:flame', label: 'High Priority' },
    medium: { color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/30', icon: 'lucide:zap', label: 'Medium Priority' },
    low: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', icon: 'lucide:leaf', label: 'Low Priority' },
  };

  const priority = priorityConfig[focusedTask.priority];
  const tags = focusedTask.tags?.split(',').map((t) => t.trim()).filter(Boolean) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card-static rounded-2xl p-6 sm:p-8 max-w-xl mx-auto border transition-all duration-300 ${
        focusedTask.is_completed
          ? 'border-green-500/30 bg-green-500/5'
          : 'border-white/10'
      }`}
    >
      {/* Header with priority and due date */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${priority.bg} ${priority.border} border`}>
          <Icon icon={priority.icon} className={`w-4 h-4 ${priority.color}`} />
          <span className={`text-xs font-semibold uppercase tracking-wide ${priority.color}`}>
            {focusedTask.priority}
          </span>
        </div>

        {focusedTask.due_date && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-text-secondary text-sm">
            <Icon icon="lucide:calendar" className="w-4 h-4" />
            <span className="font-medium">
              {new Date(focusedTask.due_date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        )}
      </div>

      {/* Task description */}
      <h2 className={`text-xl sm:text-2xl md:text-3xl font-serif font-medium leading-relaxed mb-5 ${
        focusedTask.is_completed ? 'text-text-secondary line-through decoration-green-500/50' : 'text-text-primary'
      }`}>
        {focusedTask.description}
      </h2>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-text-tertiary hover:bg-white/10 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Session stats and actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-5 border-t border-white/10">
        <div className="flex items-center gap-3 text-text-secondary">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gold/10">
            <Icon icon="lucide:timer" className="w-5 h-5 text-gold" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">
              {totalSessionPomodoros} pomodoro{totalSessionPomodoros !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-text-tertiary">this session</p>
          </div>
        </div>

        {/* Complete button */}
        {!focusedTask.is_completed && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={completeTask}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl btn-gold text-void font-semibold shadow-lg shadow-gold/20 touch-manipulation"
          >
            <Icon icon="lucide:check-circle" className="w-5 h-5" />
            <span>Mark Complete</span>
          </motion.button>
        )}

        {focusedTask.is_completed && (
          <div className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400">
            <Icon icon="lucide:check-circle-2" className="w-5 h-5" />
            <span className="font-semibold">Completed!</span>
          </div>
        )}
      </div>

      {/* Full-screen Task Completed Modal */}
      <AnimatePresence>
        {focusedTask.is_completed && (
          <>
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-void/80 backdrop-blur-md z-50"
            />

            {/* Celebration Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="relative max-w-md w-full">
                {/* Glow effects */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-green-500/20 rounded-full blur-[100px]" />
                <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-gold/20 rounded-full blur-[80px]" />

                {/* Modal content */}
                <div className="relative glass-card-static rounded-3xl p-8 md:p-10 text-center border border-green-500/30 bg-gradient-to-b from-surface/90 to-deep/90">
                  {/* Confetti-like decorations */}
                  <div className="absolute -top-4 left-1/4 w-3 h-3 rounded-full bg-gold animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="absolute -top-6 right-1/3 w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="absolute -top-3 right-1/4 w-4 h-4 rounded-full bg-rose animate-bounce" style={{ animationDelay: '0.4s' }} />

                  {/* Trophy icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold/30 to-green-500/20 border-2 border-gold/50 flex items-center justify-center shadow-2xl shadow-gold/30"
                  >
                    <Icon icon="lucide:trophy" className="w-12 h-12 text-gold" />
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl md:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 mb-3"
                  >
                    Task Completed!
                  </motion.h2>

                  {/* Subtitle with party poppers */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-center gap-2 mb-6"
                  >
                    <Icon icon="lucide:party-popper" className="w-5 h-5 text-gold" />
                    <p className="text-text-secondary text-lg">
                      {totalSessionPomodoros > 0
                        ? `Finished in ${totalSessionPomodoros} pomodoro${totalSessionPomodoros !== 1 ? 's' : ''}`
                        : 'Great job!'}
                    </p>
                    <Icon icon="lucide:sparkles" className="w-5 h-5 text-gold" />
                  </motion.div>

                  {/* Task name */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm text-text-tertiary mb-8 line-clamp-2"
                  >
                    &ldquo;{focusedTask.description}&rdquo;
                  </motion.p>

                  {/* Exit button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleExitFocusMode}
                    className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-gold to-gold-bright text-void font-bold text-lg shadow-lg shadow-gold/40 flex items-center justify-center gap-3"
                  >
                    <Icon icon="lucide:home" className="w-6 h-6" />
                    Return to Dashboard
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
