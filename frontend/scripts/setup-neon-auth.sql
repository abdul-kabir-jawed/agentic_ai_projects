-- Better Auth / Neon Auth Schema Setup
-- This creates the required tables for Better Auth to work with Neon

-- Create the neon_auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS neon_auth;

-- User table - stores all user information
CREATE TABLE IF NOT EXISTS neon_auth.user (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT NOT NULL UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session table - stores user sessions
CREATE TABLE IF NOT EXISTS neon_auth.session (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES neon_auth.user(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Account table - stores OAuth provider accounts
CREATE TABLE IF NOT EXISTS neon_auth.account (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES neon_auth.user(id) ON DELETE CASCADE,
    account_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    access_token_expires_at TIMESTAMP WITH TIME ZONE,
    refresh_token_expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    id_token TEXT,
    password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification table - stores email verification and password reset tokens
CREATE TABLE IF NOT EXISTS neon_auth.verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_session_user_id ON neon_auth.session(user_id);
CREATE INDEX IF NOT EXISTS idx_session_token ON neon_auth.session(token);
CREATE INDEX IF NOT EXISTS idx_account_user_id ON neon_auth.account(user_id);
CREATE INDEX IF NOT EXISTS idx_account_provider ON neon_auth.account(provider_id, account_id);
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON neon_auth.verification(identifier);
CREATE INDEX IF NOT EXISTS idx_user_email ON neon_auth.user(email);

-- Grant necessary permissions (adjust role name as needed)
-- GRANT ALL ON SCHEMA neon_auth TO neondb_owner;
-- GRANT ALL ON ALL TABLES IN SCHEMA neon_auth TO neondb_owner;
