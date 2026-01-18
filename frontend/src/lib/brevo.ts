/**
 * Brevo (formerly Sendinblue) Email Service
 *
 * This file provides email sending functionality using Brevo API
 * with beautiful, branded email templates.
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// ============ EMAIL TEMPLATES ============

/**
 * Base email template with branding
 * Customize: colors, logo, footer text
 */
const baseTemplate = (content: string, appName: string = "Evolution of Todo") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
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
    .warning {
      background: rgba(255, 107, 107, 0.1);
      border-left: 3px solid #ff6b6b;
      padding: 15px;
      border-radius: 0 8px 8px 0;
      margin: 20px 0;
      font-size: 14px;
      color: #ff9999;
    }
    .info {
      background: rgba(212, 175, 55, 0.1);
      border-left: 3px solid #d4af37;
      padding: 15px;
      border-radius: 0 8px 8px 0;
      margin: 20px 0;
      font-size: 14px;
      color: #d4af37;
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
    .link-text {
      font-size: 12px;
      word-break: break-all;
      color: #d4af37;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <span class="logo-circle">ET</span>
        <span class="logo-text">${appName}</span>
      </div>
      ${content}
      <div class="divider"></div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
        <p>Orchestrate your life with clarity and purpose.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

/**
 * Email verification template
 */
const verificationEmailTemplate = (userName: string, verificationUrl: string) => baseTemplate(`
  <h1>Verify Your <span class="highlight">Email</span></h1>
  <p>Hello ${userName || "there"},</p>
  <p>Welcome to Evolution of Todo! To complete your registration and start organizing your life with clarity, please verify your email address.</p>

  <div class="button-container">
    <a href="${verificationUrl}" class="button">✓ Verify Email Address</a>
  </div>

  <p style="font-size: 14px; color: #888;">Or copy and paste this link into your browser:</p>
  <p class="link-text">${verificationUrl}</p>

  <div class="warning">
    ⏰ This verification link will expire in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.
  </div>

  <div class="features">
    <div class="feature">
      <div class="feature-icon">🔒</div>
      <div>Secure</div>
    </div>
    <div class="feature">
      <div class="feature-icon">✓</div>
      <div>Unlimited Tasks</div>
    </div>
    <div class="feature">
      <div class="feature-icon">⚡</div>
      <div>AI Powered</div>
    </div>
  </div>
`);

/**
 * Password reset template
 */
const passwordResetTemplate = (userName: string, resetUrl: string) => baseTemplate(`
  <h1>Reset Your <span class="highlight">Password</span></h1>
  <p>Hello ${userName || "there"},</p>
  <p>We received a request to reset your password for your Evolution of Todo account. Click the button below to create a new password.</p>

  <div class="button-container">
    <a href="${resetUrl}" class="button">🔐 Reset Password</a>
  </div>

  <p style="font-size: 14px; color: #888;">Or copy and paste this link into your browser:</p>
  <p class="link-text">${resetUrl}</p>

  <div class="warning">
    ⏰ This password reset link will expire in <strong>1 hour</strong>. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
  </div>

  <p style="text-align: center; color: #666; font-size: 14px; margin-top: 20px;">
    For security reasons, never share this link with anyone.
  </p>
`);

/**
 * Welcome email template
 */
const welcomeEmailTemplate = (userName: string, loginUrl: string) => baseTemplate(`
  <h1>Welcome to <span class="highlight">Evolution of Todo</span></h1>
  <p>Hello ${userName || "there"},</p>
  <p>Your account has been successfully created! You're now ready to transform chaos into order and orchestrate your life with clarity and purpose.</p>

  <div class="button-container">
    <a href="${loginUrl}" class="button">🚀 Get Started</a>
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

// ============ EMAIL SENDING FUNCTIONS ============

/**
 * Send verification email using Brevo
 */
export async function sendVerificationEmail(
  email: string,
  userName: string,
  verificationUrl: string
): Promise<void> {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || "noreply@evolutionoftodo.com";
  const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "Evolution of Todo";

  if (!BREVO_API_KEY) {
    console.warn("[BREVO] API key not set, logging email instead");
    console.log(`[BREVO] Verification email for ${email}: ${verificationUrl}`);
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
        to: [{ email }],
        subject: "✓ Verify your email - Evolution of Todo",
        htmlContent: verificationEmailTemplate(userName, verificationUrl),
        textContent: `Verify your email address by clicking this link: ${verificationUrl}\n\nThis link will expire in 24 hours.`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Brevo API error: ${error}`);
    }

    console.log(`[BREVO] Verification email sent to ${email}`);
  } catch (error) {
    console.error("[BREVO] Failed to send verification email:", error);
    throw error;
  }
}

/**
 * Send password reset email using Brevo
 */
export async function sendPasswordResetEmail(
  email: string,
  userName: string,
  resetUrl: string
): Promise<void> {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || "noreply@evolutionoftodo.com";
  const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "Evolution of Todo";

  if (!BREVO_API_KEY) {
    console.warn("[BREVO] API key not set, logging email instead");
    console.log(`[BREVO] Password reset email for ${email}: ${resetUrl}`);
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
        to: [{ email }],
        subject: "🔐 Reset your password - Evolution of Todo",
        htmlContent: passwordResetTemplate(userName, resetUrl),
        textContent: `Reset your password by clicking this link: ${resetUrl}\n\nThis link will expire in 1 hour.`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Brevo API error: ${error}`);
    }

    console.log(`[BREVO] Password reset email sent to ${email}`);
  } catch (error) {
    console.error("[BREVO] Failed to send password reset email:", error);
    throw error;
  }
}

/**
 * Send welcome email using Brevo
 */
export async function sendWelcomeEmail(
  email: string,
  userName: string,
  loginUrl?: string
): Promise<void> {
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || "noreply@evolutionoftodo.com";
  const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "Evolution of Todo";
  const appUrl = loginUrl || process.env.BETTER_AUTH_URL || "http://localhost:3000";

  if (!BREVO_API_KEY) {
    console.warn("[BREVO] API key not set, logging email instead");
    console.log(`[BREVO] Welcome email for ${email}`);
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
        to: [{ email }],
        subject: "🚀 Welcome to Evolution of Todo!",
        htmlContent: welcomeEmailTemplate(userName, appUrl),
        textContent: `Welcome to Evolution of Todo!\n\nYou can now start organizing your tasks at: ${appUrl}`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Brevo API error: ${error}`);
    }

    console.log(`[BREVO] Welcome email sent to ${email}`);
  } catch (error) {
    console.error("[BREVO] Failed to send welcome email:", error);
    throw error;
  }
}

// Export templates for external use
export { baseTemplate, verificationEmailTemplate, passwordResetTemplate, welcomeEmailTemplate };
