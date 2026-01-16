/**
 * Auth Middleware for API Routes
 *
 * Provides authentication helpers for Next.js API routes
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

/**
 * Require authentication for an API route
 * Returns the user if authenticated, or throws an error
 */
export async function requireAuth(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return null;
    }

    return session.user;
  } catch (error) {
    console.error("[AUTH MIDDLEWARE] Error getting session:", error);
    return null;
  }
}

/**
 * Get current user from request (optional auth)
 * Returns null if not authenticated
 */
export async function getCurrentUser(request: NextRequest) {
  return requireAuth(request);
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}
