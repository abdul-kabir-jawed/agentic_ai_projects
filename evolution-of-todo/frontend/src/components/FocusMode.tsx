'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/types/task';

interface FocusModeProps {
  task: Task | null;
  isActive: boolean;
  onExit: () => void;
}

export default function FocusMode({ task, isActive, onExit }: FocusModeProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isActive || !isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center flex-col"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight mb-4">
              Deep Focus
            </h2>
            <div className="text-amber-400 font-mono text-3xl md:text-4xl tracking-widest">
              {formatTime(timeLeft)}
            </div>
          </motion.div>

          {task && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-full max-w-2xl"
            >
              <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border-2 border-amber-500/30">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 blur-2xl group-hover:bg-amber-500/30 transition-colors"></div>

                <div className="relative z-10">
                  <h3 className="text-2xl font-semibold text-white mb-4">
                    {task.description}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {task.priority.toUpperCase()}
                    </span>

                    {task.due_date && (
                      <span className="text-sm text-slate-400">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}

                    {task.tags && (
                      <div className="flex gap-2">
                        {task.tags.split(',').map((tag) => (
                          <span
                            key={tag.trim()}
                            className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                    Stay focused. You can do this.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onExit}
            className="mt-12 px-8 py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-sm tracking-widest uppercase transition-colors text-white/60 hover:text-white font-medium"
          >
            Exit Focus
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
