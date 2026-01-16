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
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { neonConfig, neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";
import ws from "ws";

// Configure Neon for Node.js environment
if (typeof window === "undefined") {
  try {
    neonConfig.webSocketConstructor = ws;
    neonConfig.pipelineConnect = false;
    neonConfig.fetchConnectionCache = true;
  } catch (error) {
    console.warn("WebSocket configuration failed, using HTTP fetch:", error);
  }
}

// Check if we're in build mode (no DATABASE_URL available)
const isBuildTime = !process.env.DATABASE_URL;

// Get database connection - returns null during build time
const getDatabase = () => {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    // Return a mock during build time to prevent errors
    console.warn("DATABASE_URL not set - using placeholder during build");
    return null as any;
  }

  const sql = neon(DATABASE_URL);
  return drizzle(sql, { schema });
};

// Create Better Auth instance
export const auth = betterAuth({
  database: isBuildTime ? (null as any) : drizzleAdapter(getDatabase(), {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true if you want email verification
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  secret: process.env.BETTER_AUTH_SECRET || "change-this-secret-in-production",
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  basePath: "/api/auth",
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ],
});
