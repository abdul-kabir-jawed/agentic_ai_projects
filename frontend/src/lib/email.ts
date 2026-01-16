/**
 * Email Service for Evolution of Todo
 *
 * Sends beautiful, customized emails for:
 * - Email verification
 * - Password reset
 * - Welcome emails
 */

import nodemailer from "nodemailer";

// Email configuration from environment
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "587");
const EMAIL_USER = process.env.EMAIL_USER || "";
const EMAIL_PASS = process.env.EMAIL_PASS || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "Evolution of Todo <noreply@evolutionoftodo.com>";

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Base email template with Evolution of Todo branding
const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Evolution of Todo</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
      color: #e0e0e0;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .card {
      background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(212, 175, 55, 0.1);
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo-circle {
      display: inline-block;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #d4af37 0%, #c9a227 100%);
      border-radius: 50%;
      line-height: 60px;
      font-size: 24px;
      font-weight: bold;
      color: #0a0a0f;
    }
    .logo-text {
      display: block;
      margin-top: 10px;
      font-size: 14px;
      color: #d4af37;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    h1 {
      color: #ffffff;
      font-size: 28px;
      margin-bottom: 20px;
      text-align: center;
    }
    .highlight {
      color: #d4af37;
      font-style: italic;
    }
    p {
      color: #b0b0b0;
      margin-bottom: 20px;
      font-size: 16px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #d4af37 0%, #c9a227 100%);
      color: #0a0a0f !important;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
    }
    .button:hover {
      background: linear-gradient(135deg, #c9a227 0%, #b8941f 100%);
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent);
      margin: 30px 0;
    }
    .footer {
      text-align: center;
      color: #666;
      font-size: 12px;
      margin-top: 30px;
    }
    .footer a {
      color: #d4af37;
      text-decoration: none;
    }
    .code-box {
      background: rgba(212, 175, 55, 0.1);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 8px;
      padding: 15px;
      text-align: center;
      font-family: monospace;
      font-size: 24px;
      letter-spacing: 4px;
      color: #d4af37;
      margin: 20px 0;
    }
    .warning {
      background: rgba(255, 107, 107, 0.1);
      border-left: 3px solid #ff6b6b;
      padding: 15px;
      border-radius: 0 8px 8px 0;
      margin: 20px 0;
      font-size: 14px;
      color: #ff9999;
    }
    .features {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin: 20px 0;
      flex-wrap: wrap;
    }
    .feature {
      text-align: center;
      color: #888;
      font-size: 12px;
    }
    .feature-icon {
      color: #d4af37;
      font-size: 18px;
      margin-bottom: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <span class="logo-circle">ET</span>
        <span class="logo-text">Evolution of Todo</span>
      </div>
      ${content}
      <div class="divider"></div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Evolution of Todo. All rights reserved.</p>
        <p>Orchestrate your life with clarity and purpose.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Email verification template
export const verificationEmailTemplate = (userName: string, verificationUrl: string) => baseTemplate(`
  <h1>Verify Your <span class="highlight">Email</span></h1>
  <p>Hello ${userName || "there"},</p>
  <p>Welcome to Evolution of Todo! To complete your registration and start organizing your life with clarity, please verify your email address.</p>

  <div class="button-container">
    <a href="${verificationUrl}" class="button">✓ Verify Email Address</a>
  </div>

  <p style="font-size: 14px; color: #888;">Or copy and paste this link into your browser:</p>
  <p style="font-size: 12px; word-break: break-all; color: #d4af37;">${verificationUrl}</p>

  <div class="warning">
    ⏰ This verification link will expire in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.
  </div>

  <div class="features">
    <div class="feature">
      <div class="feature-icon">🔒</div>
      <div>Secure</div>
    </div>
    <div class="feature">
      <div class="feature-icon">∞</div>
      <div>Unlimited</div>
    </div>
    <div class="feature">
      <div class="feature-icon">⚡</div>
      <div>Fast</div>
    </div>
  </div>
`);

// Password reset template
export const passwordResetTemplate = (userName: string, resetUrl: string) => baseTemplate(`
  <h1>Reset Your <span class="highlight">Password</span></h1>
  <p>Hello ${userName || "there"},</p>
  <p>We received a request to reset your password for your Evolution of Todo account. Click the button below to create a new password.</p>

  <div class="button-container">
    <a href="${resetUrl}" class="button">🔐 Reset Password</a>
  </div>

  <p style="font-size: 14px; color: #888;">Or copy and paste this link into your browser:</p>
  <p style="font-size: 12px; word-break: break-all; color: #d4af37;">${resetUrl}</p>

  <div class="warning">
    ⏰ This password reset link will expire in <strong>1 hour</strong>. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
  </div>

  <p style="text-align: center; color: #666; font-size: 14px; margin-top: 20px;">
    For security reasons, never share this link with anyone.
  </p>
`);

// Welcome email template
export const welcomeEmailTemplate = (userName: string) => baseTemplate(`
  <h1>Welcome to <span class="highlight">Evolution of Todo</span></h1>
  <p>Hello ${userName || "there"},</p>
  <p>Your account has been successfully created! You're now ready to transform chaos into order and orchestrate your life with clarity and purpose.</p>

  <div class="button-container">
    <a href="${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}" class="button">🚀 Get Started</a>
  </div>

  <h2 style="color: #fff; font-size: 18px; margin: 30px 0 15px;">What you can do:</h2>
  <ul style="color: #b0b0b0; padding-left: 20px;">
    <li style="margin-bottom: 10px;">📝 Create and organize tasks effortlessly</li>
    <li style="margin-bottom: 10px;">🎯 Set priorities and due dates</li>
    <li style="margin-bottom: 10px;">📊 Track your daily progress</li>
    <li style="margin-bottom: 10px;">🏷️ Use tags to categorize your work</li>
    <li style="margin-bottom: 10px;">💬 Chat with AI assistant for help</li>
  </ul>

  <div class="features">
    <div class="feature">
      <div class="feature-icon">🔒</div>
      <div>Secure</div>
    </div>
    <div class="feature">
      <div class="feature-icon">∞</div>
      <div>Unlimited</div>
    </div>
    <div class="feature">
      <div class="feature-icon">⚡</div>
      <div>Fast</div>
    </div>
  </div>
`);

// Send email function
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  // Check if email is configured
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.log("[EMAIL] Email not configured - logging email instead:");
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Content: [HTML Email]`);
    return { success: true, message: "Email logged (not sent - configure EMAIL_USER and EMAIL_PASS)" };
  }

  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log(`[EMAIL] Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[EMAIL] Failed to send email:", error);
    throw error;
  }
}

// Convenience functions
export async function sendVerificationEmail(email: string, name: string, verificationUrl: string) {
  return sendEmail({
    to: email,
    subject: "✓ Verify your email - Evolution of Todo",
    html: verificationEmailTemplate(name, verificationUrl),
  });
}

export async function sendPasswordResetEmail(email: string, name: string, resetUrl: string) {
  return sendEmail({
    to: email,
    subject: "🔐 Reset your password - Evolution of Todo",
    html: passwordResetTemplate(name, resetUrl),
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: "🚀 Welcome to Evolution of Todo!",
    html: welcomeEmailTemplate(name),
  });
}
