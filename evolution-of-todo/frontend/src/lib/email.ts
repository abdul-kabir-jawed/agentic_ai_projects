/**
 * Email Service
 *
 * Handles sending emails for:
 * - Email verification
 * - Password reset
 * - Welcome emails
 */

// Email sending function (logs in development, sends in production)
async function sendEmail(to: string, subject: string, html: string) {
  // In development, just log the email
  if (process.env.NODE_ENV === "development" || !process.env.SMTP_HOST) {
    console.log(`[EMAIL] Would send to: ${to}`);
    console.log(`[EMAIL] Subject: ${subject}`);
    console.log(`[EMAIL] Body preview: ${html.substring(0, 200)}...`);
    return { success: true, message: "Email logged (development mode)" };
  }

  // In production, use your email service
  // Example with nodemailer or any email API
  try {
    // TODO: Implement actual email sending
    console.log(`[EMAIL] Sending to: ${to}, Subject: ${subject}`);
    return { success: true };
  } catch (error) {
    console.error(`[EMAIL] Failed to send:`, error);
    throw error;
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationUrl: string
) {
  const subject = "Verify your email - Evolution of Todo";
  const html = `
    <h1>Welcome${name ? `, ${name}` : ""}!</h1>
    <p>Please verify your email address by clicking the link below:</p>
    <p><a href="${verificationUrl}">Verify Email</a></p>
    <p>Or copy this URL: ${verificationUrl}</p>
    <p>This link expires in 24 hours.</p>
  `;

  return sendEmail(email, subject, html);
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
) {
  const subject = "Reset your password - Evolution of Todo";
  const html = `
    <h1>Password Reset</h1>
    <p>Hi${name ? ` ${name}` : ""},</p>
    <p>You requested to reset your password. Click the link below:</p>
    <p><a href="${resetUrl}">Reset Password</a></p>
    <p>Or copy this URL: ${resetUrl}</p>
    <p>This link expires in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  return sendEmail(email, subject, html);
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(email: string, name: string) {
  const subject = "Welcome to Evolution of Todo!";
  const html = `
    <h1>Welcome${name ? `, ${name}` : ""}!</h1>
    <p>Thank you for joining Evolution of Todo.</p>
    <p>Start organizing your tasks and boost your productivity!</p>
  `;

  return sendEmail(email, subject, html);
}
