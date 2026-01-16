import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { z } from "zod";
import * as schema from "@/db/schema";
import { requireAuth } from "@/lib/auth-middleware";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

// Validation schema for avatar upload
const uploadAvatarSchema = z.object({
  image: z.string().refine((val) => val.startsWith("data:image/"), {
    message: "Image must be a base64 data URL",
  }),
});

/**
 * POST /api/profile/avatar
 * Upload or update user's avatar
 *
 * Accepts base64 encoded image data
 * @example
 * {
 *   "image": "data:image/png;base64,iVBORw0KGgoAAAANSU..."
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const sessionData = await requireAuth(request);
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = sessionData.user.id;
    const body = await request.json();

    // Validate request body
    const validatedData = uploadAvatarSchema.parse(body);

    // Size validation (e.g., max 5MB for base64)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (validatedData.image.length > maxSize) {
      return NextResponse.json(
        { error: "Image too large. Maximum size is 5MB." },
        { status: 413 }
      );
    }

    // Update user's image
    const [updatedUser] = await db
      .update(schema.user)
      .set({
        image: validatedData.image,
        updatedAt: new Date(),
      })
      .where(eq(schema.user.id, userId))
      .returning();

    return NextResponse.json(
      {
        data: {
          id: updatedUser.id,
          image: updatedUser.image,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error uploading avatar:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/profile/avatar
 * Delete user's avatar
 */
export async function DELETE(request: NextRequest) {
  try {
    const sessionData = await requireAuth(request);
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = sessionData.user.id;

    // Clear user's image
    const [updatedUser] = await db
      .update(schema.user)
      .set({
        image: null,
        updatedAt: new Date(),
      })
      .where(eq(schema.user.id, userId))
      .returning();

    return NextResponse.json({
      data: {
        id: updatedUser.id,
        message: "Avatar deleted successfully",
      },
    });
  } catch (error) {
    console.error("Error deleting avatar:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
