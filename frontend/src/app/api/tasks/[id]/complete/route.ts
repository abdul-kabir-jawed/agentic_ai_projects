import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { requireAuth } from "@/lib/auth-middleware";

/**
 * PATCH /api/tasks/:id/complete
 * Toggle task completion status
 */
export async function PATCH(
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

    // Get current task to toggle completion
    const [task] = await getDb()
      .select()
      .from(schema.task)
      .where(and(eq(schema.task.id, taskId), eq(schema.task.userId, userId)));

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Toggle completion status
    const [updatedTask] = await getDb()
      .update(schema.task)
      .set({
        isCompleted: !task.isCompleted,
        updatedAt: new Date(),
      })
      .where(eq(schema.task.id, taskId))
      .returning();

    return NextResponse.json({ data: updatedTask });
  } catch (error) {
    console.error("Error toggling task completion:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
