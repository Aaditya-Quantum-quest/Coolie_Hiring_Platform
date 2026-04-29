const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })
const { Pool } = require('pg')

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

async function setupDB() {
    console.log('🔄 Creating Rankings tables...')
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS coolie_xp_profiles (
                coolie_id            UUID PRIMARY KEY REFERENCES coolies(id) ON DELETE CASCADE,
                lifetime_xp          INT NOT NULL DEFAULT 0,
                weekly_xp            INT NOT NULL DEFAULT 0,
                weekly_xp_reset_date TIMESTAMPTZ DEFAULT NOW(),
                current_league       VARCHAR(10) NOT NULL DEFAULT 'Bronze',
                current_tier         INT NOT NULL DEFAULT 5,
                total_trips          INT NOT NULL DEFAULT 0,
                total_tips_earned    NUMERIC(10,2) NOT NULL DEFAULT 0,
                total_income_earned  NUMERIC(10,2) NOT NULL DEFAULT 0,
                total_rating_sum     NUMERIC(8,2) NOT NULL DEFAULT 0,
                rating_count         INT NOT NULL DEFAULT 0,
                streak_days          INT NOT NULL DEFAULT 0,
                last_active_date     DATE,
                total_luggage_kg     NUMERIC(10,2) NOT NULL DEFAULT 0,
                night_trips_count    INT NOT NULL DEFAULT 0,
                fast_trips_count     INT NOT NULL DEFAULT 0,
                five_star_count      INT NOT NULL DEFAULT 0,
                perfect_score_streak INT NOT NULL DEFAULT 0,
                join_date            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS xp_transactions (
                id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                coolie_id     UUID NOT NULL REFERENCES coolies(id) ON DELETE CASCADE,
                xp_amount     INT NOT NULL,
                reason        VARCHAR(100) NOT NULL,
                reference_id  VARCHAR(200),
                created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS coolie_achievements (
                id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                coolie_id      UUID NOT NULL REFERENCES coolies(id) ON DELETE CASCADE,
                achievement_id VARCHAR(50) NOT NULL,
                unlocked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE(coolie_id, achievement_id)
            );

            CREATE TABLE IF NOT EXISTS weekly_leaderboard (
                id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                week_start   DATE NOT NULL,
                week_end     DATE NOT NULL,
                rankings     JSONB NOT NULL DEFAULT '[]',
                prizes_paid  BOOLEAN NOT NULL DEFAULT FALSE,
                created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `)
        console.log('✅ Rankings tables created successfully.')
    } catch (err) {
        console.error('❌ Failed to create tables:', err.message)
    } finally {
        pool.end()
    }
}

setupDB()
