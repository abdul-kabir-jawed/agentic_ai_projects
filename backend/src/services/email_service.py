"""
Brevo Email Service for Evolution of Todo Backend

Uses Brevo (formerly Sendinblue) API for sending transactional emails:
- Email verification
- Password reset codes
- Welcome emails

@see https://developers.brevo.com/
"""

import os
import httpx
from typing import Optional
from datetime import datetime

# Brevo API configuration
BREVO_API_KEY = os.getenv("BREVO_API_KEY", "")
BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"
EMAIL_FROM_NAME = os.getenv("EMAIL_FROM_NAME", "Evolution of Todo")
EMAIL_FROM_ADDRESS = os.getenv("EMAIL_FROM_ADDRESS", "noreply@evolutionoftodo.com")
APP_URL = os.getenv("BETTER_AUTH_URL", "http://localhost:3000")


def _base_template(content: str) -> str:
    """Base email template with Evolution of Todo branding."""
    year = datetime.now().year
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Evolution of Todo</title>
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
      color: #e0e0e0;
      line-height: 1.6;
    }}
    .container {{
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }}
    .card {{
      background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(212, 175, 55, 0.1);
    }}
    .logo {{
      text-align: center;
      margin-bottom: 30px;
    }}
    .logo-circle {{
      display: inline-block;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #d4af37 0%, #c9a227 100%);
      border-radius: 50%;
      line-height: 60px;
      font-size: 24px;
      font-weight: bold;
      color: #0a0a0f;
    }}
    .logo-text {{
      display: block;
      margin-top: 10px;
      font-size: 14px;
      color: #d4af37;
      letter-spacing: 2px;
      text-transform: uppercase;
    }}
    h1 {{
      color: #ffffff;
      font-size: 28px;
      margin-bottom: 20px;
      text-align: center;
    }}
    .highlight {{
      color: #d4af37;
      font-style: italic;
    }}
    p {{
      color: #b0b0b0;
      margin-bottom: 20px;
      font-size: 16px;
    }}
    .button {{
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
    }}
    .button-container {{
      text-align: center;
      margin: 30px 0;
    }}
    .divider {{
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent);
      margin: 30px 0;
    }}
    .footer {{
      text-align: center;
      color: #666;
      font-size: 12px;
      margin-top: 30px;
    }}
    .footer a {{
      color: #d4af37;
      text-decoration: none;
    }}
    .code-box {{
      background: rgba(212, 175, 55, 0.1);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      font-family: monospace;
      font-size: 32px;
      letter-spacing: 8px;
      color: #d4af37;
      margin: 25px 0;
      font-weight: bold;
    }}
    .warning {{
      background: rgba(255, 107, 107, 0.1);
      border-left: 3px solid #ff6b6b;
      padding: 15px;
      border-radius: 0 8px 8px 0;
      margin: 20px 0;
      font-size: 14px;
      color: #ff9999;
    }}
    .features {{
      display: flex;
      justify-content: center;
      gap: 30px;
      margin: 20px 0;
      flex-wrap: wrap;
    }}
    .feature {{
      text-align: center;
      color: #888;
      font-size: 12px;
    }}
    .feature-icon {{
      color: #d4af37;
      font-size: 18px;
      margin-bottom: 5px;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <span class="logo-circle">ET</span>
        <span class="logo-text">Evolution of Todo</span>
      </div>
      {content}
      <div class="divider"></div>
      <div class="footer">
        <p>&copy; {year} Evolution of Todo. All rights reserved.</p>
        <p>Orchestrate your life with clarity and purpose.</p>
        <p style="margin-top: 10px;">
          <a href="{APP_URL}">Visit our website</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
"""


def _password_reset_code_template(user_name: str, reset_code: str) -> str:
    """Password reset email template with code."""
    content = f"""
  <h1>Reset Your <span class="highlight">Password</span></h1>
  <p>Hello {user_name or "there"},</p>
  <p>We received a request to reset your password for your Evolution of Todo account. Use the code below to complete your password reset.</p>

  <div class="code-box">{reset_code}</div>

  <p style="text-align: center; color: #888; font-size: 14px;">Enter this code on the password reset page</p>

  <div class="warning">
    This code will expire in <strong>15 minutes</strong>. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
  </div>

  <p style="text-align: center; color: #666; font-size: 14px; margin-top: 20px;">
    For security reasons, never share this code with anyone.
  </p>
"""
    return _base_template(content)


def _verification_email_template(user_name: str, verification_url: str) -> str:
    """Email verification template."""
    content = f"""
  <h1>Verify Your <span class="highlight">Email</span></h1>
  <p>Hello {user_name or "there"},</p>
  <p>Welcome to Evolution of Todo! To complete your registration and start organizing your life with clarity, please verify your email address.</p>

  <div class="button-container">
    <a href="{verification_url}" class="button">Verify Email Address</a>
  </div>

  <p style="font-size: 14px; color: #888;">Or copy and paste this link into your browser:</p>
  <p style="font-size: 12px; word-break: break-all; color: #d4af37;">{verification_url}</p>

  <div class="warning">
    This verification link will expire in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.
  </div>

  <div class="features">
    <div class="feature">
      <div class="feature-icon">&#128274;</div>
      <div>Secure</div>
    </div>
    <div class="feature">
      <div class="feature-icon">&#8734;</div>
      <div>Unlimited</div>
    </div>
    <div class="feature">
      <div class="feature-icon">&#9889;</div>
      <div>Fast</div>
    </div>
  </div>
"""
    return _base_template(content)


def _welcome_email_template(user_name: str) -> str:
    """Welcome email template."""
    content = f"""
  <h1>Welcome to <span class="highlight">Evolution of Todo</span></h1>
  <p>Hello {user_name or "there"},</p>
  <p>Your account has been successfully created! You're now ready to transform chaos into order and orchestrate your life with clarity and purpose.</p>

  <div class="button-container">
    <a href="{APP_URL}" class="button">Get Started</a>
  </div>

  <h2 style="color: #fff; font-size: 18px; margin: 30px 0 15px;">What you can do:</h2>
  <ul style="color: #b0b0b0; padding-left: 20px;">
    <li style="margin-bottom: 10px;">Create and organize tasks effortlessly</li>
    <li style="margin-bottom: 10px;">Set priorities and due dates</li>
    <li style="margin-bottom: 10px;">Track your daily progress</li>
    <li style="margin-bottom: 10px;">Use tags to categorize your work</li>
    <li style="margin-bottom: 10px;">Chat with AI assistant for help</li>
  </ul>

  <div class="features">
    <div class="feature">
      <div class="feature-icon">&#128274;</div>
      <div>Secure</div>
    </div>
    <div class="feature">
      <div class="feature-icon">&#8734;</div>
      <div>Unlimited</div>
    </div>
    <div class="feature">
      <div class="feature-icon">&#9889;</div>
      <div>Fast</div>
    </div>
  </div>
"""
    return _base_template(content)


async def send_email_with_brevo(
    to_email: str,
    to_name: Optional[str],
    subject: str,
    html_content: str,
    text_content: Optional[str] = None,
    tags: Optional[list] = None,
) -> dict:
    """Send email using Brevo API.

    Args:
        to_email: Recipient email address
        to_name: Recipient name
        subject: Email subject
        html_content: HTML content of the email
        text_content: Plain text content (optional)
        tags: List of tags for tracking (optional)

    Returns:
        dict with success status and messageId or error
    """
    if not BREVO_API_KEY:
        print(f"[BREVO] API key not configured - logging email instead:")
        print(f"  To: {to_email}")
        print(f"  Subject: {subject}")
        print(f"  Content: [HTML Email]")
        return {"success": True, "messageId": f"logged-email-{datetime.now().timestamp()}"}

    payload = {
        "sender": {
            "name": EMAIL_FROM_NAME,
            "email": EMAIL_FROM_ADDRESS,
        },
        "to": [
            {
                "email": to_email,
                "name": to_name or to_email.split("@")[0],
            }
        ],
        "subject": subject,
        "htmlContent": html_content,
    }

    if text_content:
        payload["textContent"] = text_content

    if tags:
        payload["tags"] = tags

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                BREVO_API_URL,
                headers={
                    "accept": "application/json",
                    "api-key": BREVO_API_KEY,
                    "content-type": "application/json",
                },
                json=payload,
                timeout=30.0,
            )

            if response.status_code >= 400:
                error_data = response.json()
                print(f"[BREVO] API error: {error_data}")
                return {"success": False, "error": error_data.get("message", "Failed to send email")}

            data = response.json()
            print(f"[BREVO] Email sent successfully: {data.get('messageId')}")
            return {"success": True, "messageId": data.get("messageId")}

    except Exception as e:
        print(f"[BREVO] Failed to send email: {e}")
        return {"success": False, "error": str(e)}


async def send_password_reset_code_email(
    email: str,
    name: Optional[str],
    reset_code: str,
) -> dict:
    """Send password reset code email.

    Args:
        email: Recipient email address
        name: Recipient name
        reset_code: 6-digit reset code

    Returns:
        dict with success status
    """
    return await send_email_with_brevo(
        to_email=email,
        to_name=name,
        subject="Your password reset code - Evolution of Todo",
        html_content=_password_reset_code_template(name or "", reset_code),
        text_content=f"Hello {name or 'there'}, Your password reset code is: {reset_code}. This code will expire in 15 minutes.",
        tags=["password-reset", "transactional"],
    )


async def send_verification_email(
    email: str,
    name: Optional[str],
    verification_url: str,
) -> dict:
    """Send email verification email.

    Args:
        email: Recipient email address
        name: Recipient name
        verification_url: URL to verify email

    Returns:
        dict with success status
    """
    return await send_email_with_brevo(
        to_email=email,
        to_name=name,
        subject="Verify your email - Evolution of Todo",
        html_content=_verification_email_template(name or "", verification_url),
        text_content=f"Hello {name or 'there'}, Please verify your email by visiting: {verification_url}",
        tags=["verification", "transactional"],
    )


async def send_welcome_email(
    email: str,
    name: Optional[str],
) -> dict:
    """Send welcome email after registration.

    Args:
        email: Recipient email address
        name: Recipient name

    Returns:
        dict with success status
    """
    return await send_email_with_brevo(
        to_email=email,
        to_name=name,
        subject="Welcome to Evolution of Todo!",
        html_content=_welcome_email_template(name or ""),
        text_content=f"Hello {name or 'there'}, Welcome to Evolution of Todo! Start organizing your tasks at: {APP_URL}",
        tags=["welcome", "transactional"],
    )
