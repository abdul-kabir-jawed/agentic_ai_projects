/**
 * Better Auth Client Configuration
 *
 * This file configures the Better Auth client for use in React components.
 * It provides authentication methods for the frontend.
 */

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000",
  basePath: "/api/auth",
});
