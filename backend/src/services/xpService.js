/**
 * xpService.js — Awards XP, logs transactions, triggers league + achievement checks
 * 
 * SQL TABLES REQUIRED (run once):
 * 
 *  CREATE TABLE IF NOT EXISTS coolie_xp_profiles (
 *    coolie_id            UUID PRIMARY KEY REFERENCES coolies(id) ON DELETE CASCADE,
 *    lifetime_xp          INT NOT NULL DEFAULT 0,
 *    weekly_xp            INT NOT NULL DEFAULT 0,
 *    weekly_xp_reset_date TIMESTAMPTZ DEFAULT NOW(),
 *    current_league       VARCHAR(10) NOT NULL DEFAULT 'Bronze',
 *    current_tier         INT NOT NULL DEFAULT 5,
 *    total_trips          INT NOT NULL DEFAULT 0,
 *    total_tips_earned    NUMERIC(10,2) NOT NULL DEFAULT 0,
 *    total_income_earned  NUMERIC(10,2) NOT NULL DEFAULT 0,
 *    total_rating_sum     NUMERIC(8,2) NOT NULL DEFAULT 0,
 *    rating_count         INT NOT NULL DEFAULT 0,
 *    streak_days          INT NOT NULL DEFAULT 0,
 *    last_active_date     DATE,
 *    total_luggage_kg     NUMERIC(10,2) NOT NULL DEFAULT 0,
 *    night_trips_count    INT NOT NULL DEFAULT 0,
 *    fast_trips_count     INT NOT NULL DEFAULT 0,
 *    five_star_count      INT NOT NULL DEFAULT 0,
 *    perfect_score_streak INT NOT NULL DEFAULT 0,
 *    join_date            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
 *  );
 *
 *  CREATE TABLE IF NOT EXISTS xp_transactions (
 *    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *    coolie_id     UUID NOT NULL REFERENCES coolies(id) ON DELETE CASCADE,
 *    xp_amount     INT NOT NULL,
 *    reason        VARCHAR(100) NOT NULL,
 *    reference_id  VARCHAR(200),
 *    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
 *  );
 *
 *  CREATE TABLE IF NOT EXISTS coolie_achievements (
 *    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *    coolie_id      UUID NOT NULL REFERENCES coolies(id) ON DELETE CASCADE,
 *    achievement_id VARCHAR(50) NOT NULL,
 *    unlocked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *    UNIQUE(coolie_id, achievement_id)
 *  );
 *
 *  CREATE TABLE IF NOT EXISTS weekly_leaderboard (
 *    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *    week_start   DATE NOT NULL,
 *    week_end     DATE NOT NULL,
 *    rankings     JSONB NOT NULL DEFAULT '[]',
 *    prizes_paid  BOOLEAN NOT NULL DEFAULT FALSE,
 *    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
 *  );
 */

const pool = require('../config/db')
const { recalculateLeague } = require('./leagueService')
const { checkAchievements } = require('./achievementService')

// XP award amounts per action
const XP_RULES = {
    trip_completed:       50,
    five_star_rating:     30,
    tip_received:         20,
    fast_trip:            25,
    weekend_trip:         15,
    night_trip:           20,
    first_trip_of_day:    10,
    seven_day_streak:     100,
    achievement_unlocked: 0,  // overridden per-achievement
}

/**
 * Ensure a coolie XP profile row exists (idempotent upsert)
 */
async function ensureProfile(coolieId, client) {
    const db = client || pool
    await db.query(`
        INSERT INTO coolie_xp_profiles (coolie_id)
        VALUES ($1)
        ON CONFLICT (coolie_id) DO NOTHING
    `, [coolieId])
}

/**
 * Award XP to a coolie
 * @param {string} coolieId
 * @param {string} reason  - key from XP_RULES or 'achievement_unlocked'
 * @param {object} meta    - { tripId, xpOverride, tipAmount, luggageKg, rating, tripTime }
 * @returns {{ newLifetimeXp, newWeeklyXp, newLeague, newTier, levelUp, achievementsUnlocked }}
 */
async function awardXP(coolieId, reason, meta = {}) {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        await ensureProfile(coolieId, client)

        // Determine XP amount
        const xpAmount = meta.xpOverride !== undefined ? meta.xpOverride : (XP_RULES[reason] || 0)

        // Insert XP transaction log
        await client.query(`
            INSERT INTO xp_transactions (coolie_id, xp_amount, reason, reference_id)
            VALUES ($1, $2, $3, $4)
        `, [coolieId, xpAmount, reason, meta.tripId || meta.referenceId || null])

        // Add XP to profile
        await client.query(`
            UPDATE coolie_xp_profiles
            SET lifetime_xp = lifetime_xp + $1,
                weekly_xp   = weekly_xp + $1,
                updated_at  = NOW()
            WHERE coolie_id = $2
        `, [xpAmount, coolieId])

        // Update tip and income stats if applicable
        if (meta.tipAmount) {
            await client.query(`
                UPDATE coolie_xp_profiles
                SET total_tips_earned = total_tips_earned + $1
                WHERE coolie_id = $2
            `, [meta.tipAmount, coolieId])
        }
        if (meta.incomeAmount) {
            await client.query(`
                UPDATE coolie_xp_profiles
                SET total_income_earned = total_income_earned + $1
                WHERE coolie_id = $2
            `, [meta.incomeAmount, coolieId])
        }
        if (meta.luggageKg) {
            await client.query(`
                UPDATE coolie_xp_profiles
                SET total_luggage_kg = total_luggage_kg + $1
                WHERE coolie_id = $2
            `, [meta.luggageKg, coolieId])
        }
        if (meta.rating) {
            await client.query(`
                UPDATE coolie_xp_profiles
                SET total_rating_sum = total_rating_sum + $1,
                    rating_count     = rating_count + 1,
                    five_star_count  = five_star_count + CASE WHEN $1 = 5 THEN 1 ELSE 0 END
                WHERE coolie_id = $2
            `, [meta.rating, coolieId])
        }
        if (reason === 'fast_trip') {
            await client.query(`UPDATE coolie_xp_profiles SET fast_trips_count = fast_trips_count + 1 WHERE coolie_id = $1`, [coolieId])
        }
        if (reason === 'night_trip') {
            await client.query(`UPDATE coolie_xp_profiles SET night_trips_count = night_trips_count + 1 WHERE coolie_id = $1`, [coolieId])
        }

        await client.query('COMMIT')

        // Post-transaction: recalculate league and check achievements
        const leagueResult = await recalculateLeague(coolieId)
        const achievementsUnlocked = await checkAchievements(coolieId)

        // Fetch final profile numbers
        const profile = await pool.query(
            `SELECT lifetime_xp, weekly_xp, current_league, current_tier FROM coolie_xp_profiles WHERE coolie_id = $1`,
            [coolieId]
        )
        const row = profile.rows[0] || {}

        return {
            newLifetimeXp:       row.lifetime_xp || 0,
            newWeeklyXp:         row.weekly_xp || 0,
            newLeague:           row.current_league || 'Bronze',
            newTier:             row.current_tier || 5,
            levelUp:             leagueResult.changed,
            achievementsUnlocked,
        }
    } catch (err) {
        await client.query('ROLLBACK')
        throw err
    } finally {
        client.release()
    }
}

/**
 * Called when a trip is completed — awards all applicable XP bonuses
 */
async function onTripCompleted(coolieId, meta = {}) {
    const results = []

    // Base trip XP
    const base = await awardXP(coolieId, 'trip_completed', { tripId: meta.tripId })
    results.push(base)

    // Update trip count
    await pool.query(`UPDATE coolie_xp_profiles SET total_trips = total_trips + 1 WHERE coolie_id = $1`, [coolieId])

    // Fast trip bonus (< 5 minutes)
    if (meta.durationMinutes && meta.durationMinutes < 5) {
        await awardXP(coolieId, 'fast_trip', { tripId: meta.tripId })
    }

    // Night trip bonus (00:00–05:00)
    if (meta.tripTime) {
        const hour = new Date(meta.tripTime).getHours()
        if (hour >= 0 && hour < 5) {
            await awardXP(coolieId, 'night_trip', { tripId: meta.tripId })
        }
    }

    // Weekend bonus
    const day = new Date().getDay()
    if (day === 0 || day === 6) {
        await awardXP(coolieId, 'weekend_trip', { tripId: meta.tripId })
    }

    // First trip of day bonus
    const todayTrips = await pool.query(`
        SELECT COUNT(*) as cnt FROM xp_transactions
        WHERE coolie_id = $1 AND reason = 'trip_completed'
          AND created_at >= CURRENT_DATE
    `, [coolieId])
    if (parseInt(todayTrips.rows[0].cnt) === 1) {
        await awardXP(coolieId, 'first_trip_of_day', { tripId: meta.tripId })
    }

    return results[0]
}

module.exports = { awardXP, onTripCompleted, ensureProfile, XP_RULES }
