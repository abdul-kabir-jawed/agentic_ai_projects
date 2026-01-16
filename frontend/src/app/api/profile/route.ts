import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db/client";
import { requireAuth } from "@/lib/auth-middleware";

// Validation schema for updating profile
const updateProfileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  image: z.string().url().optional(),
});

/**
 * GET /api/profile
 * Get current user's profile
 */
export async function GET(request: NextRequest) {
  try {
    const sessionData = await requireAuth(request);
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = sessionData.user.id;

    // Fetch user profile from Better Auth user table
    const [userProfile] = await getDb()
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, userId));

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        image: userProfile.image,
        emailVerified: userProfile.emailVerified,
        createdAt: userProfile.createdAt,
        updatedAt: userProfile.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/profile
 * Update current user's profile
 */
export async function PUT(request: NextRequest) {
  try {
    const sessionData = await requireAuth(request);
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = sessionData.user.id;
    const body = await request.json();

    // Validate request body
    const validatedData = updateProfileSchema.parse(body);

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name;
    }
    if (validatedData.email !== undefined) {
      updateData.email = validatedData.email;
    }
    if (validatedData.image !== undefined) {
      updateData.image = validatedData.image;
    }

    // Update user profile
    const [updatedUser] = await getDb()
      .update(schema.user)
      .set(updateData)
      .where(eq(schema.user.id, userId))
      .returning();

    return NextResponse.json({
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        emailVerified: updatedUser.emailVerified,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
