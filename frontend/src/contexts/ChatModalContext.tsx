'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

// Message type for chat
export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

interface ChatModalContextType {
  // Modal state
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;

  // Shared message state
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;

  // Actions
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => Promise<void>;
  refreshMessages: () => Promise<void>;

  // Task change notification - call this to trigger task list refresh
  taskChangeListeners: Set<() => void>;
  onTaskChange: (callback: () => void) => () => void;
}

const ChatModalContext = createContext<ChatModalContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003';
const API_BASE_PATH = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/v1';

// Keywords that indicate a task operation was performed
const TASK_OPERATION_KEYWORDS = [
  'created', 'task created', 'has been created',
  'completed', 'marked as complete', 'has been completed',
  'deleted', 'has been deleted', 'removed',
  'updated', 'has been updated', 'modified',
];

export function ChatModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [taskChangeListeners] = useState<Set<() => void>>(new Set());

  const { token, isAuthenticated } = useAuth();

  // Register a callback to be notified when tasks change
  const onTaskChange = useCallback((callback: () => void) => {
    taskChangeListeners.add(callback);
    // Return cleanup function
    return () => {
      taskChangeListeners.delete(callback);
    };
  }, [taskChangeListeners]);

  // Notify all listeners that tasks have changed
  const notifyTaskChange = useCallback(() => {
    taskChangeListeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in task change callback:', error);
      }
    });
  }, [taskChangeListeners]);

  // Check if AI response indicates a task operation was performed
  const isTaskOperation = useCallback((response: string): boolean => {
    const lowerResponse = response.toLowerCase();
    return TASK_OPERATION_KEYWORDS.some(keyword => lowerResponse.includes(keyword));
  }, []);

  // Get auth token
  const getAuthToken = useCallback(() => {
    return token;
  }, [token]);

  // Fetch chat history from backend
  const refreshMessages = useCallback(async () => {
    const token = getAuthToken();
    if (!token || !isAuthenticated) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}${API_BASE_PATH}/chat/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Transform API response to our message format
        const chatMessages: ChatMessage[] = data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          created_at: msg.created_at,
        }));
        setMessages(chatMessages);
      } else if (response.status === 401) {
        // Not authenticated, clear messages
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken, isAuthenticated]);

  // Send a message to the AI
  const sendMessage = useCallback(async (content: string) => {
    const token = getAuthToken();
    if (!token || !isAuthenticated) {
      toast.error('Please log in to use the chat');
      return;
    }

    if (!content.trim()) return;

    // Optimistically add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsSending(true);

    try {
      const response = await fetch(`${API_URL}${API_BASE_PATH}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          language: 'english',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Add assistant response
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: data.content,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Check if this was a task operation and notify listeners to refresh
        if (isTaskOperation(data.content)) {
          // Small delay to ensure database has been updated
          setTimeout(() => {
            notifyTaskChange();
          }, 500);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to send message');
      }
    } catch (error) {
      // Remove the optimistically added message on error
      setMessages(prev => prev.slice(0, -1));
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      toast.error(errorMessage);
      console.error('Chat error:', error);
    } finally {
      setIsSending(false);
    }
  }, [getAuthToken, isAuthenticated, messages, isTaskOperation, notifyTaskChange]);

  // Clear chat history
  const clearChat = useCallback(async () => {
    const token = getAuthToken();
    if (!token || !isAuthenticated) return;

    try {
      const response = await fetch(`${API_URL}${API_BASE_PATH}/chat/history`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setMessages([]);
        toast.success('Chat history cleared');
      } else {
        throw new Error('Failed to clear chat history');
      }
    } catch (error) {
      toast.error('Failed to clear chat history');
      console.error('Clear chat error:', error);
    }
  }, [getAuthToken, isAuthenticated]);

  // Load messages when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshMessages();
    } else {
      setMessages([]);
    }
  }, [isAuthenticated, refreshMessages]);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);
  const toggleChat = () => setIsOpen(prev => !prev);

  return (
    <ChatModalContext.Provider
      value={{
        isOpen,
        openChat,
        closeChat,
        toggleChat,
        messages,
        isLoading,
        isSending,
        sendMessage,
        clearChat,
        refreshMessages,
        taskChangeListeners,
        onTaskChange,
      }}
    >
      {children}
    </ChatModalContext.Provider>
  );
}

export function useChatModal() {
  const context = useContext(ChatModalContext);
  if (context === undefined) {
    throw new Error('useChatModal must be used within a ChatModalProvider');
  }
  return context;
}
