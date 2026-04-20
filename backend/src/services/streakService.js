/**
 * streakService.js — Manages daily working streaks for coolies
 */

const pool = require('../config/db')
const { awardXP } = require('./xpService')
const { fireNotification } = require('./leagueService')

/**
 * Call whenever a coolie completes a trip.
 * Updates streak_days and last_active_date based on calendar day logic.
 */
async function updateStreak(coolieId) {
    const { rows } = await pool.query(
        `SELECT streak_days, last_active_date FROM coolie_xp_profiles WHERE coolie_id = $1`,
        [coolieId]
    )
    if (!rows.length) return { streakDays: 1 }

    const { streak_days, last_active_date } = rows[0]
    const today     = new Date(); today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)

    let newStreak = streak_days
    let bonusAwarded = false

    if (!last_active_date) {
        // First ever trip
        newStreak = 1
    } else {
        const lastActive = new Date(last_active_date); lastActive.setHours(0, 0, 0, 0)

        if (lastActive.getTime() === today.getTime()) {
            // Already counted today — no change
            return { streakDays: streak_days }
        } else if (lastActive.getTime() === yesterday.getTime()) {
            // Consecutive day — increment
            newStreak = streak_days + 1
        } else {
            // Gap of 2+ days — reset
            newStreak = 1
        }
    }

    // Persist streak
    await pool.query(`
        UPDATE coolie_xp_profiles
        SET streak_days      = $1,
            last_active_date = CURRENT_DATE,
            updated_at       = NOW()
        WHERE coolie_id = $2
    `, [newStreak, coolieId])

    // Award 7-day streak bonus (once, on exactly the 7th day)
    if (newStreak === 7) {
        await awardXP(coolieId, 'seven_day_streak', { xpOverride: 100 })
        bonusAwarded = true
        fireNotification(coolieId, 'streak_bonus', { days: 7 })
    }

    // Warn if streak is 6 (about to be big)
    if (newStreak === 6) {
        fireNotification(coolieId, 'streak_reminder', { days: 6 })
    }

    return { streakDays: newStreak, bonusAwarded }
}

/**
 * Run daily — warn coolies whose streak is at risk (haven't worked today and streak >= 3)
 */
async function sendStreakBreakWarnings() {
    const { rows } = await pool.query(`
        SELECT coolie_id, streak_days
        FROM coolie_xp_profiles
        WHERE last_active_date < CURRENT_DATE
          AND streak_days >= 3
    `)
    for (const row of rows) {
        fireNotification(row.coolie_id, 'streak_at_risk', { days: row.streak_days })
    }
    console.log(`[Streak] Sent break warnings to ${rows.length} coolies`)
}

module.exports = { updateStreak, sendStreakBreakWarnings }
