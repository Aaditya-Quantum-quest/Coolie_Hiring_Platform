-- Migration: Add password_reset_tokens table
-- Run this script to add the password reset functionality to existing database

-- ============================================================
-- PASSWORD RESET TOKENS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(150) NOT NULL,
    token           VARCHAR(255) NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ NOT NULL,
    is_used         BOOLEAN DEFAULT FALSE,
    user_type       VARCHAR(20) NOT NULL CHECK (user_type IN ('customer', 'coolie')),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_password_reset_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at);

-- Clean up expired tokens (optional cleanup job)
-- This can be run periodically to clean up expired tokens
-- DELETE FROM password_reset_tokens WHERE expires_at < NOW() OR is_used = TRUE;
