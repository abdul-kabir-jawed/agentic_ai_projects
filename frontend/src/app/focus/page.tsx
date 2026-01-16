'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useFocusMode } from '@/contexts/FocusModeContext';
import { FocusTimer } from '@/components/focus/FocusTimer';
import { FocusTaskCard } from '@/components/focus/FocusTaskCard';
import { FocusSettings } from '@/components/focus/FocusSettings';

function FocusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    isFocusModeActive,
    focusedTask,
    timerMode,
    breakType,
    isTimerRunning,
    totalSessionPomodoros,
    completedPomodoros,
    settings,
    startFocusMode,
    endFocusMode,
  } = useFocusMode();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const exitNavigationRef = useRef(false);

  // Start focus mode if taskId is provided
  useEffect(() => {
    const taskId = searchParams.get('taskId');
    if (taskId && !isFocusModeActive) {
      startFocusMode(taskId);
    }
  }, [searchParams, isFocusModeActive, startFocusMode]);

  // Watch for focus mode to be deactivated and then navigate
  useEffect(() => {
    if (exitNavigationRef.current && !isFocusModeActive) {
      exitNavigationRef.current = false;
      setIsExiting(false);
      // Use replace to force a clean navigation with proper state
      router.replace('/');
    }
  }, [isFocusModeActive, router]);

  const handleExit = () => {
    if (isTimerRunning || totalSessionPomodoros > 0) {
      setIsExitConfirmOpen(true);
    } else {
      setIsExiting(true);
      exitNavigationRef.current = true;
      endFocusMode();
      // Fallback navigation with longer delay to ensure state propagates
      setTimeout(() => {
        if (exitNavigationRef.current) {
          exitNavigationRef.current = false;
          setIsExiting(false);
          router.replace('/');
        }
      }, 250);
    }
  };

  const confirmExit = () => {
    setIsExitConfirmOpen(false);
    setIsExiting(true);
    exitNavigationRef.current = true;
    endFocusMode();
    // Fallback navigation with longer delay to ensure state propagates
    setTimeout(() => {
      if (exitNavigationRef.current) {
        exitNavigationRef.current = false;
        setIsExiting(false);
        router.replace('/');
      }
    }, 250);
  };

  // If no task is being focused, show empty state
  if (!isFocusModeActive || !focusedTask) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void relative overflow-hidden">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[180px]" />
          <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-rose/5 rounded-full blur-[150px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center px-6 relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-28 h-28 mx-auto mb-8 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center shadow-lg shadow-gold/10"
          >
            <Icon icon="lucide:target" className="w-14 h-14 text-gold" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-serif font-medium text-text-primary mb-4">
            No Task Selected
          </h1>
          <p className="text-text-secondary mb-10 text-lg max-w-md mx-auto">
            Select a task from your dashboard and click the focus button to start a distraction-free session.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="px-8 py-4 rounded-xl btn-gold text-void font-semibold text-lg shadow-lg shadow-gold/20 flex items-center gap-3 mx-auto"
          >
            <Icon icon="lucide:layout-dashboard" className="w-5 h-5" />
            Go to Dashboard
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void relative overflow-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className={`absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[180px] transition-colors duration-1000 ${
            timerMode === 'work' ? 'bg-gold/10' : 'bg-green-500/10'
          }`}
        />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-deep/50 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 px-4 sm:px-6 py-4 sm:py-6 bg-gradient-to-b from-void via-void/90 to-transparent backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Exit button */}
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExit}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card-static border border-white/10 text-text-secondary hover:text-rose hover:border-rose/30 active:bg-rose/10 transition-all duration-200 touch-manipulation shadow-lg shadow-black/10"
          >
            <Icon icon="lucide:arrow-left" className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Exit Focus</span>
          </motion.button>

          {/* Mode indicator */}
          <motion.div
            key={timerMode + breakType}
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-full shadow-xl ${
              timerMode === 'work'
                ? 'bg-gradient-to-r from-gold/20 to-gold/10 border border-gold/40 text-gold shadow-gold/20'
                : breakType === 'long'
                  ? 'bg-gradient-to-r from-blue-400/20 to-blue-400/10 border border-blue-400/40 text-blue-400 shadow-blue-400/20'
                  : 'bg-gradient-to-r from-green-500/20 to-green-500/10 border border-green-500/40 text-green-500 shadow-green-500/20'
            }`}
          >
            <motion.div
              animate={{ rotate: timerMode === 'work' && isTimerRunning ? [0, 5, -5, 0] : 0 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              <Icon
                icon={timerMode === 'work' ? 'lucide:brain' : breakType === 'long' ? 'lucide:bed' : 'lucide:coffee'}
                className="w-5 h-5"
              />
            </motion.div>
            <span className="text-sm font-bold tracking-wide">
              {timerMode === 'work' ? 'FOCUS TIME' : breakType === 'long' ? 'LONG BREAK' : 'SHORT BREAK'}
            </span>
          </motion.div>

          {/* Settings button */}
          <motion.button
            whileHover={{ scale: 1.05, rotate: 15 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSettingsOpen(true)}
            className="p-3 rounded-xl glass-card-static border border-white/10 text-text-secondary hover:text-gold hover:border-gold/30 active:bg-gold/10 transition-all duration-200 touch-manipulation shadow-lg shadow-black/10"
          >
            <Icon icon="lucide:settings" className="w-5 h-5" />
          </motion.button>
        </div>
      </header>

      {/* Main content */}
      <main className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-24 sm:pt-28 pb-8">
        <div className="max-w-4xl w-full space-y-8 sm:space-y-12">
          {/* Timer */}
          <FocusTimer size="lg" />

          {/* Task card */}
          <FocusTaskCard />

          {/* Ambient message */}
          <AnimatePresence mode="wait">
            <motion.div
              key={timerMode + (isTimerRunning ? '-running' : '-paused')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center max-w-md mx-auto"
            >
              <p className="text-text-secondary text-base sm:text-lg font-light italic">
                {timerMode === 'work' && isTimerRunning && (
                  <>&ldquo;Stay focused. You&apos;re doing great.&rdquo;</>
                )}
                {timerMode === 'work' && !isTimerRunning && (
                  <>&ldquo;Press play to start your focus session.&rdquo;</>
                )}
                {timerMode === 'break' && isTimerRunning && (
                  <>&ldquo;Take a moment to rest and recharge.&rdquo;</>
                )}
                {timerMode === 'break' && !isTimerRunning && (
                  <>&ldquo;Ready for a break? Press play to start.&rdquo;</>
                )}
              </p>
              {focusedTask?.is_completed && (
                <div className="mt-4 flex items-center justify-center gap-2 text-green-500">
                  <Icon icon="lucide:party-popper" className="w-5 h-5" />
                  <span className="text-sm font-medium">Task completed! Great work!</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Settings Modal */}
      <FocusSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {isExitConfirmOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExitConfirmOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/3 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-sm z-50 bg-gradient-to-b from-surface to-deep border border-white/10 rounded-2xl shadow-2xl p-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose/10 flex items-center justify-center">
                  <Icon icon="lucide:alert-triangle" className="w-8 h-8 text-rose" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  End Focus Session?
                </h3>
                <p className="text-sm text-text-secondary">
                  You&apos;ve completed {totalSessionPomodoros} pomodoro{totalSessionPomodoros !== 1 ? 's' : ''}.
                  Are you sure you want to exit?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsExitConfirmOpen(false)}
                  className="flex-1 px-4 py-3 rounded-lg border border-white/10 text-text-secondary hover:bg-white/5 transition-colors"
                >
                  Keep Going
                </button>
                <button
                  onClick={confirmExit}
                  className="flex-1 px-4 py-3 rounded-lg bg-rose/20 border border-rose/30 text-rose hover:bg-rose/30 transition-colors"
                >
                  Exit
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FocusFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-void">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function FocusPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<FocusFallback />}>
        <FocusContent />
      </Suspense>
    </ProtectedRoute>
  );
}
