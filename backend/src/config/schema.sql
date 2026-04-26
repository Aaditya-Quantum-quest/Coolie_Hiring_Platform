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

    -- Age & Skills
    age                     INTEGER DEFAULT 18,
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

    -- ✅ Live Location Tracking
    is_online               BOOLEAN DEFAULT FALSE,
    latitude                DECIMAL(10, 8),
    longitude               DECIMAL(11, 8),
    last_location_update    TIMESTAMPTZ,
    location_permission_granted BOOLEAN DEFAULT FALSE,

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
CREATE INDEX IF NOT EXISTS idx_coolies_location ON coolies(is_online, latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id, user_type);

-- ============================================================
-- BOOKINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_ref         VARCHAR(20) UNIQUE NOT NULL, -- e.g., BK001
    customer_id         UUID REFERENCES customers(id),
    coolie_id           UUID REFERENCES coolies(id),
    station_name        VARCHAR(200) NOT NULL,
    platform            VARCHAR(100) NOT NULL,
    train_no            VARCHAR(50),
    destination         VARCHAR(200),
    luggage_size        VARCHAR(50),
    amount              INTEGER NOT NULL,
    status              VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','accepted','in_progress','completed','cancelled')),
    otp                 VARCHAR(10),
    tracking_active     BOOLEAN DEFAULT FALSE,
    coolie_arrived_at   TIMESTAMPTZ,
    trip_started_at     TIMESTAMPTZ,
    trip_ended_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LOCATION LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS location_logs (
    id              SERIAL PRIMARY KEY,
    coolie_id       UUID REFERENCES coolies(id),
    booking_id      UUID REFERENCES bookings(id),
    latitude        DECIMAL(10, 8) NOT NULL,
    longitude       DECIMAL(11, 8) NOT NULL,
    recorded_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_customers_updated_at ON customers;
CREATE TRIGGER set_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_coolies_updated_at ON coolies;
CREATE TRIGGER set_coolies_updated_at BEFORE UPDATE ON coolies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_bookings_updated_at ON bookings;
CREATE TRIGGER set_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- HOTELS & RESTAURANTS MODULE TABLES
-- ============================================================

-- Stations reference table
CREATE TABLE IF NOT EXISTS stations (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    code        VARCHAR(20),
    city        VARCHAR(100),
    state       VARCHAR(100),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO stations (name, code, city, state) VALUES
    ('New Delhi Railway Station', 'NDLS', 'New Delhi', 'Delhi'),
    ('Mumbai Central', 'BCT', 'Mumbai', 'Maharashtra'),
    ('Chennai Central', 'MAS', 'Chennai', 'Tamil Nadu'),
    ('Howrah Junction', 'HWH', 'Kolkata', 'West Bengal'),
    ('Bangalore City Junction', 'SBC', 'Bangalore', 'Karnataka'),
    ('Hyderabad Deccan', 'HYB', 'Hyderabad', 'Telangana'),
    ('Pune Junction', 'PUNE', 'Pune', 'Maharashtra'),
    ('Ahmedabad Junction', 'ADI', 'Ahmedabad', 'Gujarat'),
    ('Jaipur Junction', 'JP', 'Jaipur', 'Rajasthan'),
    ('Lucknow NR', 'LKO', 'Lucknow', 'Uttar Pradesh')
ON CONFLICT DO NOTHING;

-- Users table (for reviews FK — customers serve as users)
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100),
    email       VARCHAR(150) UNIQUE NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Business Owners
CREATE TABLE IF NOT EXISTS business_owners (
    id                  SERIAL PRIMARY KEY,
    full_name           VARCHAR(100) NOT NULL,
    email               VARCHAR(150) UNIQUE NOT NULL,
    password_hash       TEXT NOT NULL,
    phone_primary       VARCHAR(20) NOT NULL,
    phone_alternate     VARCHAR(20),
    whatsapp_number     VARCHAR(20),
    website_url         VARCHAR(255),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Businesses (Hotels & Restaurants)
CREATE TABLE IF NOT EXISTS businesses (
    id                  SERIAL PRIMARY KEY,
    owner_id            INTEGER REFERENCES business_owners(id) ON DELETE CASCADE,
    business_type       VARCHAR(20) CHECK (business_type IN ('restaurant','hotel')) NOT NULL,
    business_name       VARCHAR(150) NOT NULL,
    description         TEXT,
    gst_number          VARCHAR(50),
    year_established    INTEGER,
    logo_url            TEXT,
    cover_photo_url     TEXT,
    latitude            DECIMAL(10,8),
    longitude           DECIMAL(11,8),
    full_address        TEXT,
    city                VARCHAR(100),
    state               VARCHAR(100),
    pincode             VARCHAR(20),
    nearest_station_id  INTEGER REFERENCES stations(id),
    opening_time        TIME,
    closing_time        TIME,
    days_open           TEXT[],
    closed_on_holidays  BOOLEAN DEFAULT FALSE,
    payment_modes       TEXT[],
    status              VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
    rejection_reason    TEXT,
    is_active           BOOLEAN DEFAULT TRUE,
    profile_views       INTEGER DEFAULT 0,
    admin_reviewed_at   TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Restaurant Details
CREATE TABLE IF NOT EXISTS restaurant_details (
    id                  SERIAL PRIMARY KEY,
    business_id         INTEGER REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
    cuisine_types       TEXT[],
    food_type           VARCHAR(20) CHECK (food_type IN ('veg','non-veg','both')),
    specialty_dishes    TEXT[],
    dining_options      TEXT[],
    avg_cost_for_two    INTEGER,
    seating_capacity    INTEGER,
    has_ac              BOOLEAN DEFAULT FALSE,
    has_parking         BOOLEAN DEFAULT FALSE,
    has_wifi            BOOLEAN DEFAULT FALSE,
    has_family_seating  BOOLEAN DEFAULT FALSE,
    has_private_dining  BOOLEAN DEFAULT FALSE
);

-- Dishes
CREATE TABLE IF NOT EXISTS dishes (
    id              SERIAL PRIMARY KEY,
    business_id     INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    dish_name       VARCHAR(150) NOT NULL,
    category        VARCHAR(50),
    food_type       VARCHAR(20) CHECK (food_type IN ('veg','non-veg','egg')),
    price           DECIMAL(10,2) NOT NULL,
    description     TEXT,
    photo_url       TEXT,
    is_available    BOOLEAN DEFAULT TRUE,
    is_best_seller  BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Hotel Details
CREATE TABLE IF NOT EXISTS hotel_details (
    id                      SERIAL PRIMARY KEY,
    business_id             INTEGER REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
    total_rooms             INTEGER,
    star_rating             INTEGER CHECK (star_rating BETWEEN 1 AND 5),
    check_in_time           TIME,
    check_out_time          TIME,
    extra_bed_available     BOOLEAN DEFAULT FALSE,
    extra_bed_charge        DECIMAL(10,2),
    amenities               TEXT[]
);

-- Room Types
CREATE TABLE IF NOT EXISTS room_types (
    id                      SERIAL PRIMARY KEY,
    business_id             INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    room_type               VARCHAR(50) NOT NULL,
    price_per_night         DECIMAL(10,2) NOT NULL,
    total_rooms_of_type     INTEGER,
    extra_bed_available     BOOLEAN DEFAULT FALSE,
    extra_bed_charge        DECIMAL(10,2),
    description             TEXT,
    is_available            BOOLEAN DEFAULT TRUE,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Room Photos
CREATE TABLE IF NOT EXISTS room_photos (
    id              SERIAL PRIMARY KEY,
    room_type_id    INTEGER REFERENCES room_types(id) ON DELETE CASCADE,
    photo_url       TEXT NOT NULL,
    uploaded_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Halls / Banquets
CREATE TABLE IF NOT EXISTS halls (
    id              SERIAL PRIMARY KEY,
    business_id     INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    hall_name       VARCHAR(150) NOT NULL,
    capacity        INTEGER,
    price_per_event DECIMAL(10,2),
    has_ac          BOOLEAN DEFAULT FALSE,
    has_av_equipment BOOLEAN DEFAULT FALSE,
    description     TEXT,
    is_available    BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Hall Photos
CREATE TABLE IF NOT EXISTS hall_photos (
    id          SERIAL PRIMARY KEY,
    hall_id     INTEGER REFERENCES halls(id) ON DELETE CASCADE,
    photo_url   TEXT NOT NULL
);

-- Business Photos
CREATE TABLE IF NOT EXISTS business_photos (
    id              SERIAL PRIMARY KEY,
    business_id     INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    photo_url       TEXT NOT NULL,
    photo_type      VARCHAR(30),
    uploaded_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Business Reviews
CREATE TABLE IF NOT EXISTS business_reviews (
    id              SERIAL PRIMARY KEY,
    business_id     INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    user_id         INTEGER REFERENCES users(id),
    rating          INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    review_text     TEXT,
    owner_reply     TEXT,
    is_visible      BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Business Notifications
CREATE TABLE IF NOT EXISTS business_notifications (
    id          SERIAL PRIMARY KEY,
    owner_id    INTEGER REFERENCES business_owners(id) ON DELETE CASCADE,
    message     TEXT NOT NULL,
    is_read     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_businesses_station ON businesses(nearest_station_id);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_type ON businesses(business_type);
CREATE INDEX IF NOT EXISTS idx_dishes_business ON dishes(business_id);
CREATE INDEX IF NOT EXISTS idx_business_reviews_business ON business_reviews(business_id);

-- Triggers for businesses, dishes, room_types
DROP TRIGGER IF EXISTS set_businesses_updated_at ON businesses;
CREATE TRIGGER set_businesses_updated_at
BEFORE UPDATE ON businesses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_dishes_updated_at ON dishes;
CREATE TRIGGER set_dishes_updated_at
BEFORE UPDATE ON dishes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_room_types_updated_at ON room_types;
CREATE TRIGGER set_room_types_updated_at
BEFORE UPDATE ON room_types
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- DISPUTES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS disputes (
    id              SERIAL PRIMARY KEY,
    booking_id      UUID REFERENCES bookings(id),
    customer_id     UUID REFERENCES customers(id),
    coolie_id       UUID REFERENCES coolies(id),
    priority        VARCHAR(20) DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high')),
    status          VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'closed')),
    issue_type      VARCHAR(100),
    description     TEXT,
    resolution      TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRAINS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS trains (
    id          SERIAL PRIMARY KEY,
    train_no    VARCHAR(20) UNIQUE NOT NULL,
    name        VARCHAR(150) NOT NULL,
    from_station VARCHAR(150),
    to_station   VARCHAR(150),
    platform    INTEGER,
    status      VARCHAR(50),
    arrival_time TIME,
    delay_minutes INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRICE TIERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS price_tiers (
    id          SERIAL PRIMARY KEY,
    size        VARCHAR(20) UNIQUE NOT NULL, -- small, medium, large, heavy
    label       VARCHAR(100) NOT NULL,
    base_price  INTEGER NOT NULL,
    max_discount INTEGER DEFAULT 0,
    floor_price  INTEGER NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FESTIVAL SURGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS festival_surges (
    id          SERIAL PRIMARY KEY,
    festival_name VARCHAR(100) UNIQUE NOT NULL,
    surge_percentage INTEGER NOT NULL,
    is_active   BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BUSY HOURS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS busy_hours (
    id          SERIAL PRIMARY KEY,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Mon, 6=Sun
    hour_of_day INTEGER CHECK (hour_of_day BETWEEN 0 AND 23),
    busy_level  INTEGER CHECK (busy_level BETWEEN 0 AND 4),
    UNIQUE(day_of_week, hour_of_day)
);

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
