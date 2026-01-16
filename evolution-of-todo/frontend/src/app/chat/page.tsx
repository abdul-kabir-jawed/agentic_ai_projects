'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, ListCheck, Zap, Sparkles, Rocket, Calendar, TrendingUp } from 'lucide-react';

const prompts = [
  {
    icon: <ListCheck size={18} />,
    label: 'Create a task',
    prompt: 'Help me create a new task for my project',
    color: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 hover:border-cyan-400/50',
    iconColor: 'text-cyan-400',
  },
  {
    icon: <Zap size={18} />,
    label: 'Analyze my tasks',
    prompt: 'Analyze my tasks and suggest optimizations',
    color: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 hover:border-orange-400/50',
    iconColor: 'text-orange-400',
  },
  {
    icon: <Rocket size={18} />,
    label: 'Set goals',
    prompt: 'Help me set weekly goals and break them into tasks',
    color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 hover:border-purple-400/50',
    iconColor: 'text-purple-400',
  },
  {
    icon: <Calendar size={18} />,
    label: 'Schedule today',
    prompt: 'Show me my tasks for today and help me prioritize',
    color: 'from-amber-500/20 to-amber-600/20 border-amber-500/30 hover:border-amber-400/50',
    iconColor: 'text-amber-400',
  },
  {
    icon: <TrendingUp size={18} />,
    label: 'Track progress',
    prompt: 'Show me my productivity insights and completion rate',
    color: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 hover:border-emerald-400/50',
    iconColor: 'text-emerald-400',
  },
  {
    icon: <Sparkles size={18} />,
    label: 'Get tips',
    prompt: 'Give me productivity tips for better task management',
    color: 'from-pink-500/20 to-pink-600/20 border-pink-500/30 hover:border-pink-400/50',
    iconColor: 'text-pink-400',
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI-powered task assistant. How can I help you today?",
      from: 'assistant',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = { id: Date.now(), text: input, from: 'user' };
      setMessages([...messages, userMessage]);
      setInput('');
      setIsLoading(true);

      // Simulate AI response delay
      setTimeout(() => {
        const assistantMessage = {
          id: Date.now() + 1,
          text: "I understand. I'm processing your request and will provide insights soon.",
          from: 'assistant',
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100 min-h-screen flex flex-col">
      {/* Header with glassmorphism */}
      <header className="relative bg-slate-950/40 backdrop-blur-xl border-b border-cyan-500/10 p-6 flex items-center gap-4 shadow-lg shadow-cyan-500/5">
        <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 via-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/50">
          <Sparkles size={24} className="text-white drop-shadow-md" />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            AI Assistant
          </h1>
          <p className="text-sm text-slate-400 font-medium">Your AI-powered productivity companion</p>
        </div>
      </header>

      {/* Messages container */}
      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 1 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center pt-12"
          >
            <h2 className="text-3xl font-bold text-slate-200 mb-2">Welcome to Evolution of Todo</h2>
            <p className="text-slate-400 mb-8">Choose a prompt below or ask me anything about your tasks</p>
          </motion.div>
        )}

        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex gap-4 ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.from === 'assistant' && (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex-shrink-0 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Sparkles size={20} className="text-white drop-shadow-md" />
              </div>
            )}
            <div
              className={`max-w-lg rounded-2xl px-5 py-4 ${
                message.from === 'user'
                  ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-br-none text-slate-100'
                  : 'bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-bl-none text-slate-200'
              }`}
            >
              <p className="leading-relaxed">{message.text}</p>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex gap-4 justify-start"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex-shrink-0 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Sparkles size={20} className="text-white drop-shadow-md animate-spin" />
            </div>
            <div className="max-w-lg rounded-2xl px-5 py-4 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-bl-none">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Input area with prompts */}
      <footer className="relative bg-slate-950/40 backdrop-blur-xl border-t border-slate-700/50 p-6 shadow-lg shadow-slate-950/50">
        <div className="max-w-4xl mx-auto">
          {/* Quick prompts grid */}
          {messages.length <= 1 && (
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {prompts.map((p) => (
                <motion.button
                  key={p.label}
                  whileHover={{ scale: 1.02, translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePromptClick(p.prompt)}
                  className={`flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r ${p.color} border transition-all duration-300`}
                >
                  <span className={p.iconColor}>{p.icon}</span>
                  <span className="text-sm font-medium text-slate-300 text-left">{p.label}</span>
                </motion.button>
              ))}
            </div>
          )}

          {/* Input field with enhanced styling */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 group-focus-within:from-cyan-500/10 group-focus-within:via-cyan-500/5 group-focus-within:to-cyan-500/0 rounded-xl transition-all duration-300 blur" />
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything about your tasks..."
                disabled={isLoading}
                className="w-full bg-slate-800/50 border border-slate-700/80 group-focus-within:border-cyan-500/50 rounded-xl p-4 pr-28 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-700/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                  aria-label="Voice input"
                >
                  <Mic size={20} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50"
                  aria-label="Send message"
                >
                  <Send size={20} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
