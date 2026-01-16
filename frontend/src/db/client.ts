/**
 * Database Client
 *
 * Provides a lazy-loaded database client that handles build-time scenarios
 * where DATABASE_URL may not be available.
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

// Lazy-loaded database client
let client: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle> | null = null;

/**
 * Get the database client
 * Throws an error if DATABASE_URL is not set (should only happen at build time)
 */
export function getDb() {
  if (db) return db;

  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  client = postgres(DATABASE_URL);
  db = drizzle(client, { schema });
  return db;
}

/**
 * Check if database is available (DATABASE_URL is set)
 */
export function isDatabaseAvailable(): boolean {
  return !!process.env.DATABASE_URL;
}

export { schema };
