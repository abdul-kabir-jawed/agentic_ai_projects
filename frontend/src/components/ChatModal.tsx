'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import { useChatModal, ChatMessage } from '@/contexts/ChatModalContext';
import { Icon } from '@iconify/react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { taskAPI } from '@/services/api';
import { useRouter } from 'next/navigation';

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

const STARTING_PROMPTS = [
  {
    icon: 'lucide:list-todo',
    label: 'Create a task',
    prompt: 'Create a task for my project',
  },
  {
    icon: 'lucide:calendar',
    label: 'Show my tasks',
    prompt: 'Show me all my tasks',
  },
  {
    icon: 'lucide:target',
    label: 'Complete task',
    prompt: 'Mark my last task as complete',
  },
  {
    icon: 'lucide:trending-up',
    label: 'Track progress',
    prompt: 'Show me my task statistics and completion rate',
  },
  {
    icon: 'lucide:lightbulb',
    label: 'Get tips',
    prompt: 'Give me productivity tips for better task management',
  },
  {
    icon: 'lucide:sparkles',
    label: 'AI suggestions',
    prompt: 'Analyze my tasks and suggest what I should focus on',
  },
];

export function ChatModal() {
  const {
    isOpen,
    closeChat,
    messages,
    isLoading,
    isSending,
    sendMessage,
    clearChat,
  } = useChatModal();
  const { user } = useAuth();
  const router = useRouter();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // API Key Access State
  const [canUseChat, setCanUseChat] = useState<boolean | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);

  // Voice settings state
  const [voiceMode, setVoiceMode] = useState<VoiceMode>(() => {
    // Load from localStorage if available
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

  // Check API key access when modal opens
  useEffect(() => {
    if (isOpen && canUseChat === null) {
      checkApiKeyAccess();
    }
  }, [isOpen]);

  const checkApiKeyAccess = async () => {
    setIsCheckingAccess(true);
    try {
      const result = await taskAPI.checkChatApiKeyAccess();
      setCanUseChat(result.can_use_chat);
    } catch (err) {
      // If the check fails, assume chat is available (fallback to env keys)
      setCanUseChat(true);
    } finally {
      setIsCheckingAccess(false);
    }
  };

  const goToSettings = () => {
    closeChat();
    router.push('/profile');
  };

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
  }, [voiceState]);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || isSending) return;

      setInput('');
      setError(null);

      try {
        await sendMessage(messageText);
      } catch (err: any) {
        console.error('Chat error:', err);
        setError(err.message || 'Failed to get response. Please try again.');
      }
    },
    [sendMessage, isSending]
  );

  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleClearChat = useCallback(async () => {
    setError(null);
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:justify-end p-4 md:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeChat}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal - Gold Theme */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 100 }}
            className="relative w-full md:w-96 h-[600px] md:h-[650px] rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-b from-void to-deep border border-white/10 shadow-2xl flex flex-col"
          >
            {/* Ambient glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gold/10 blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-5 border-b border-white/10 bg-surface/50 backdrop-blur-xl relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-bright flex items-center justify-center shadow-lg shadow-gold/20">
                  <Icon icon="lucide:sparkles" className="w-5 h-5 text-void" />
                </div>
                <div>
                  <h2 className="font-semibold text-text-primary text-sm md:text-base">
                    AI Task Manager
                  </h2>
                  <p className="text-xs text-text-tertiary">I can create and manage your tasks</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Voice Settings Button */}
                {isVoiceSupported && (
                  <div className="relative">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className={`p-2 rounded-lg transition-colors ${
                        showSettings
                          ? 'bg-gold/10 text-gold'
                          : 'hover:bg-white/5 text-text-tertiary hover:text-gold'
                      }`}
                      title="Voice settings"
                    >
                      <Icon icon="lucide:settings" className="w-4 h-4" />
                    </button>

                    {/* Settings Dropdown */}
                    <AnimatePresence>
                      {showSettings && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute right-0 top-full mt-2 w-64 bg-elevated border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
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

                {messages.length > 0 && (
                  <button
                    onClick={handleClearChat}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-tertiary hover:text-gold"
                    title="Clear chat"
                  >
                    <Icon icon="lucide:trash-2" className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={closeChat}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-tertiary hover:text-text-primary"
                >
                  <Icon icon="lucide:x" className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {/* API Key Access Check */}
              {isCheckingAccess ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: '300ms' }} />
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
                      onClick={goToSettings}
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
                <div className="h-full flex items-center justify-center">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gold/10 flex items-center justify-center">
                      <Icon
                        icon="lucide:sparkles"
                        className="w-8 h-8 text-gold"
                      />
                    </div>
                    <h3 className="text-lg font-serif font-medium text-text-primary">
                      Welcome, {user?.full_name || user?.username || 'there'}!
                    </h3>
                    <p className="text-sm text-text-secondary max-w-xs">
                      I can create, list, complete, and delete tasks for you. Just ask!
                    </p>
                  </div>

                  {/* Starting Prompts Grid - Gold Theme */}
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {STARTING_PROMPTS.map((prompt) => (
                      <motion.button
                        key={prompt.label}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePromptClick(prompt.prompt)}
                        disabled={isSending}
                        className="flex items-center gap-2 p-3 rounded-xl glass-card-static border border-white/5 hover:border-gold/30 transition-all text-left group disabled:opacity-50"
                      >
                        <Icon
                          icon={prompt.icon}
                          className="w-4 h-4 flex-shrink-0 text-gold group-hover:text-gold-bright transition-colors"
                        />
                        <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors">
                          {prompt.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-gold/20 to-gold-bright/20 border border-gold/30 text-text-primary rounded-br-md'
                            : 'glass-card-static border border-white/5 text-text-secondary rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        {message.created_at && (
                          <p className="text-[10px] mt-2 text-text-tertiary">
                            {formatTime(message.created_at)}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {isSending && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="flex gap-1.5 px-4 py-3 rounded-2xl glass-card-static border border-white/5 rounded-bl-md">
                        <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="px-4 py-2 bg-rose/10 border-t border-rose/20">
                <p className="text-xs text-rose">{error}</p>
              </div>
            )}

            {/* Voice Listening Indicator */}
            {voiceState === 'listening' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 py-3 bg-gold/10 border-t border-gold/20"
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-4 bg-gold rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-6 bg-gold rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-4 bg-gold rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                    <div className="w-1.5 h-5 bg-gold rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
                  </div>
                  <p className="text-xs text-gold flex-1">
                    {interimTranscript || 'Listening... Speak now'}
                  </p>
                  <button
                    onClick={stopVoiceRecognition}
                    className="text-xs text-gold hover:text-gold-bright transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            {/* Input Area - Gold Theme */}
            <div className="border-t border-white/10 bg-surface/50 backdrop-blur-xl p-4 md:p-5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voiceState === 'listening' ? interimTranscript : input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isSending && input.trim() && canUseChat !== false) {
                      handleSendMessage(input);
                    }
                  }}
                  placeholder={
                    canUseChat === false
                      ? 'Configure API keys in Settings to use chat...'
                      : voiceState === 'listening'
                      ? 'Listening...'
                      : 'Ask me to create, list, or complete tasks...'
                  }
                  className="flex-1 px-4 py-3 rounded-xl bg-elevated border border-white/10 text-text-primary placeholder-text-tertiary focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/20 transition-all text-sm disabled:opacity-50"
                  disabled={isSending || voiceState === 'listening' || canUseChat === false}
                />

                {/* Voice Command Button */}
                {isVoiceSupported && (
                  <button
                    onClick={toggleVoiceRecognition}
                    disabled={isSending || voiceState === 'processing' || canUseChat === false}
                    className={`px-4 py-3 rounded-xl transition-all ${
                      voiceState === 'listening'
                        ? 'bg-rose/20 border border-rose/50 text-rose animate-pulse'
                        : voiceState === 'error'
                        ? 'bg-rose/10 border border-rose/30 text-rose'
                        : 'bg-elevated border border-white/10 text-text-secondary hover:border-gold/50 hover:text-gold'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={voiceState === 'listening' ? 'Stop listening' : 'Start voice command'}
                  >
                    <Icon
                      icon={voiceState === 'listening' ? 'lucide:mic-off' : 'lucide:mic'}
                      className="w-4 h-4"
                    />
                  </button>
                )}

                <button
                  onClick={() => handleSendMessage(input)}
                  disabled={isSending || !input.trim() || voiceState === 'listening' || canUseChat === false}
                  className="px-4 py-3 rounded-xl btn-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Icon icon="lucide:send" className="w-4 h-4 text-void" />
                </button>
              </div>

              {/* Voice Support Hint */}
              {isVoiceSupported && messages.length === 0 && (
                <p className="text-xs text-text-tertiary mt-2 text-center">
                  <Icon icon="lucide:mic" className="w-3 h-3 inline mr-1" />
                  Tip: Click the microphone to use voice commands
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
