'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authClient } from '@/lib/auth-client';

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  image?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync session from Better Auth
  const syncSession = useCallback(async () => {
    try {
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
          image: sessionUser.image ?? undefined,
        };
        setUser(userData);
        // Use Better Auth session token for API calls
        const sessionToken = session.data.session?.token || '';
        setToken(sessionToken);
        // Store Better Auth session token for API requests
        if (typeof window !== 'undefined' && sessionToken) {
          localStorage.setItem('authToken', sessionToken);
          console.log('[AUTH] Better Auth session token stored');
        }
      } else {
        setUser(null);
        setToken(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
        }
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
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Invalid email or password');
      }

      // Sync session to get Better Auth token for API calls
      await syncSession();
      console.log('[AUTH] Login successful via Better Auth');
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
      const result = await authClient.signUp.email({
        email,
        password,
        name: fullName || username,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Registration failed');
      }

      console.log('[AUTH] Registration successful via Better Auth');

      // Sign out immediately after registration to prevent auto-login
      // User must verify email and login manually
      try {
        await authClient.signOut();
        setUser(null);
        setToken(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
        }
        console.log('[AUTH] Signed out after registration - user must login manually');
      } catch (signOutError) {
        console.log('[AUTH] Sign out after registration failed (may already be signed out)');
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
      await authClient.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setToken(null);
      // Clear backend token from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (result?.error) {
        throw new Error(result.error.message || 'Failed to send reset email');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to request password reset');
    }
  };

  const resetPassword = async (resetToken: string, newPassword: string) => {
    try {
      const result = await authClient.resetPassword({
        newPassword,
        token: resetToken,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Failed to reset password');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to reset password');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        requestPasswordReset,
        resetPassword,
      }}
    >
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
