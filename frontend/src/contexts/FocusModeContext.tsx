'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { Task } from '@/types/task';
import { taskAPI } from '@/services/api';
import toast from 'react-hot-toast';

type TimerMode = 'work' | 'break';
type BreakType = 'short' | 'long';

interface FocusModeSettings {
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  pomodorosUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  enableNotifications: boolean;
  enableSounds: boolean;
}

interface FocusModeContextType {
  // State
  isFocusModeActive: boolean;
  focusedTask: Task | null;
  timerMode: TimerMode;
  breakType: BreakType;
  timeRemaining: number; // in seconds
  isTimerRunning: boolean;
  completedPomodoros: number;
  totalSessionPomodoros: number;

  // Settings
  settings: FocusModeSettings;
  updateSettings: (settings: Partial<FocusModeSettings>) => void;

  // Actions
  startFocusMode: (taskId: string) => Promise<void>;
  endFocusMode: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipToBreak: () => void;
  skipToWork: () => void;
  completeTask: () => Promise<void>;
}

const DEFAULT_SETTINGS: FocusModeSettings = {
  workDuration: 25,
  breakDuration: 5,
  longBreakDuration: 15,
  pomodorosUntilLongBreak: 2, // Long break after every 2 pomodoros (even numbers)
  autoStartBreaks: true,
  autoStartPomodoros: false,
  enableNotifications: true,
  enableSounds: true,
};

const STORAGE_KEY = 'focusModeSettings';

const FocusModeContext = createContext<FocusModeContextType | undefined>(undefined);

export function FocusModeProvider({ children }: { children: ReactNode }) {
  // Core state
  const [isFocusModeActive, setIsFocusModeActive] = useState(false);
  const [focusedTask, setFocusedTask] = useState<Task | null>(null);
  const [timerMode, setTimerMode] = useState<TimerMode>('work');
  const [breakType, setBreakType] = useState<BreakType>('short');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [totalSessionPomodoros, setTotalSessionPomodoros] = useState(0);

  // Settings
  const [settings, setSettings] = useState<FocusModeSettings>(DEFAULT_SETTINGS);

  // Refs for timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch {
        // Use defaults
      }
    }
  }, []);

  // Request notification permission
  useEffect(() => {
    if (settings.enableNotifications && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [settings.enableNotifications]);

  // Play notification sound
  const playSound = useCallback(() => {
    if (!settings.enableSounds) return;

    try {
      // Use Web Audio API for a simple bell sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 880; // A5 note
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch {
      // Audio not supported
    }
  }, [settings.enableSounds]);

  // Show notification
  const showNotification = useCallback(
    (title: string, body: string) => {
      if (!settings.enableNotifications) return;

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: 'focus-mode',
        });
      }
    },
    [settings.enableNotifications]
  );

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    setIsTimerRunning(false);
    playSound();

    if (timerMode === 'work') {
      const newPomodoros = completedPomodoros + 1;
      setCompletedPomodoros(newPomodoros);
      setTotalSessionPomodoros((prev) => prev + 1);

      // Long break logic: even pomodoros (2, 4, 6...) get long break
      // Odd pomodoros (1, 3, 5...) get short break
      const isLongBreak = newPomodoros % settings.pomodorosUntilLongBreak === 0;
      const breakDuration = isLongBreak
        ? settings.longBreakDuration
        : settings.breakDuration;

      setTimerMode('break');
      setBreakType(isLongBreak ? 'long' : 'short');
      setTimeRemaining(breakDuration * 60);

      showNotification(
        'Pomodoro Complete!',
        `Great work! Time for a ${isLongBreak ? 'long ' : 'short '}break.`
      );
      toast.success(`Pomodoro complete! Take a ${isLongBreak ? 'long ' : 'short '}break.`, { duration: 3000 });

      if (settings.autoStartBreaks) {
        setIsTimerRunning(true);
      }
    } else {
      setTimerMode('work');
      setBreakType('short');
      setTimeRemaining(settings.workDuration * 60);

      showNotification('Break Over!', 'Ready to focus again?');
      toast('Break over! Ready to focus?', { icon: '💪', duration: 3000 });

      if (settings.autoStartPomodoros) {
        setIsTimerRunning(true);
      }
    }
  }, [
    timerMode,
    completedPomodoros,
    settings,
    playSound,
    showNotification,
  ]);

  // Timer tick effect - MUST be after handleTimerComplete is defined
  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Timer completed - use setTimeout to avoid state update during render
            setTimeout(() => handleTimerComplete(), 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTimerRunning, handleTimerComplete]);

  // Update settings - apply immediately if timer not running
  const updateSettings = useCallback((newSettings: Partial<FocusModeSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // If timer is not running, update timeRemaining to reflect new settings
      if (!isTimerRunning && isFocusModeActive) {
        if (timerMode === 'work') {
          setTimeRemaining(updated.workDuration * 60);
        } else {
          // Determine if current break should be short or long based on completed pomodoros
          const isLongBreak = completedPomodoros > 0 && completedPomodoros % updated.pomodorosUntilLongBreak === 0;
          const breakDuration = isLongBreak ? updated.longBreakDuration : updated.breakDuration;
          setTimeRemaining(breakDuration * 60);
          setBreakType(isLongBreak ? 'long' : 'short');
        }
      }

      return updated;
    });
  }, [isTimerRunning, isFocusModeActive, timerMode, completedPomodoros]);

  // Start focus mode
  const startFocusMode = useCallback(async (taskId: string) => {
    try {
      const task = await taskAPI.getTask(taskId);
      setFocusedTask(task);
      setIsFocusModeActive(true);
      setTimerMode('work');
      setTimeRemaining(settings.workDuration * 60);
      setIsTimerRunning(false);
      setCompletedPomodoros(0);
      setTotalSessionPomodoros(0);
      toast.success('Focus mode activated!', { duration: 2000 });
    } catch (error) {
      toast.error('Failed to start focus mode', { duration: 3000 });
      console.error('Focus mode error:', error);
    }
  }, [settings.workDuration]);

  // End focus mode
  const endFocusMode = useCallback(() => {
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Store session stats before reset
    const sessionPomodoros = totalSessionPomodoros;

    // Dismiss all existing toasts to prevent stuck toasts
    toast.dismiss();

    // Reset ALL state
    setIsFocusModeActive(false);
    setFocusedTask(null);
    setTimerMode('work');
    setBreakType('short');
    setTimeRemaining(0);
    setIsTimerRunning(false);
    setCompletedPomodoros(0);
    setTotalSessionPomodoros(0);

    // Show completion toast with slight delay to ensure dismiss happened
    setTimeout(() => {
      if (sessionPomodoros > 0) {
        toast.success(`Session ended! Completed ${sessionPomodoros} pomodoro${sessionPomodoros > 1 ? 's' : ''}.`, { duration: 3000 });
      }
    }, 100);
  }, [totalSessionPomodoros]);

  // Timer controls
  const startTimer = useCallback(() => {
    if (timeRemaining === 0) {
      // Initialize timer if not set
      const duration = timerMode === 'work' ? settings.workDuration : settings.breakDuration;
      setTimeRemaining(duration * 60);
    }
    setIsTimerRunning(true);
  }, [timeRemaining, timerMode, settings]);

  const pauseTimer = useCallback(() => {
    setIsTimerRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsTimerRunning(false);
    if (timerMode === 'work') {
      setTimeRemaining(settings.workDuration * 60);
    } else {
      // Use proper break duration based on current break type
      const breakDuration = breakType === 'long' ? settings.longBreakDuration : settings.breakDuration;
      setTimeRemaining(breakDuration * 60);
    }
  }, [timerMode, breakType, settings]);

  const skipToBreak = useCallback(() => {
    // Skip to break and count this as a completed pomodoro
    const newPomodoros = completedPomodoros + 1;
    setCompletedPomodoros(newPomodoros);
    setTotalSessionPomodoros((prev) => prev + 1);
    setIsTimerRunning(false);
    setTimerMode('break');
    // Long break for even pomodoros (2, 4, 6...), short break for odd (1, 3, 5...)
    const isLongBreak = newPomodoros % settings.pomodorosUntilLongBreak === 0;
    const breakDuration = isLongBreak
      ? settings.longBreakDuration
      : settings.breakDuration;
    setBreakType(isLongBreak ? 'long' : 'short');
    setTimeRemaining(breakDuration * 60);
    toast.success(`Pomodoro ${newPomodoros} complete! Take a ${isLongBreak ? 'long ' : 'short '}break.`, { duration: 2000 });
  }, [settings.breakDuration, settings.longBreakDuration, settings.pomodorosUntilLongBreak, completedPomodoros]);

  const skipToWork = useCallback(() => {
    setIsTimerRunning(false);
    setTimerMode('work');
    setBreakType('short');
    setTimeRemaining(settings.workDuration * 60);
    toast('Skipped to work mode', { icon: '💪', duration: 2000 });
  }, [settings.workDuration]);

  // Complete the focused task
  const completeTask = useCallback(async () => {
    if (!focusedTask) return;

    try {
      const updated = await taskAPI.markTaskComplete(focusedTask.id);
      setFocusedTask(updated);

      // Stop the timer when task is completed
      setIsTimerRunning(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Don't show toast here - the banner will be shown instead
    } catch (error) {
      toast.error('Failed to complete task', { duration: 3000 });
      console.error('Complete task error:', error);
    }
  }, [focusedTask]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <FocusModeContext.Provider
      value={{
        isFocusModeActive,
        focusedTask,
        timerMode,
        breakType,
        timeRemaining,
        isTimerRunning,
        completedPomodoros,
        totalSessionPomodoros,
        settings,
        updateSettings,
        startFocusMode,
        endFocusMode,
        startTimer,
        pauseTimer,
        resetTimer,
        skipToBreak,
        skipToWork,
        completeTask,
      }}
    >
      {children}
    </FocusModeContext.Provider>
  );
}

export function useFocusMode() {
  const context = useContext(FocusModeContext);
  if (context === undefined) {
    throw new Error('useFocusMode must be used within a FocusModeProvider');
  }
  return context;
}

// Helper function to format time
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
