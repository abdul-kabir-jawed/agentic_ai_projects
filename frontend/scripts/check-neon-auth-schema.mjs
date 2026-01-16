/**
 * Check Neon Auth schema and tables
 */

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config();

async function checkNeonAuthSchema() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log("Connecting to Neon database...");
  const sql = neon(DATABASE_URL);

  try {
    // List all schemas
    console.log("\n=== All Schemas ===");
    const schemas = await sql`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schema_name
    `;
    for (const schema of schemas) {
      console.log(`  - ${schema.schema_name}`);
    }

    // Check if neon_auth schema exists
    console.log("\n=== Checking neon_auth schema ===");
    const neonAuthTables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'neon_auth'
      ORDER BY table_name
    `;

    if (neonAuthTables.length > 0) {
      console.log("Tables in neon_auth schema:");
      for (const table of neonAuthTables) {
        console.log(`\n  Table: neon_auth.${table.table_name}`);

        // Get columns for each table
        const columns = await sql`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_schema = 'neon_auth' AND table_name = ${table.table_name}
          ORDER BY ordinal_position
        `;
        for (const col of columns) {
          console.log(`    - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
        }
      }
    } else {
      console.log("No tables found in neon_auth schema");
    }

    // Check public schema tables
    console.log("\n=== Tables in public schema ===");
    const publicTables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    for (const table of publicTables) {
      console.log(`\n  Table: public.${table.table_name}`);

      const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = ${table.table_name}
        ORDER BY ordinal_position
      `;
      for (const col of columns) {
        console.log(`    - ${col.column_name}: ${col.data_type}`);
      }
    }

    // Try to get users from neon_auth if exists
    console.log("\n=== Trying to fetch users from neon_auth.users ===");
    try {
      const users = await sql`SELECT * FROM neon_auth.users LIMIT 5`;
      console.log(`Found ${users.length} users in neon_auth.users`);
      if (users.length > 0) {
        console.log("Sample user columns:", Object.keys(users[0]));
      }
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }

    // Try neon_auth.user (singular)
    console.log("\n=== Trying to fetch users from neon_auth.user ===");
    try {
      const users = await sql`SELECT * FROM neon_auth.user LIMIT 5`;
      console.log(`Found ${users.length} users in neon_auth.user`);
      if (users.length > 0) {
        console.log("Sample user columns:", Object.keys(users[0]));
      }
    } catch (e) {
      console.log(`Error: ${e.message}`);
    }

  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkNeonAuthSchema();
