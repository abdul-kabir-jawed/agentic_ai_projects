/**
 * Better Auth API Route Handler
 *
 * This route handles all authentication requests using Better Auth:
 * - POST /api/auth/sign-up (register)
 * - POST /api/auth/sign-in/email (login)
 * - POST /api/auth/sign-out (logout)
 * - GET /api/auth/session (get current session)
 * - POST /api/auth/forget-password (request password reset)
 * - POST /api/auth/reset-password (reset password with token)
 */

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Export Better Auth handlers for all HTTP methods
export const { GET, POST } = toNextJsHandler(auth);

// Also export PUT and DELETE for completeness
export const PUT = POST;
export const DELETE = POST;
