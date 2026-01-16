/**
 * Setup Better Auth tables in Neon PostgreSQL
 * Run with: node scripts/setup-better-auth.mjs
 */

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupDatabase() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log("Connecting to Neon database...");
  const sql = neon(DATABASE_URL);

  try {
    // Read the SQL file
    const sqlFile = join(__dirname, "setup-better-auth.sql");
    const sqlContent = readFileSync(sqlFile, "utf-8");

    // Split by semicolons and filter empty statements
    const statements = sqlContent
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`Executing ${statements.length} SQL statements...`);

    for (const statement of statements) {
      try {
        await sql(statement);
        console.log("✓ Executed statement successfully");
      } catch (err) {
        // Ignore "already exists" errors
        if (!err.message?.includes("already exists")) {
          console.warn(`⚠ Warning: ${err.message}`);
        }
      }
    }

    // Verify tables exist
    console.log("\nVerifying tables...");
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name IN ('user', 'session', 'account', 'verification')
    `;

    console.log("\nCreated/verified tables:");
    for (const table of tables) {
      console.log(`  - ${table.table_name}`);
    }

    if (tables.length === 4) {
      console.log("\n✅ All Better Auth tables are ready!");
    } else {
      console.log(`\n⚠ Expected 4 tables, found ${tables.length}`);
    }
  } catch (error) {
    console.error("Database setup failed:", error);
    process.exit(1);
  }
}

setupDatabase();
