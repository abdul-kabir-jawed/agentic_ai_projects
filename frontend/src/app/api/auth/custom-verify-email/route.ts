/**
 * Custom Email Verification Endpoint
 *
 * Verifies email tokens we created and updates user's emailVerified status
 * This bypasses Better Auth's verification system
 */

import { NextRequest, NextResponse } from "next/server";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Configure Neon for Node.js environment
neonConfig.webSocketConstructor = ws;
neonConfig.pipelineConnect = false;

// Database connection
const DATABASE_URL = process.env.DATABASE_URL;

export async function GET(request: NextRequest) {
  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

  if (!DATABASE_URL) {
    return NextResponse.redirect(`${baseUrl}/verify-email?error=server_error`);
  }

  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    console.log(`[CUSTOM-VERIFY] Verifying token for email: ${email}`);

    if (!token || !email) {
      console.log("[CUSTOM-VERIFY] Missing token or email");
      return NextResponse.redirect(`${baseUrl}/verify-email?error=missing_params`);
    }

    // Look up the verification token (Better Auth uses public schema with "token" column)
    const tokenResult = await pool.query(
      'SELECT * FROM "verification" WHERE identifier = $1 AND token = $2',
      [email, token]
    );

    if (tokenResult.rows.length === 0) {
      console.log("[CUSTOM-VERIFY] Token not found");
      return NextResponse.redirect(`${baseUrl}/verify-email?error=invalid_token`);
    }

    const verification = tokenResult.rows[0];

    // Check if token is expired (column is "expiresAt" in public schema)
    if (new Date(verification.expiresAt) < new Date()) {
      console.log("[CUSTOM-VERIFY] Token expired");
      // Delete expired token
      await pool.query(
        'DELETE FROM "verification" WHERE identifier = $1',
        [email]
      );
      return NextResponse.redirect(`${baseUrl}/verify-email?error=token_expired`);
    }

    // Update user's emailVerified status (Better Auth uses public schema)
    const updateResult = await pool.query(
      'UPDATE "user" SET "emailVerified" = true, "updatedAt" = NOW() WHERE email = $1 RETURNING id',
      [email]
    );

    if (updateResult.rows.length === 0) {
      console.log("[CUSTOM-VERIFY] User not found");
      return NextResponse.redirect(`${baseUrl}/verify-email?error=user_not_found`);
    }

    // Delete the used verification token
    await pool.query(
      'DELETE FROM "verification" WHERE identifier = $1',
      [email]
    );

    console.log(`[CUSTOM-VERIFY] Email verified successfully for: ${email}`);

    // Redirect to success page
    return NextResponse.redirect(`${baseUrl}/verify-email?verified=true`);
  } catch (error: any) {
    console.error("[CUSTOM-VERIFY] Error:", error);
    return NextResponse.redirect(`${baseUrl}/verify-email?error=server_error`);
  } finally {
    await pool.end();
  }
}
