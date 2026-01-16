/**
 * Fix verification table schema
 */

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config();

async function fixVerificationTable() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log("Connecting to Neon database...");
  const sql = neon(DATABASE_URL);

  try {
    // Drop existing verification table
    console.log("Dropping existing verification table...");
    await sql`DROP TABLE IF EXISTS "verification"`;

    // Create verification table with correct schema
    console.log("Creating verification table with correct schema...");
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

    // Create index
    console.log("Creating index...");
    await sql`CREATE INDEX IF NOT EXISTS idx_verification_identifier ON "verification"(identifier)`;

    // Verify table exists and has correct columns
    console.log("Verifying table structure...");
    const columns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'verification'
      AND table_schema = 'public'
    `;

    console.log("\nVerification table columns:");
    for (const col of columns) {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    }

    console.log("\n✅ Verification table fixed!");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixVerificationTable();
