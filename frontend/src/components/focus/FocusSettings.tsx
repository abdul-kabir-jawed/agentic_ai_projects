'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useFocusMode } from '@/contexts/FocusModeContext';

interface FocusSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FocusSettings({ isOpen, onClose }: FocusSettingsProps) {
  const { settings, updateSettings } = useFocusMode();
  const [localSettings, setLocalSettings] = useState(settings);

  // Sync localSettings with settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  const handleReset = () => {
    const defaults = {
      workDuration: 25,
      breakDuration: 5,
      longBreakDuration: 15,
      pomodorosUntilLongBreak: 2,
      autoStartBreaks: true,
      autoStartPomodoros: false,
      enableNotifications: true,
      enableSounds: true,
    };
    setLocalSettings(defaults);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-50 bg-gradient-to-b from-surface to-deep border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
                  <Icon icon="lucide:settings" className="w-5 h-5 text-gold" />
                </div>
                <h2 className="text-lg font-semibold text-text-primary">Focus Settings</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <Icon icon="lucide:x" className="w-5 h-5 text-text-tertiary" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Timer durations */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                  Timer Durations
                </h3>

                {/* Work duration */}
                <div className="flex items-center justify-between">
                  <label className="text-text-primary">Focus Duration</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLocalSettings(s => ({
                        ...s,
                        workDuration: Math.max(1, s.workDuration - 5)
                      }))}
                      className="p-1 rounded-lg hover:bg-white/10 text-text-tertiary hover:text-gold transition-colors"
                    >
                      <Icon icon="lucide:minus" className="w-4 h-4" />
                    </button>
                    <span className="w-16 text-center text-gold font-medium">
                      {localSettings.workDuration} min
                    </span>
                    <button
                      onClick={() => setLocalSettings(s => ({
                        ...s,
                        workDuration: Math.min(60, s.workDuration + 5)
                      }))}
                      className="p-1 rounded-lg hover:bg-white/10 text-text-tertiary hover:text-gold transition-colors"
                    >
                      <Icon icon="lucide:plus" className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Break duration */}
                <div className="flex items-center justify-between">
                  <label className="text-text-primary">Short Break</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLocalSettings(s => ({
                        ...s,
                        breakDuration: Math.max(1, s.breakDuration - 1)
                      }))}
                      className="p-1 rounded-lg hover:bg-white/10 text-text-tertiary hover:text-gold transition-colors"
                    >
                      <Icon icon="lucide:minus" className="w-4 h-4" />
                    </button>
                    <span className="w-16 text-center text-green-500 font-medium">
                      {localSettings.breakDuration} min
                    </span>
                    <button
                      onClick={() => setLocalSettings(s => ({
                        ...s,
                        breakDuration: Math.min(30, s.breakDuration + 1)
                      }))}
                      className="p-1 rounded-lg hover:bg-white/10 text-text-tertiary hover:text-gold transition-colors"
                    >
                      <Icon icon="lucide:plus" className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Long break duration */}
                <div className="flex items-center justify-between">
                  <label className="text-text-primary">Long Break</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLocalSettings(s => ({
                        ...s,
                        longBreakDuration: Math.max(5, s.longBreakDuration - 5)
                      }))}
                      className="p-1 rounded-lg hover:bg-white/10 text-text-tertiary hover:text-gold transition-colors"
                    >
                      <Icon icon="lucide:minus" className="w-4 h-4" />
                    </button>
                    <span className="w-16 text-center text-blue-400 font-medium">
                      {localSettings.longBreakDuration} min
                    </span>
                    <button
                      onClick={() => setLocalSettings(s => ({
                        ...s,
                        longBreakDuration: Math.min(45, s.longBreakDuration + 5)
                      }))}
                      className="p-1 rounded-lg hover:bg-white/10 text-text-tertiary hover:text-gold transition-colors"
                    >
                      <Icon icon="lucide:plus" className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Pomodoros until long break */}
                <div className="flex items-center justify-between">
                  <label className="text-text-primary">Long Break After</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLocalSettings(s => ({
                        ...s,
                        pomodorosUntilLongBreak: Math.max(2, s.pomodorosUntilLongBreak - 1)
                      }))}
                      className="p-1 rounded-lg hover:bg-white/10 text-text-tertiary hover:text-gold transition-colors"
                    >
                      <Icon icon="lucide:minus" className="w-4 h-4" />
                    </button>
                    <span className="w-24 text-center text-text-secondary font-medium">
                      {localSettings.pomodorosUntilLongBreak} pomodoros
                    </span>
                    <button
                      onClick={() => setLocalSettings(s => ({
                        ...s,
                        pomodorosUntilLongBreak: Math.min(8, s.pomodorosUntilLongBreak + 1)
                      }))}
                      className="p-1 rounded-lg hover:bg-white/10 text-text-tertiary hover:text-gold transition-colors"
                    >
                      <Icon icon="lucide:plus" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Auto-start toggles */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                  Automation
                </h3>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-text-primary">Auto-start breaks</span>
                  <button
                    onClick={() => setLocalSettings(s => ({ ...s, autoStartBreaks: !s.autoStartBreaks }))}
                    className={`w-12 h-7 rounded-full transition-colors ${
                      localSettings.autoStartBreaks ? 'bg-gold' : 'bg-white/20'
                    }`}
                  >
                    <motion.div
                      animate={{ x: localSettings.autoStartBreaks ? 22 : 2 }}
                      className="w-5 h-5 rounded-full bg-white shadow-md"
                    />
                  </button>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-text-primary">Auto-start pomodoros</span>
                  <button
                    onClick={() => setLocalSettings(s => ({ ...s, autoStartPomodoros: !s.autoStartPomodoros }))}
                    className={`w-12 h-7 rounded-full transition-colors ${
                      localSettings.autoStartPomodoros ? 'bg-gold' : 'bg-white/20'
                    }`}
                  >
                    <motion.div
                      animate={{ x: localSettings.autoStartPomodoros ? 22 : 2 }}
                      className="w-5 h-5 rounded-full bg-white shadow-md"
                    />
                  </button>
                </label>
              </div>

              {/* Notifications */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                  Notifications
                </h3>

                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:bell" className="w-4 h-4 text-text-tertiary" />
                    <span className="text-text-primary">Desktop notifications</span>
                  </div>
                  <button
                    onClick={() => setLocalSettings(s => ({ ...s, enableNotifications: !s.enableNotifications }))}
                    className={`w-12 h-7 rounded-full transition-colors ${
                      localSettings.enableNotifications ? 'bg-gold' : 'bg-white/20'
                    }`}
                  >
                    <motion.div
                      animate={{ x: localSettings.enableNotifications ? 22 : 2 }}
                      className="w-5 h-5 rounded-full bg-white shadow-md"
                    />
                  </button>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:volume-2" className="w-4 h-4 text-text-tertiary" />
                    <span className="text-text-primary">Sound effects</span>
                  </div>
                  <button
                    onClick={() => setLocalSettings(s => ({ ...s, enableSounds: !s.enableSounds }))}
                    className={`w-12 h-7 rounded-full transition-colors ${
                      localSettings.enableSounds ? 'bg-gold' : 'bg-white/20'
                    }`}
                  >
                    <motion.div
                      animate={{ x: localSettings.enableSounds ? 22 : 2 }}
                      className="w-5 h-5 rounded-full bg-white shadow-md"
                    />
                  </button>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-5 border-t border-white/10 bg-surface/50">
              <button
                onClick={handleReset}
                className="text-sm text-text-tertiary hover:text-rose transition-colors"
              >
                Reset to defaults
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-white/10 text-text-secondary hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg btn-gold text-void font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
