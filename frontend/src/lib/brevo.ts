/**
 * Brevo (formerly Sendinblue) Email Service
 *
 * This file provides email sending functionality using Brevo API.
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send verification email using Brevo
 */
export async function sendVerificationEmail(
  email: string,
  verificationToken: string,
  verificationUrl: string
): Promise<void> {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || "noreply@evolutionoftodo.com";
  const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "Evolution of Todo";

  if (!BREVO_API_KEY) {
    console.warn("BREVO_API_KEY not set, skipping email send");
    return;
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: EMAIL_FROM_NAME,
          email: EMAIL_FROM_ADDRESS,
        },
        to: [
          {
            email: email,
          },
        ],
        subject: "Verify your email address",
        htmlContent: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Verify your email</title>
            </head>
            <body>
              <h1>Verify your email address</h1>
              <p>Click the link below to verify your email address:</p>
              <p><a href="${verificationUrl}">${verificationUrl}</a></p>
              <p>Or use this token: ${verificationToken}</p>
              <p>This link will expire in 24 hours.</p>
            </body>
          </html>
        `,
        textContent: `Verify your email address by clicking this link: ${verificationUrl}\n\nOr use this token: ${verificationToken}\n\nThis link will expire in 24 hours.`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Brevo API error: ${error}`);
    }

    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw error;
  }
}

/**
 * Send password reset email using Brevo
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  resetUrl: string
): Promise<void> {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || "noreply@evolutionoftodo.com";
  const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "Evolution of Todo";

  if (!BREVO_API_KEY) {
    console.warn("BREVO_API_KEY not set, skipping email send");
    return;
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: EMAIL_FROM_NAME,
          email: EMAIL_FROM_ADDRESS,
        },
        to: [
          {
            email: email,
          },
        ],
        subject: "Reset your password",
        htmlContent: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Reset your password</title>
            </head>
            <body>
              <h1>Reset your password</h1>
              <p>Click the link below to reset your password:</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              <p>Or use this token: ${resetToken}</p>
              <p>This link will expire in 1 hour.</p>
            </body>
          </html>
        `,
        textContent: `Reset your password by clicking this link: ${resetUrl}\n\nOr use this token: ${resetToken}\n\nThis link will expire in 1 hour.`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Brevo API error: ${error}`);
    }

    console.log("Password reset email sent successfully");
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
}
