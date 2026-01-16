import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { requireAuth } from "@/lib/auth-middleware";

/**
 * GET /api/profile/stats
 * Get user's task statistics
 *
 * Returns:
 * - total tasks
 * - completed tasks
 * - pending tasks
 * - tasks by priority
 * - most productive day
 */
export async function GET(request: NextRequest) {
  try {
    const sessionData = await requireAuth(request);
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = sessionData.user.id;

    // Get all tasks for this user
    const allTasks = await getDb()
      .select()
      .from(schema.task)
      .where(eq(schema.task.userId, userId));

    // Calculate statistics
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => t.isCompleted).length;
    const pendingTasks = totalTasks - completedTasks;

    // Count by priority
    const tasksByPriority = {
      low: allTasks.filter((t) => t.priority === "low").length,
      medium: allTasks.filter((t) => t.priority === "medium").length,
      high: allTasks.filter((t) => t.priority === "high").length,
    };

    // Count completed by priority
    const completedByPriority = {
      low: allTasks.filter((t) => t.priority === "low" && t.isCompleted).length,
      medium: allTasks.filter((t) => t.priority === "medium" && t.isCompleted).length,
      high: allTasks.filter((t) => t.priority === "high" && t.isCompleted).length,
    };

    // Find most productive day (day of week with most completed tasks)
    const tasksByDay = {
      0: 0, // Sunday
      1: 0, // Monday
      2: 0, // Tuesday
      3: 0, // Wednesday
      4: 0, // Thursday
      5: 0, // Friday
      6: 0, // Saturday
    };

    allTasks.forEach((task) => {
      if (task.isCompleted && task.updatedAt) {
        const day = new Date(task.updatedAt).getDay();
        tasksByDay[day as keyof typeof tasksByDay]++;
      }
    });

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let mostProductiveDay = "No data";
    let maxTasks = 0;
    Object.entries(tasksByDay).forEach(([dayNum, count]) => {
      if (count > maxTasks) {
        maxTasks = count;
        mostProductiveDay = dayNames[parseInt(dayNum)];
      }
    });

    // Completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return NextResponse.json({
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        completionRate,
        tasksByPriority,
        completedByPriority,
        mostProductiveDay,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
