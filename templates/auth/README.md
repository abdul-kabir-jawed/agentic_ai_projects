# Authentication Templates for Next.js + Better Auth

A complete, production-ready authentication system using Better Auth with Drizzle ORM and Brevo for email delivery.

## Features

- **Login** - Email/password authentication
- **Register** - User registration with email verification
- **Forgot Password** - Request password reset via email
- **Reset Password** - Set new password with token validation
- **Email Verification** - Verify email address after registration
- **Beautiful Email Templates** - Branded, responsive HTML emails

## File Structure

```
auth/
├── README.md                      # This file
├── lib/
│   ├── auth.ts                    # Better Auth server config
│   ├── auth-client.ts             # Better Auth client config
│   └── brevo.ts                   # Email service with templates
├── db/
│   └── schema.ts                  # Drizzle database schema
├── contexts/
│   └── AuthContext.tsx            # React auth context
├── app/
│   ├── login/page.tsx             # Login page
│   ├── register/page.tsx          # Registration page
│   ├── forgot-password/page.tsx   # Forgot password page
│   ├── reset-password/page.tsx    # Reset password page
│   ├── verify-email/page.tsx      # Email verification result
│   ├── verify-email-pending/page.tsx  # Waiting for verification
│   └── api/
│       └── auth/
│           ├── [...all]/route.ts           # Better Auth catch-all
│           ├── send-verification-email/route.ts    # Send verification
│           └── custom-verify-email/route.ts        # Verify token
└── .env.example                   # Environment variables template
```

## Installation

### 1. Install Dependencies

```bash
npm install better-auth @neondatabase/serverless drizzle-orm ws
npm install framer-motion @iconify/react react-hot-toast
```

### 2. Environment Variables

Create `.env.local` with:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgres://user:pass@host/db?sslmode=require

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-change-in-production
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (Brevo)
BREVO_API_KEY=your-brevo-api-key
EMAIL_FROM_ADDRESS=noreply@yourapp.com
EMAIL_FROM_NAME=Your App Name
```

### 3. Database Setup

Run the Drizzle migrations or create tables manually:

```sql
-- User table (Better Auth managed)
CREATE TABLE "user" (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    "emailVerified" BOOLEAN DEFAULT false,
    image TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Session table (Better Auth managed)
CREATE TABLE "session" (
    id TEXT PRIMARY KEY,
    "expiresAt" TIMESTAMP NOT NULL,
    token TEXT UNIQUE,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL REFERENCES "user"(id)
);

-- Account table (Better Auth managed)
CREATE TABLE "account" (
    id TEXT PRIMARY KEY,
    "accountId" TEXT,
    "providerId" TEXT,
    "userId" TEXT NOT NULL REFERENCES "user"(id),
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP,
    "refreshTokenExpiresAt" TIMESTAMP,
    scope TEXT,
    password TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Verification table (Better Auth managed)
CREATE TABLE "verification" (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL UNIQUE,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP
);
```

### 4. Better Auth API Route

Create `app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

### 5. Wrap App with AuthProvider

In `app/layout.tsx`:

```tsx
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

## Customization

### Colors & Branding

The templates use CSS variables. Update in your `globals.css`:

```css
:root {
  --gold: #d4af37;
  --gold-bright: #f4d03f;
  --rose: #ff6b6b;
  --void: #0a0a0f;
  --deep: #1a1a2e;
  --surface: #16213e;
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --text-tertiary: #666666;
}
```

### Email Templates

Edit `lib/brevo.ts` to customize:

1. **Logo** - Change the `logo-circle` text and colors
2. **App Name** - Update the `appName` parameter
3. **Footer** - Modify the footer text
4. **Colors** - Update the CSS in `baseTemplate`

### UI Components

The pages use these Tailwind classes you should define:

```css
.glass-card-static {
  @apply bg-white/5 backdrop-blur-sm border border-white/10;
}

.btn-gold {
  @apply bg-gradient-to-r from-gold to-gold-bright hover:from-gold-bright hover:to-gold;
}

.input-gold {
  @apply w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-12
         text-white placeholder:text-white/30
         focus:border-gold/50 focus:ring-1 focus:ring-gold/25 focus:outline-none
         transition-all duration-200;
}

.input-gold.has-right-icon {
  @apply pr-12;
}

.form-group {
  @apply space-y-2;
}

.form-label {
  @apply block text-sm font-medium text-text-secondary;
}

.text-gradient-gold {
  @apply bg-gradient-to-r from-gold to-gold-bright bg-clip-text text-transparent;
}

.shadow-gold {
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
}
```

## API Reference

### AuthContext Methods

```typescript
const {
  user,                    // Current user or null
  token,                   // Session token or null
  isAuthenticated,         // Boolean
  isLoading,              // Boolean
  login,                  // (email, password) => Promise<void>
  register,               // (email, username, password, fullName?) => Promise<void>
  logout,                 // () => Promise<void>
  requestPasswordReset,   // (email) => Promise<void>
  resetPassword,          // (token, newPassword) => Promise<void>
} = useAuth();
```

### Email Functions

```typescript
import {
  sendVerificationEmail,    // (email, userName, verificationUrl)
  sendPasswordResetEmail,   // (email, userName, resetUrl)
  sendWelcomeEmail,         // (email, userName, loginUrl?)
} from '@/lib/brevo';
```

## Security Notes

1. **BETTER_AUTH_SECRET** - Use a strong, random secret in production (32+ chars)
2. **Email Verification** - Set `requireEmailVerification: true` in `auth.ts` for production
3. **Password Requirements** - Minimum 8 characters enforced
4. **Token Expiry** - Reset tokens expire in 1 hour, verification tokens in 24 hours
5. **Session Duration** - Sessions expire in 7 days by default

## Troubleshooting

### "Email not configured"
Set `BREVO_API_KEY`, `EMAIL_FROM_ADDRESS`, and `EMAIL_FROM_NAME` in environment.

### "Invalid token" on password reset
Token may be expired (1 hour). Request a new reset link.

### "Database error"
Ensure `DATABASE_URL` is set and tables exist. Check Neon dashboard.

### Session not persisting
Ensure `BETTER_AUTH_URL` matches your actual domain (including https).

## License

MIT - Use freely in your projects!
