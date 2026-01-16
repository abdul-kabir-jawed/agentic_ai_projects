'use client';

import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useFocusMode, formatTime } from '@/contexts/FocusModeContext';

interface FocusTimerProps {
  size?: 'sm' | 'md' | 'lg';
}

export function FocusTimer({ size = 'lg' }: FocusTimerProps) {
  const {
    timerMode,
    breakType,
    timeRemaining,
    isTimerRunning,
    completedPomodoros,
    settings,
    startTimer,
    pauseTimer,
    resetTimer,
    skipToBreak,
    skipToWork,
  } = useFocusMode();

  // Calculate progress percentage using proper break duration based on breakType
  const totalTime = timerMode === 'work'
    ? settings.workDuration * 60
    : breakType === 'long'
      ? settings.longBreakDuration * 60
      : settings.breakDuration * 60;
  const progress = totalTime > 0 ? (timeRemaining / totalTime) * 100 : 0;

  // Size configurations
  const sizeConfig = {
    sm: { container: 'w-32 h-32', stroke: 6, textSize: 'text-2xl' },
    md: { container: 'w-48 h-48', stroke: 8, textSize: 'text-4xl' },
    lg: { container: 'w-72 h-72', stroke: 10, textSize: 'text-6xl' },
  };

  const config = sizeConfig[size];
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Timer Circle */}
      <div className={`relative ${config.container}`}>
        {/* Background glow */}
        <div className={`absolute inset-0 rounded-full blur-2xl ${
          timerMode === 'work' ? 'bg-gold/20' : breakType === 'long' ? 'bg-blue-400/20' : 'bg-green-500/20'
        }`} />

        {/* SVG Timer */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={config.stroke}
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={timerMode === 'work' ? '#D4AF37' : breakType === 'long' ? '#60a5fa' : '#22c55e'}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            initial={false}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'linear' }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${config.textSize} font-mono font-bold text-text-primary`}>
            {formatTime(timeRemaining)}
          </span>
          <span className={`text-sm uppercase tracking-wider mt-2 ${
            timerMode === 'work' ? 'text-gold' : breakType === 'long' ? 'text-blue-400' : 'text-green-500'
          }`}>
            {timerMode === 'work' ? 'Focus' : breakType === 'long' ? 'Long Break' : 'Short Break'}
          </span>
        </div>
      </div>

      {/* Pomodoro indicators */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {[...Array(settings.pomodorosUntilLongBreak)].map((_, i) => (
          <motion.button
            key={i}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{
              scale: i < completedPomodoros ? 1.2 : 1,
              opacity: i < completedPomodoros ? 1 : 0.4,
            }}
            whileHover={{ scale: 1.3, opacity: 1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`w-5 h-5 rounded-full transition-all duration-300 cursor-pointer touch-manipulation ${
              i < completedPomodoros
                ? 'bg-gradient-to-br from-gold to-gold-bright shadow-lg shadow-gold/30'
                : 'bg-white/10 border border-white/20 hover:border-gold/40 hover:bg-gold/10'
            }`}
            aria-label={`Pomodoro ${i + 1} ${i < completedPomodoros ? 'completed' : 'pending'}`}
            title={`Pomodoro ${i + 1} ${i < completedPomodoros ? '(completed)' : '(pending)'}`}
          />
        ))}
        <span className="text-sm text-text-secondary ml-3 font-medium">
          {completedPomodoros} / {settings.pomodorosUntilLongBreak}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6">
        {/* Skip backward (reset or go to work) */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={timerMode === 'break' ? skipToWork : resetTimer}
          className="p-4 rounded-full glass-card-static border border-white/10 text-text-secondary hover:text-gold hover:border-gold/30 active:bg-gold/10 transition-all duration-200 touch-manipulation"
          title={timerMode === 'break' ? 'Skip to work' : 'Reset timer'}
          aria-label={timerMode === 'break' ? 'Skip to work' : 'Reset timer'}
        >
          <Icon icon="lucide:skip-back" className="w-6 h-6" />
        </motion.button>

        {/* Play/Pause */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={isTimerRunning ? pauseTimer : startTimer}
          className={`p-6 rounded-full transition-all duration-200 touch-manipulation shadow-lg ${
            isTimerRunning
              ? 'bg-white/10 text-text-primary hover:bg-white/20 active:bg-white/30 border border-white/20'
              : 'btn-gold text-void shadow-gold/30'
          }`}
          aria-label={isTimerRunning ? 'Pause timer' : 'Start timer'}
        >
          <Icon
            icon={isTimerRunning ? 'lucide:pause' : 'lucide:play'}
            className="w-10 h-10"
          />
        </motion.button>

        {/* Skip forward (to break or reset break) */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={timerMode === 'work' ? skipToBreak : resetTimer}
          className="p-4 rounded-full glass-card-static border border-white/10 text-text-secondary hover:text-gold hover:border-gold/30 active:bg-gold/10 transition-all duration-200 touch-manipulation"
          title={timerMode === 'work' ? 'Skip to break' : 'Reset break'}
          aria-label={timerMode === 'work' ? 'Skip to break' : 'Reset break'}
        >
          <Icon icon="lucide:skip-forward" className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  );
}
