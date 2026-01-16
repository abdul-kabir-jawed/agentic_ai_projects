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
 * Returns the authenticated user or throws an error
 */
export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      createdAt: session.user.createdAt,
      updatedAt: session.user.updatedAt,
    };
  } catch (error) {
    throw new Error("Unauthorized");
  }
}

/**
 * Optional authentication - returns user if authenticated, null otherwise
 */
export async function getOptionalAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    return await requireAuth(request);
  } catch {
    return null;
  }
}
