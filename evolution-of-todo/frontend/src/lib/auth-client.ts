/**
 * Better Auth Client Configuration
 *
 * This file provides the client-side auth functions for:
 * - Sign in / Sign up
 * - Sign out
 * - Session management
 */

import { createAuthClient } from "better-auth/react";

// Create the auth client
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});

// Export commonly used functions
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;

// Export types
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  emailVerified?: boolean;
}

export interface Session {
  user: User;
  session: {
    id: string;
    token: string;
    expiresAt: Date;
  };
}
