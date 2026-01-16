'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ProtectedAppLayout from '@/components/ProtectedAppLayout';
import { useChatModal, ChatMessage } from '@/contexts/ChatModalContext';
import { taskAPI } from '@/services/api';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleSend = useCallback(async () => {
    if (input.trim() && !isSending) {
      const messageText = input;
      setInput('');
      await sendMessage(messageText);
    }
  }, [input, isSending, sendMessage]);

  const handlePromptClick = useCallback(async (prompt: string) => {
    if (!isSending) {
      await sendMessage(prompt);
    }
  }, [isSending, sendMessage]);

  const handleClearChat = useCallback(async () => {
    setInput('');
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
      </header>

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
            <p className="text-text-secondary mb-8">I can create, list, complete, and delete tasks for you. Try it!</p>
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
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isSending && input.trim() && canUseChat !== false && handleSend()}
                placeholder={canUseChat === false ? "API key required to use chat..." : "Ask me to create, list, or complete tasks..."}
                disabled={isSending || canUseChat === false}
                className="w-full glass-card-static border border-white/10 group-focus-within:border-gold/50 rounded-xl p-4 pr-28 text-text-primary placeholder-text-tertiary focus:ring-2 focus:ring-gold/20 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg text-text-tertiary hover:text-gold hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSending}
                  aria-label="Voice input"
                >
                  <Icon icon="lucide:mic" className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!input.trim() || isSending || canUseChat === false}
                  className="p-2 rounded-lg btn-gold text-void disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  aria-label="Send message"
                >
                  <Icon icon="lucide:send" className="w-5 h-5" />
                </motion.button>
              </div>
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
