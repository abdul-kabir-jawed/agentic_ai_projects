/**
 * API Route for sending/resending verification email
 *
 * Creates a verification token and sends email directly
 * Uses our custom verification flow (not Better Auth's)
 */

import { NextRequest, NextResponse } from "next/server";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/brevo";

// Configure Neon for Node.js environment
neonConfig.webSocketConstructor = ws;
neonConfig.pipelineConnect = false;

// Database connection
const DATABASE_URL = process.env.DATABASE_URL;

export async function POST(request: NextRequest) {
  if (!DATABASE_URL) {
    return NextResponse.json(
      { message: "Database not configured" },
      { status: 500 }
    );
  }

  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    console.log(`[VERIFY-EMAIL] Sending verification email to: ${email}`);

    // Find the user by email
    const userResult = await pool.query(
      'SELECT id, name, "emailVerified" FROM neon_auth."user" WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { message: "No account found with this email" },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email is already verified" },
        { status: 400 }
      );
    }

    // Generate a verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Delete any existing verification tokens for this email
    await pool.query(
      'DELETE FROM neon_auth.verification WHERE identifier = $1',
      [email]
    );

    // Insert new verification token
    await pool.query(
      'INSERT INTO neon_auth.verification (id, identifier, value, expires_at, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())',
      [crypto.randomUUID(), email, token, expiresAt]
    );

    // Build the verification URL - points to our custom verify endpoint
    const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
    const verificationUrl = `${baseUrl}/api/auth/custom-verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    // Send the verification email
    await sendVerificationEmail(email, user.name || "", verificationUrl);

    console.log(`[VERIFY-EMAIL] Verification email sent to ${email}`);

    return NextResponse.json(
      { message: "Verification email sent successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[VERIFY-EMAIL] Error:", error);

    return NextResponse.json(
      { message: error.message || "Failed to send verification email" },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
