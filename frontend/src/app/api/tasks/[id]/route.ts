import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import * as schema from "@/db/schema";
import { requireAuth } from "@/lib/auth-middleware";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

// Validation schema for updating a task
const updateTaskSchema = z.object({
  description: z.string().min(1).max(500).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  tags: z.array(z.string()).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  isDaily: z.boolean().optional(),
  isCompleted: z.boolean().optional(),
});

/**
 * GET /api/tasks/:id
 * Get a specific task
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await requireAuth(request);
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const taskId = parseInt(id, 10);
    const userId = sessionData.user.id;

    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const [task] = await db
      .select()
      .from(schema.task)
      .where(and(eq(schema.task.id, taskId), eq(schema.task.userId, userId)));

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ data: task });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/tasks/:id
 * Update a specific task
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await requireAuth(request);
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const taskId = parseInt(id, 10);
    const userId = sessionData.user.id;

    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);

    // Verify task belongs to user
    const [existingTask] = await db
      .select()
      .from(schema.task)
      .where(and(eq(schema.task.id, taskId), eq(schema.task.userId, userId)));

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Update task
    const [updatedTask] = await db
      .update(schema.task)
      .set({
        ...(validatedData.description && { description: validatedData.description }),
        ...(validatedData.priority && { priority: validatedData.priority }),
        ...(validatedData.tags && { tags: JSON.stringify(validatedData.tags) }),
        ...(validatedData.dueDate !== undefined && {
          dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        }),
        ...(validatedData.isDaily !== undefined && { isDaily: validatedData.isDaily }),
        ...(validatedData.isCompleted !== undefined && { isCompleted: validatedData.isCompleted }),
        updatedAt: new Date(),
      })
      .where(eq(schema.task.id, taskId))
      .returning();

    return NextResponse.json({ data: updatedTask });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/tasks/:id
 * Delete a specific task
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionData = await requireAuth(request);
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const taskId = parseInt(id, 10);
    const userId = sessionData.user.id;

    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    // Verify task belongs to user before deleting
    const [existingTask] = await db
      .select()
      .from(schema.task)
      .where(and(eq(schema.task.id, taskId), eq(schema.task.userId, userId)));

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Delete task
    await db.delete(schema.task).where(eq(schema.task.id, taskId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
