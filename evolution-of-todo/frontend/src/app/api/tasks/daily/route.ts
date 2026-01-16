import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";
import { requireAuth } from "@/lib/auth-middleware";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

/**
 * GET /api/tasks/daily
 * Get all daily tasks for the current user
 * Daily tasks are recurring tasks that appear every day
 */
export async function GET(request: NextRequest) {
  try {
    const sessionData = await requireAuth(request);
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = sessionData.user.id;

    // Fetch all daily tasks for this user
    const dailyTasks = await db
      .select()
      .from(schema.task)
      .where(and(eq(schema.task.userId, userId), eq(schema.task.isDaily, true)));

    return NextResponse.json({
      data: dailyTasks,
      count: dailyTasks.length,
    });
  } catch (error) {
    console.error("Error fetching daily tasks:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
