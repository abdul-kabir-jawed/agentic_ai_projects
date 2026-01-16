'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use local backend API by default
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
const API_BASE_PATH = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/v1';
const API_URL = `${API_BASE}${API_BASE_PATH}`;
const USE_LOCAL_AUTH = process.env.NEXT_PUBLIC_USE_LOCAL_AUTH !== 'false'; // Default to true

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync session from Better Auth or local storage
  const syncSession = useCallback(async () => {
    if (USE_LOCAL_AUTH) {
      // For local auth, check localStorage
      const savedToken = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
      setIsLoading(false);
      return;
    }

    try {
      // Dynamically import authClient only when using Neon Auth
      const { authClient } = await import('@/lib/auth');
      if (!authClient) {
        setIsLoading(false);
        return;
      }

      const session = await authClient.getSession();
      if (session?.data?.user) {
        const sessionUser = session.data.user;
        const userData: User = {
          id: sessionUser.id,
          email: sessionUser.email,
          username: sessionUser.name || sessionUser.email.split('@')[0],
          full_name: sessionUser.name,
          is_active: true,
          created_at: sessionUser.createdAt?.toString() || new Date().toISOString(),
          updated_at: sessionUser.updatedAt?.toString() || new Date().toISOString(),
        };
        setUser(userData);
        // Better Auth manages tokens internally, but we can store a reference
        setToken(session.data.session?.token || 'authenticated');
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error('Failed to sync session:', error);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    syncSession();
  }, [syncSession]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (USE_LOCAL_AUTH) {
        // Local backend login
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email, password }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Login failed' }));
          throw new Error(error.message || error.detail || error.error || 'Invalid email or password');
        }

        const data = await response.json();
        const accessToken = data.access_token || data.token || data.jwt;
        const userData: User = {
          id: data.user?.id || data.id || email,
          email: data.user?.email || data.email || email,
          username: data.user?.username || data.username || email.split('@')[0],
          full_name: data.user?.full_name || data.user?.name || data.name,
          is_active: true,
          created_at: data.user?.created_at || new Date().toISOString(),
          updated_at: data.user?.updated_at || new Date().toISOString(),
        };

        setToken(accessToken);
        setUser(userData);
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        // Better Auth login - dynamically import
        const { authClient } = await import('@/lib/auth');
        if (!authClient) {
          throw new Error('Auth client not initialized');
        }

        const result = await authClient.signIn.email({
          email,
          password,
        });

        if (result.error) {
          throw new Error(result.error.message || 'Invalid email or password');
        }

        // Sync session after successful login
        await syncSession();
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, username: string, password: string, fullName?: string) => {
    setIsLoading(true);
    try {
      if (USE_LOCAL_AUTH) {
        // Local backend registration
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            name: fullName || username,
            username,
            full_name: fullName,
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Registration failed' }));
          throw new Error(error.message || error.detail || error.error || 'Registration failed');
        }
      } else {
        // Better Auth registration - dynamically import
        const { authClient } = await import('@/lib/auth');
        if (!authClient) {
          throw new Error('Auth client not initialized');
        }

        const result = await authClient.signUp.email({
          email,
          password,
          name: fullName || username,
        });

        if (result.error) {
          throw new Error(result.error.message || 'Registration failed');
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (USE_LOCAL_AUTH) {
        if (token) {
          await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          }).catch(() => {
            // Ignore errors - continue with local logout
          });
        }
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } else {
        // Better Auth logout - dynamically import
        const { authClient } = await import('@/lib/auth');
        if (authClient) {
          await authClient.signOut();
        }
      }
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
