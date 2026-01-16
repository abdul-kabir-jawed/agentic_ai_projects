-- Better Auth Tables Setup for Neon PostgreSQL
-- These tables are required by Better Auth for authentication

-- User table
CREATE TABLE IF NOT EXISTS "user" (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT NOT NULL UNIQUE,
    "emailVerified" BOOLEAN DEFAULT FALSE,
    image TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session table
CREATE TABLE IF NOT EXISTS "session" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Account table (for email/password and OAuth credentials)
CREATE TABLE IF NOT EXISTS "account" (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP WITH TIME ZONE,
    "refreshTokenExpiresAt" TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    "idToken" TEXT,
    password TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification table (for password reset tokens and email verification)
DROP TABLE IF EXISTS "verification";
CREATE TABLE "verification" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_session_user ON "session"("userId");
CREATE INDEX IF NOT EXISTS idx_session_token ON "session"(token);
CREATE INDEX IF NOT EXISTS idx_account_user ON "account"("userId");
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON "verification"(identifier);
