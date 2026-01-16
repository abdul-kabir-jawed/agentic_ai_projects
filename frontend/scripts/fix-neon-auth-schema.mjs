/**
 * Fix Neon Auth schema - ensure column names match Neon Auth expectations
 */

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config();

async function fixNeonAuthSchema() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log("Connecting to Neon database...");
  const sql = neon(DATABASE_URL);

  try {
    // Check current user table columns
    console.log("\nChecking current user table structure...");
    const userColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'user'
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;

    console.log("Current user table columns:");
    for (const col of userColumns) {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    }

    // Neon Auth expects specific column names - let's recreate with correct schema
    console.log("\n\nRecreating tables with Neon Auth compatible schema...");

    // Drop existing tables in correct order (due to foreign keys)
    console.log("Dropping existing tables...");
    await sql`DROP TABLE IF EXISTS "verification" CASCADE`;
    await sql`DROP TABLE IF EXISTS "account" CASCADE`;
    await sql`DROP TABLE IF EXISTS "session" CASCADE`;
    await sql`DROP TABLE IF EXISTS "user" CASCADE`;

    // Create user table with Neon Auth compatible column names
    console.log("Creating user table...");
    await sql`
      CREATE TABLE "user" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT,
        email TEXT NOT NULL UNIQUE,
        "emailVerified" BOOLEAN DEFAULT FALSE,
        image TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create session table
    console.log("Creating session table...");
    await sql`
      CREATE TABLE "session" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create account table
    console.log("Creating account table...");
    await sql`
      CREATE TABLE "account" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        "accountId" TEXT NOT NULL,
        "providerId" TEXT NOT NULL,
        "accessToken" TEXT,
        "refreshToken" TEXT,
        "accessTokenExpiresAt" TIMESTAMP WITH TIME ZONE,
        "refreshTokenExpiresAt" TIMESTAMP WITH TIME ZONE,
        scope TEXT,
        "idToken" TEXT,
        password TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create verification table
    console.log("Creating verification table...");
    await sql`
      CREATE TABLE "verification" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        identifier TEXT NOT NULL,
        value TEXT NOT NULL,
        "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create indexes
    console.log("Creating indexes...");
    await sql`CREATE INDEX idx_session_user ON "session"("userId")`;
    await sql`CREATE INDEX idx_session_token ON "session"(token)`;
    await sql`CREATE INDEX idx_account_user ON "account"("userId")`;
    await sql`CREATE INDEX idx_verification_identifier ON "verification"(identifier)`;

    // Verify final structure
    console.log("\n\nVerifying final table structures...");

    const tables = ['user', 'session', 'account', 'verification'];
    for (const table of tables) {
      const columns = await sql`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = ${table}
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `;

      console.log(`\n${table} table:`);
      for (const col of columns) {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      }
    }

    console.log("\n\n✅ All tables recreated with Neon Auth compatible schema!");
    console.log("\nNote: You'll need to re-register users as the old data was cleared.");

  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixNeonAuthSchema();
