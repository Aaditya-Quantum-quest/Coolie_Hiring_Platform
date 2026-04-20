-- ============================================================
-- Coolie Hiring App — PostgreSQL Schema (v2 — Secure Identity)
-- Run in psql or pgAdmin on database: cooliehire
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ADMINS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    role            VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('super_admin','admin')),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CUSTOMERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(100) NOT NULL,
    email               VARCHAR(150) NOT NULL UNIQUE,
    password_hash       TEXT NOT NULL,
    phone               VARCHAR(15) NOT NULL UNIQUE,
    city                VARCHAR(100),
    profile_photo_url   TEXT,
    is_active           BOOLEAN DEFAULT TRUE,
    is_banned           BOOLEAN DEFAULT FALSE,
    login_attempts      INTEGER DEFAULT 0,
    locked_until        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COOLIES TABLE — Full KYC + Security Fields
-- ============================================================
CREATE TABLE IF NOT EXISTS coolies (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- System-Generated (assigned ONLY after admin approval)
    coolie_id               VARCHAR(20) UNIQUE,   -- CL-NDLS-X8F4K2 format

    -- Basic Info
    name                    VARCHAR(100) NOT NULL,
    email                   VARCHAR(150) NOT NULL UNIQUE,
    password_hash           TEXT NOT NULL,
    phone                   VARCHAR(15) NOT NULL UNIQUE,
    alt_phone               VARCHAR(15),
    date_of_birth           DATE NOT NULL,
    gender                  VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'other')),

    -- Address
    address                 TEXT NOT NULL,
    city                    VARCHAR(100) NOT NULL,
    state                   VARCHAR(100) NOT NULL,
    pincode                 VARCHAR(10) NOT NULL,

    -- Station Info (used in Coolie ID generation)
    station_name            VARCHAR(200) NOT NULL,
    station_code            VARCHAR(20),
    working_platforms       TEXT[],

    -- Experience & Skills
    experience_years        INTEGER DEFAULT 0,
    languages_spoken        TEXT[],

    -- ✅ Encrypted Identity Documents (AES-256 encrypted)
    aadhaar_number_hash     TEXT NOT NULL UNIQUE,  -- HMAC hash for uniqueness checks
    aadhaar_number_enc      TEXT NOT NULL,          -- AES encrypted Aadhaar number
    aadhaar_front_url       TEXT NOT NULL,          -- Uploaded image path
    aadhaar_back_url        TEXT NOT NULL,
    secondary_doc_type      VARCHAR(30) NOT NULL CHECK (secondary_doc_type IN ('voter_id','pan','driving_license','passport')),
    secondary_doc_number_enc TEXT NOT NULL,         -- AES encrypted doc number
    secondary_doc_url       TEXT NOT NULL,

    -- Passport Photo
    passport_photo_url      TEXT NOT NULL,

    -- QR Code Digital Identity (generated post-approval)
    qr_code_url             TEXT,

    -- Bank / Payment (optional)
    bank_name               VARCHAR(100),
    account_number_enc      TEXT,                   -- AES encrypted
    ifsc_code               VARCHAR(15),
    upi_id                  VARCHAR(100),

    -- ✅ Two-Level Admin Verification
    -- Level 1: Document check (by any admin)
    -- Level 2: Final approval (by super_admin or second admin)
    verification_level      INTEGER DEFAULT 0 CHECK (verification_level IN (0,1,2)),
    verification_status     VARCHAR(20) DEFAULT 'pending'
                                CHECK (verification_status IN ('pending','level1_approved','under_review','approved','rejected')),
    level1_approved_by      UUID REFERENCES admins(id),
    level1_approved_at      TIMESTAMPTZ,
    level2_approved_by      UUID REFERENCES admins(id),
    level2_approved_at      TIMESTAMPTZ,
    rejection_reason        TEXT,
    is_verified             BOOLEAN DEFAULT FALSE,
    is_active               BOOLEAN DEFAULT FALSE,    -- Only TRUE after full approval
    is_suspended            BOOLEAN DEFAULT FALSE,

    -- ✅ Login Security
    login_attempts          INTEGER DEFAULT 0,
    locked_until            TIMESTAMPTZ,

    -- Performance
    rating_avg              NUMERIC(3,2) DEFAULT 0.00,
    total_trips             INTEGER DEFAULT 0,
    badge                   VARCHAR(50),

    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REFRESH TOKENS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL,
    user_type   VARCHAR(10) NOT NULL CHECK (user_type IN ('customer','coolie','admin')),
    token_hash  TEXT NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_coolies_email ON coolies(email);
CREATE INDEX IF NOT EXISTS idx_coolies_phone ON coolies(phone);
CREATE INDEX IF NOT EXISTS idx_coolies_coolie_id ON coolies(coolie_id);
CREATE INDEX IF NOT EXISTS idx_coolies_aadhaar_hash ON coolies(aadhaar_number_hash);
CREATE INDEX IF NOT EXISTS idx_coolies_station ON coolies(station_name);
CREATE INDEX IF NOT EXISTS idx_coolies_status ON coolies(verification_status);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id, user_type);

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_coolies_updated_at BEFORE UPDATE ON coolies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- DEFAULT SUPER ADMIN (change password immediately!)
-- Password: Admin@123456 (bcrypt hash below)
-- Generate your own: node -e "const b=require('bcryptjs');b.hash('Admin@123456',12).then(console.log)"
-- ============================================================
INSERT INTO admins (name, email, password_hash, role) VALUES
(
    'Super Admin',
    'admin@cooliehire.in',
    '$2b$12$sj.gKCubJjBqR82MMcPbWeS/Z5i6p4LLyMvQRvOei2f4SIVxx637C',
    'super_admin'
) ON CONFLICT (email) DO NOTHING;
