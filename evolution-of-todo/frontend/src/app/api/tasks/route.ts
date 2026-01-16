import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, ilike, desc, asc } from "drizzle-orm";
import { z } from "zod";
import * as schema from "@/db/schema";
import { requireAuth } from "@/lib/auth-middleware";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

// Validation schema for creating a task
const createTaskSchema = z.object({
  description: z.string().min(1).max(500),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  tags: z.array(z.string()).optional(),
  dueDate: z.string().datetime().optional(),
  isDaily: z.boolean().default(false),
});

// Query parameters schema for listing tasks
const listTasksSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  isCompleted: z.coerce.boolean().optional(),
  sortBy: z.enum(["createdAt", "dueDate", "priority"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * GET /api/tasks
 * List all tasks for the current user with pagination, filtering, and search
 */
export async function GET(request: NextRequest) {
  try {
    const sessionData = await requireAuth(request);
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = sessionData.user.id;

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const params = listTasksSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
      priority: searchParams.get("priority"),
      isCompleted: searchParams.get("isCompleted"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    });

    // Build where conditions
    const whereConditions = [eq(schema.task.userId, userId)];

    if (params.search) {
      whereConditions.push(ilike(schema.task.description, `%${params.search}%`));
    }

    if (params.priority) {
      whereConditions.push(eq(schema.task.priority, params.priority));
    }

    if (params.isCompleted !== undefined) {
      whereConditions.push(eq(schema.task.isCompleted, params.isCompleted));
    }

    // Build sort
    let orderBy: any = desc(schema.task.createdAt); // default
    if (params.sortBy === "dueDate") {
      orderBy = params.sortOrder === "asc" ? asc(schema.task.dueDate) : desc(schema.task.dueDate);
    } else if (params.sortBy === "priority") {
      orderBy = params.sortOrder === "asc" ? asc(schema.task.priority) : desc(schema.task.priority);
    } else if (params.sortBy === "createdAt") {
      orderBy = params.sortOrder === "asc" ? asc(schema.task.createdAt) : desc(schema.task.createdAt);
    }

    // Get total count
    const countResult = await db
      .select({ count: schema.task.id })
      .from(schema.task)
      .where(and(...whereConditions));
    const total = countResult.length;

    // Get paginated results
    const offset = (params.page - 1) * params.limit;
    const tasks = await db
      .select()
      .from(schema.task)
      .where(and(...whereConditions))
      .orderBy(orderBy)
      .limit(params.limit)
      .offset(offset);

    return NextResponse.json({
      data: tasks,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        pages: Math.ceil(total / params.limit),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/tasks
 * Create a new task
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
    const validatedData = createTaskSchema.parse(body);

    // Create task
    const [newTask] = await db
      .insert(schema.task)
      .values({
        userId,
        description: validatedData.description,
        priority: validatedData.priority,
        tags: validatedData.tags ? JSON.stringify(validatedData.tags) : null,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        isDaily: validatedData.isDaily,
        isCompleted: false,
      })
      .returning();

    return NextResponse.json({ data: newTask }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
