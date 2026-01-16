/**
 * Email Service
 *
 * Handles sending emails for:
 * - Email verification
 * - Password reset
 * - Welcome emails
 */

import nodemailer from "nodemailer";

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || "587", 10);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    console.warn("[EMAIL] SMTP configuration missing - emails will be logged only");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
};

// Email sending function
async function sendEmail(to: string, subject: string, html: string) {
  const transporter = createTransporter();
  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || "noreply@evolutionoftodo.com";

  // If no transporter (missing config), log the email
  if (!transporter) {
    console.log(`[EMAIL] Would send to: ${to}`);
    console.log(`[EMAIL] Subject: ${subject}`);
    console.log(`[EMAIL] Body preview: ${html.substring(0, 200)}...`);
    return { success: true, message: "Email logged (no SMTP config)" };
  }

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
    });

    console.log(`[EMAIL] Sent successfully to: ${to}, messageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL] Failed to send to ${to}:`, error);
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
