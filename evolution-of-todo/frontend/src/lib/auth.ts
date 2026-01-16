/**
 * Better Auth Server Configuration
 *
 * This file configures Better Auth to work with Neon Auth (neon_auth schema).
 * It handles:
 * - User registration (sign-up)
 * - User login (sign-in)
 * - Password reset (forgot password)
 * - Email verification
 * - Session management
 */

import { betterAuth } from "better-auth";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { sendVerificationEmail, sendPasswordResetEmail } from "./email";

// Configure Neon for Node.js environment
neonConfig.webSocketConstructor = ws;
neonConfig.pipelineConnect = false;

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn("[AUTH] DATABASE_URL not set - auth features will not work properly");
}

// Create PostgreSQL pool with Neon serverless connection
const pool = DATABASE_URL ? new Pool({
  connectionString: DATABASE_URL,
}) : null;

/**
 * Better Auth instance configured for Neon Auth (neon_auth schema)
 * Column mappings match the neon_auth schema structure
 */
export const auth = betterAuth({
  // Database configuration - use Neon PostgreSQL with neon_auth schema
  database: pool as any,

  // Use neon_auth schema for all tables
  user: {
    modelName: "neon_auth.user",
    fields: {
      id: "id",
      name: "name",
      email: "email",
      emailVerified: "emailVerified",
      image: "image",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
    },
  },

  session: {
    modelName: "neon_auth.session",
    fields: {
      id: "id",
      userId: "user_id",
      token: "token",
      expiresAt: "expires_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session daily
  },

  account: {
    modelName: "neon_auth.account",
    fields: {
      id: "id",
      userId: "user_id",
      accountId: "account_id",
      providerId: "provider_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      scope: "scope",
      idToken: "id_token",
      password: "password",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  },

  verification: {
    modelName: "neon_auth.verification",
    fields: {
      id: "id",
      identifier: "identifier",
      value: "value",
      expiresAt: "expires_at",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  },

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: false, // Disable for simpler deployment
    sendVerificationEmail: async ({ user, url, token }) => {
      console.log(`[AUTH] Verification email for: ${user.email}`);
      try {
        await sendVerificationEmail(user.email, user.name || "", url);
      } catch (error) {
        console.error(`[AUTH] Failed to send verification email:`, error);
      }
    },
    sendResetPassword: async ({ user, url, token }) => {
      console.log(`[AUTH] Password reset email for: ${user.email}`);
      try {
        await sendPasswordResetEmail(user.email, user.name || "", url);
      } catch (error) {
        console.error(`[AUTH] Failed to send password reset email:`, error);
        throw error;
      }
    },
    resetPasswordTokenExpiresIn: 60 * 60, // 1 hour
  },

  // Secret for encrypting sessions
  secret: process.env.BETTER_AUTH_SECRET || "development-secret-change-in-production",

  // Base URL for auth callbacks
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  // Base path for auth API routes
  basePath: "/api/auth",

  // Trusted origins for CORS
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3005",
    "http://127.0.0.1:3000",
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
  ],
});

// Export type for TypeScript
export type Auth = typeof auth;

// Export session type for client usage
export type Session = {
  user: {
    id: string;
    email: string;
    name?: string;
    image?: string;
    emailVerified?: boolean;
  };
  session: {
    id: string;
    token: string;
    expiresAt: Date;
  };
};
