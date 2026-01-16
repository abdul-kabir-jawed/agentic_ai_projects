/**
 * Better Auth Middleware
 *
 * This file provides authentication middleware for Next.js API routes.
 * It verifies the user's session and extracts user information.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Require authentication for API routes
 * Returns an object with user property to match expected structure
 */
export async function requireAuth(request: NextRequest): Promise<{ user: AuthUser }> {
  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name ?? undefined,
        image: session.user.image ?? undefined,
        createdAt: session.user.createdAt,
        updatedAt: session.user.updatedAt,
      },
    };
  } catch (error) {
    throw new Error("Unauthorized");
  }
}

/**
 * Optional authentication - returns user if authenticated, null otherwise
 */
export async function getOptionalAuth(request: NextRequest): Promise<{ user: AuthUser } | null> {
  try {
    return await requireAuth(request);
  } catch {
    return null;
  }
}
