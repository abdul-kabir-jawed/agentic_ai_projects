/**
 * Verify users in neon_auth schema
 */

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config();

async function verifyUsers() {
  const DATABASE_URL = process.env.DATABASE_URL;
  const sql = neon(DATABASE_URL);

  try {
    console.log("=== Users in neon_auth.user ===");
    const users = await sql`SELECT id, name, email, "emailVerified", role, "createdAt", "updatedAt" FROM neon_auth.user`;
    console.log(`Found ${users.length} user(s):\n`);
    for (const user of users) {
      console.log(`  ID: ${user.id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Created: ${user.createdAt}`);
      console.log(`  Updated: ${user.updatedAt}`);
      console.log("");
    }

    console.log("\n=== Sessions in neon_auth.session ===");
    const sessions = await sql`SELECT id, user_id, token, expires_at FROM neon_auth.session`;
    console.log(`Found ${sessions.length} session(s)`);

    console.log("\n=== Accounts in neon_auth.account ===");
    const accounts = await sql`SELECT id, user_id, provider_id FROM neon_auth.account`;
    console.log(`Found ${accounts.length} account(s)`);

  } catch (error) {
    console.error("Error:", error.message);
  }
}

verifyUsers();
