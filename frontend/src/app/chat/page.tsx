'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ProtectedAppLayout from '@/components/ProtectedAppLayout';
import { useChatModal, ChatMessage } from '@/contexts/ChatModalContext';
import { taskAPI } from '@/services/api';

// ============================================================
// VOICE COMMAND TYPES AND SETUP
// ============================================================

// TypeScript types for Web Speech API (not built into lib by default)
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

// Voice state types
type VoiceState = 'idle' | 'listening' | 'processing' | 'error';

// Voice mode types
type VoiceMode = 'manual' | 'auto';

// Get browser-compatible SpeechRecognition
const getSpeechRecognition = (): (new () => SpeechRecognition) | null => {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

const prompts = [
  {
    icon: 'lucide:list-checks',
    label: 'Create a task',
    prompt: 'Create a task for my project',
  },
  {
    icon: 'lucide:list',
    label: 'Show my tasks',
    prompt: 'Show me all my tasks',
  },
  {
    icon: 'lucide:check-circle',
    label: 'Complete a task',
    prompt: 'Mark my last task as complete',
  },
  {
    icon: 'lucide:calendar',
    label: 'Schedule today',
    prompt: 'Show me my tasks for today and help me prioritize',
  },
  {
    icon: 'lucide:trending-up',
    label: 'Track progress',
    prompt: 'Show me my productivity insights and completion rate',
  },
  {
    icon: 'lucide:sparkles',
    label: 'Get tips',
    prompt: 'Give me productivity tips for better task management',
  },
];

function ChatContent() {
  const router = useRouter();
  const {
    messages,
    isLoading,
    isSending,
    sendMessage,
    clearChat,
    refreshMessages,
  } = useChatModal();

  const [input, setInput] = useState('');
  const [taskStats, setTaskStats] = useState({ completed: 0, total: 0 });
  const [isPromptsExpanded, setIsPromptsExpanded] = useState(true);
  const [canUseChat, setCanUseChat] = useState<boolean | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice settings state
  const [voiceMode, setVoiceMode] = useState<VoiceMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('voiceMode') as VoiceMode) || 'auto';
    }
    return 'auto';
  });
  const [showSettings, setShowSettings] = useState(false);

  // Save voice mode to localStorage
  const saveVoiceMode = (mode: VoiceMode) => {
    setVoiceMode(mode);
    localStorage.setItem('voiceMode', mode);
    setShowSettings(false);
  };

  // ============================================================
  // VOICE COMMAND STATE AND REFS
  // ============================================================
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const voiceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const voiceStateRef = useRef<VoiceState>('idle');

  // Keep voiceStateRef in sync with voiceState
  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  // Check for speech recognition support on mount
  useEffect(() => {
    const SpeechRecognitionClass = getSpeechRecognition();
    setIsVoiceSupported(!!SpeechRecognitionClass);
  }, []);

  // Check API key access on mount
  useEffect(() => {
    const checkApiKeyAccess = async () => {
      setIsCheckingAccess(true);
      try {
        const result = await taskAPI.checkChatApiKeyAccess();
        setCanUseChat(result.can_use_chat);
      } catch (err) {
        // If the check fails, assume chat is disabled
        setCanUseChat(false);
      } finally {
        setIsCheckingAccess(false);
      }
    };
    checkApiKeyAccess();
  }, []);

  // Load task stats for sidebar (graceful failure)
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await taskAPI.getTasks(0, 100);
        if (response) {
          const allTasks = response.items || [];
          const completed = allTasks.filter((t: any) => t.is_completed).length;
          setTaskStats({ completed, total: allTasks.length });
        }
      } catch {
        // Silently ignore - stats are optional
        setTaskStats({ completed: 0, total: 0 });
      }
    };
    loadStats();
  }, []);

  // Auto-scroll to bottom when new message is added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
      }
    };
  }, []);

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) return null;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('[Voice] Speech recognition started');
      setVoiceState('listening');
      setInterimTranscript('');
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }

      if (interim) {
        setInterimTranscript(interim);
      }

      if (finalTranscript) {
        console.log('[Voice] Final transcript:', finalTranscript);
        setInput(finalTranscript.trim());
        setInterimTranscript('');

        // Check voice mode: manual or auto
        const currentVoiceMode = localStorage.getItem('voiceMode') || 'auto';

        if (currentVoiceMode === 'auto') {
          // Auto mode: send message automatically
          setVoiceState('processing');
          setTimeout(() => {
            handleSendMessage(finalTranscript.trim());
            setVoiceState('idle');
          }, 300);
        } else {
          // Manual mode: just put text in input for user to edit
          setVoiceState('idle');
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[Voice] Speech recognition error:', event.error);
      setVoiceState('error');

      let errorMessage = 'Voice recognition failed';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not found. Please check your settings.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
      }
      setError(errorMessage);

      // Reset to idle after showing error
      setTimeout(() => setVoiceState('idle'), 2000);
    };

    recognition.onend = () => {
      console.log('[Voice] Speech recognition ended');
      if (voiceStateRef.current === 'listening') {
        setVoiceState('idle');
      }
    };

    return recognition;
  }, []);

  // Start voice recognition
  const startVoiceRecognition = useCallback(() => {
    if (voiceState !== 'idle' || isSending) return;

    try {
      // Clean up any existing recognition
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = initializeSpeechRecognition();
      if (!recognition) {
        setError('Voice recognition not supported in this browser');
        return;
      }

      recognitionRef.current = recognition;
      recognition.start();

      // Auto-stop after 10 seconds to prevent hanging
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
      }
      voiceTimeoutRef.current = setTimeout(() => {
        if (recognitionRef.current && voiceStateRef.current === 'listening') {
          recognitionRef.current.stop();
        }
      }, 10000);

    } catch (err) {
      console.error('[Voice] Failed to start recognition:', err);
      setError('Failed to start voice recognition');
      setVoiceState('idle');
    }
  }, [voiceState, isSending, initializeSpeechRecognition]);

  // Stop voice recognition
  const stopVoiceRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (voiceTimeoutRef.current) {
      clearTimeout(voiceTimeoutRef.current);
    }
    setVoiceState('idle');
    setInterimTranscript('');
  }, []);

  // Toggle voice recognition
  const toggleVoiceRecognition = useCallback(() => {
    if (voiceState === 'listening') {
      stopVoiceRecognition();
    } else {
      startVoiceRecognition();
    }
  }, [voiceState, startVoiceRecognition, stopVoiceRecognition]);

  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isSending) return;

    setInput('');
    setError(null);

    try {
      await sendMessage(messageText);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to get response. Please try again.');
    }
  }, [sendMessage, isSending]);

  const handleSend = useCallback(async () => {
    if (input.trim() && !isSending) {
      await handleSendMessage(input);
    }
  }, [input, isSending, handleSendMessage]);

  const handlePromptClick = useCallback(async (prompt: string) => {
    if (!isSending) {
      await handleSendMessage(prompt);
    }
  }, [isSending, handleSendMessage]);

  const handleClearChat = useCallback(async () => {
    setInput('');
    setError(null);
    setIsPromptsExpanded(true);
    await clearChat();
  }, [clearChat]);

  // Format timestamp for display
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ProtectedAppLayout completedCount={taskStats.completed} totalCount={taskStats.total}>
      {/* Header */}
      <header className="px-6 pt-12 pb-6 md:px-10 md:pt-14 md:pb-8 flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-serif font-medium text-text-primary mb-2"
            >
              AI Task Manager
            </motion.h1>
            <p className="text-text-secondary text-sm">I can create, list, complete, and delete your tasks</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice Settings Button */}
            {isVoiceSupported && (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded-lg transition-colors ${
                    showSettings
                      ? 'bg-gold/10 text-gold'
                      : 'glass-card-static border border-white/10 hover:border-gold/30 text-text-tertiary hover:text-gold'
                  }`}
                  title="Voice settings"
                >
                  <Icon icon="lucide:settings" className="w-4 h-4" />
                </motion.button>

                {/* Settings Dropdown */}
                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-72 bg-elevated border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-3 border-b border-white/5">
                        <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
                          <Icon icon="lucide:mic" className="w-4 h-4 text-gold" />
                          Voice Mode Settings
                        </h3>
                      </div>
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => saveVoiceMode('manual')}
                          className={`w-full p-3 rounded-lg text-left transition-all ${
                            voiceMode === 'manual'
                              ? 'bg-gold/20 border border-gold/30'
                              : 'hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              voiceMode === 'manual' ? 'border-gold' : 'border-white/30'
                            }`}>
                              {voiceMode === 'manual' && (
                                <div className="w-2 h-2 rounded-full bg-gold" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text-primary">Manual Mode</p>
                              <p className="text-xs text-text-tertiary">Speak → Edit text → Send manually</p>
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={() => saveVoiceMode('auto')}
                          className={`w-full p-3 rounded-lg text-left transition-all ${
                            voiceMode === 'auto'
                              ? 'bg-gold/20 border border-gold/30'
                              : 'hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              voiceMode === 'auto' ? 'border-gold' : 'border-white/30'
                            }`}>
                              {voiceMode === 'auto' && (
                                <div className="w-2 h-2 rounded-full bg-gold" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text-primary">Auto Mode</p>
                              <p className="text-xs text-text-tertiary">Speak → Send directly to AI</p>
                            </div>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Delete Chat Button */}
            {messages.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearChat}
                className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card-static border border-white/10 hover:border-rose/30 text-text-secondary hover:text-rose transition-all duration-300"
                aria-label="Clear chat"
              >
                <Icon icon="lucide:trash-2" className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Clear Chat</span>
              </motion.button>
            )}
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="mx-6 md:mx-10 mb-4 px-4 py-3 bg-rose/10 border border-rose/20 rounded-xl">
          <p className="text-sm text-rose">{error}</p>
        </div>
      )}

      {/* Voice Listening Indicator */}
      {voiceState === 'listening' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mx-6 md:mx-10 mb-4 px-4 py-3 bg-gold/10 border border-gold/20 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-1.5 h-4 bg-gold rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-6 bg-gold rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-4 bg-gold rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              <div className="w-1.5 h-5 bg-gold rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
            </div>
            <p className="text-sm text-gold flex-1">
              {interimTranscript || 'Listening... Speak now'}
            </p>
            <button
              onClick={stopVoiceRecognition}
              className="text-sm text-gold hover:text-gold-bright transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-24 md:pb-8 space-y-4">
        {isCheckingAccess ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-gold animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        ) : canUseChat === false ? (
          <div className="h-full flex flex-col items-center justify-center space-y-6 px-4">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-gold/10 flex items-center justify-center">
                <Icon icon="lucide:key" className="w-10 h-10 text-gold" />
              </div>
              <h3 className="text-xl font-serif font-medium text-text-primary">
                API Key Required
              </h3>
              <p className="text-sm text-text-secondary max-w-xs">
                To use AI chat features, you need to configure your Gemini or OpenAI API key in your profile settings.
              </p>
            </div>
            <div className="space-y-3 w-full max-w-xs">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/profile')}
                className="w-full py-3 px-4 rounded-xl btn-gold font-medium flex items-center justify-center gap-2"
              >
                <Icon icon="lucide:settings" className="w-5 h-5 text-void" />
                <span className="text-void">Go to Settings</span>
              </motion.button>
              <p className="text-xs text-text-tertiary text-center">
                Your API keys are encrypted and stored securely.
              </p>
            </div>
          </div>
        ) : isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-gold animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        ) : messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center pt-12"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
              <Icon icon="lucide:sparkles" className="w-10 h-10 text-gold" />
            </div>
            <h2 className="text-3xl font-serif font-medium text-text-primary mb-2">Welcome to AI Task Manager</h2>
            <p className="text-text-secondary mb-4">I can create, list, complete, and delete tasks for you. Try it!</p>
            {isVoiceSupported && (
              <p className="text-sm text-gold mb-8">
                <Icon icon="lucide:mic" className="w-4 h-4 inline mr-1" />
                Voice commands enabled! Click the microphone or use the gear icon to adjust settings.
              </p>
            )}
          </motion.div>
        ) : (
          <>
            {messages.map((message, index) => (
              <motion.div
                key={message.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-bright flex-shrink-0 flex items-center justify-center shadow-lg shadow-gold/30">
                    <Icon icon="lucide:sparkles" className="w-5 h-5 text-void drop-shadow-md" />
                  </div>
                )}
                <div
                  className={`max-w-lg rounded-2xl px-5 py-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-gold/20 to-gold-bright/20 border border-gold/30 rounded-br-none text-text-primary'
                      : 'glass-card-static border border-white/5 rounded-bl-none text-text-secondary'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  {message.created_at && (
                    <p className="text-[10px] mt-2 text-text-tertiary">{formatTime(message.created_at)}</p>
                  )}
                </div>
              </motion.div>
            ))}

            {isSending && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex gap-4 justify-start"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-bright flex-shrink-0 flex items-center justify-center shadow-lg shadow-gold/30">
                  <Icon icon="lucide:sparkles" className="w-5 h-5 text-void drop-shadow-md animate-spin" />
                </div>
                <div className="max-w-lg rounded-2xl px-5 py-4 glass-card-static border border-white/5 rounded-bl-none">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-gold animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area with prompts */}
      <div className="px-6 md:px-10 py-6 border-t border-white/5 pb-24 md:pb-6">
        <div className="max-w-4xl mx-auto">
          {/* Quick prompts grid - Collapsible */}
          {messages.length === 0 && (
            <div className="mb-6">
              {/* Toggle button */}
              <button
                onClick={() => setIsPromptsExpanded(!isPromptsExpanded)}
                className="flex items-center gap-2 mb-4 text-text-secondary hover:text-gold transition-colors"
              >
                <Icon
                  icon={isPromptsExpanded ? "lucide:chevron-up" : "lucide:chevron-down"}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">
                  {isPromptsExpanded ? 'Hide' : 'Show'} Quick Prompts
                </span>
              </button>

              {/* Prompts grid - Collapsible */}
              <motion.div
                initial={false}
                animate={{
                  height: isPromptsExpanded ? 'auto' : 0,
                  opacity: isPromptsExpanded ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {prompts.map((p) => (
                    <motion.button
                      key={p.label}
                      whileHover={{ scale: 1.02, translateY: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePromptClick(p.prompt)}
                      disabled={isSending || canUseChat === false}
                      className="flex items-center gap-3 p-3 rounded-lg glass-card-static border border-white/10 hover:border-gold/30 transition-all duration-300 disabled:opacity-50"
                    >
                      <Icon icon={p.icon} className="w-4 h-4 text-gold" />
                      <span className="text-sm font-medium text-text-secondary hover:text-text-primary text-left">{p.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Input field with enhanced styling */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/0 to-gold/0 group-focus-within:from-gold/10 group-focus-within:via-gold/5 group-focus-within:to-gold/0 rounded-xl transition-all duration-300 blur" />
            <div className="relative flex gap-1.5 md:gap-2">
              <input
                type="text"
                value={voiceState === 'listening' ? interimTranscript : input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isSending && input.trim() && canUseChat !== false && voiceState !== 'listening' && handleSend()}
                placeholder={canUseChat === false ? "API key required to use chat..." : voiceState === 'listening' ? "Listening..." : "Ask me to create, list, or complete tasks..."}
                disabled={isSending || canUseChat === false || voiceState === 'listening'}
                className="flex-1 min-w-0 glass-card-static border border-white/10 group-focus-within:border-gold/50 rounded-xl p-4 pr-4 text-text-primary placeholder-text-tertiary focus:ring-2 focus:ring-gold/20 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />

              {/* Voice Command Button */}
              {isVoiceSupported && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleVoiceRecognition}
                  disabled={isSending || voiceState === 'processing' || canUseChat === false}
                  className={`flex-shrink-0 p-4 rounded-xl transition-all ${
                    voiceState === 'listening'
                      ? 'bg-rose/20 border border-rose/50 text-rose animate-pulse'
                      : voiceState === 'error'
                      ? 'bg-rose/10 border border-rose/30 text-rose'
                      : 'glass-card-static border border-white/10 text-text-secondary hover:border-gold/50 hover:text-gold'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-label={voiceState === 'listening' ? 'Stop listening' : 'Start voice command'}
                >
                  <Icon icon={voiceState === 'listening' ? 'lucide:mic-off' : 'lucide:mic'} className="w-5 h-5" />
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!input.trim() || isSending || canUseChat === false || voiceState === 'listening'}
                className="flex-shrink-0 p-4 rounded-xl btn-gold text-void disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                aria-label="Send message"
              >
                <Icon icon="lucide:send" className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedAppLayout>
  );
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatContent />
    </ProtectedRoute>
  );
}
