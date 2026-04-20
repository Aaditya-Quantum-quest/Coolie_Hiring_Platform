/**
 * achievementService.js — Checks and unlocks achievements after every XP event
 */

const pool = require('../config/db')
const { fireNotification } = require('./leagueService')

// Master achievement list
const ACHIEVEMENTS = [
    // Earnings
    { id: 'tip_1k',       title: 'Tip Collector',   xp: 200,  field: 'total_tips_earned',   threshold: 1000,  exact: false },
    { id: 'tip_10k',      title: 'Money Magnet',    xp: 500,  field: 'total_tips_earned',   threshold: 10000, exact: false },
    { id: 'income_50k',   title: 'Big Earner',      xp: 1000, field: 'total_income_earned', threshold: 50000, exact: false },
    // Trips
    { id: 'first_trip',   title: 'First Step',      xp: 50,   field: 'total_trips',         threshold: 1,     exact: false },
    { id: '29_club',      title: '29 Club',         xp: 290,  field: 'total_trips',         threshold: 29,    exact: true  },
    { id: 'veteran',      title: 'Station Veteran', xp: 400,  field: 'total_trips',         threshold: 50,    exact: false },
    { id: 'century',      title: 'Century',         xp: 1000, field: 'total_trips',         threshold: 100,   exact: false },
    { id: 'legend_500',   title: 'Legend Porter',   xp: 5000, field: 'total_trips',         threshold: 500,   exact: false },
    // Ratings
    { id: 'first_5star',  title: 'Good Start',      xp: 50,   field: 'five_star_count',     threshold: 1,     exact: false },
    { id: '50_five',      title: 'Crowd Favourite', xp: 400,  field: 'five_star_count',     threshold: 50,    exact: false },
    { id: 'perfect_30',   title: 'Perfect Score',   xp: 800,  field: 'perfect_score_streak', threshold: 30,   exact: false },
    // Speed & Special
    { id: 'speed',        title: 'Speed Demon',     xp: 100,  field: 'fast_trips_count',    threshold: 1,     exact: false },
    { id: 'heavy',        title: 'Heavy Lifter',    xp: 300,  field: 'total_luggage_kg',    threshold: 500,   exact: false },
    { id: 'night_owl',    title: 'Night Owl',       xp: 250,  field: 'night_trips_count',   threshold: 10,    exact: false },
    // Streaks
    { id: 'on_fire',      title: 'On Fire',         xp: 350,  field: 'streak_days',         threshold: 7,     exact: false },
    { id: 'unstoppable',  title: 'Unstoppable',     xp: 1500, field: 'streak_days',         threshold: 30,    exact: false },
    // Ranking
    { id: 'league_master', title: 'League Master',  xp: 2000, field: 'current_league',      threshold: 'Master', exact: false, isString: true },
]

/**
 * Check all achievements for a coolie and unlock any newly satisfied ones.
 * Returns array of newly unlocked achievement objects.
 */
async function checkAchievements(coolieId) {
    // Fetch profile stats
    const { rows: profileRows } = await pool.query(
        `SELECT total_trips, total_tips_earned, total_income_earned, five_star_count,
                perfect_score_streak, fast_trips_count, total_luggage_kg,
                night_trips_count, streak_days, current_league
         FROM coolie_xp_profiles WHERE coolie_id = $1`,
        [coolieId]
    )
    if (!profileRows.length) return []
    const profile = profileRows[0]

    // Fetch already unlocked achievements
    const { rows: unlockedRows } = await pool.query(
        `SELECT achievement_id FROM coolie_achievements WHERE coolie_id = $1`,
        [coolieId]
    )
    const alreadyUnlocked = new Set(unlockedRows.map(r => r.achievement_id))

    const newlyUnlocked = []

    for (const ach of ACHIEVEMENTS) {
        if (alreadyUnlocked.has(ach.id)) continue  // already done

        const currentVal = profile[ach.field]
        let satisfied = false

        if (ach.isString) {
            satisfied = currentVal === ach.threshold
        } else if (ach.exact) {
            satisfied = Number(currentVal) === ach.threshold
        } else {
            satisfied = Number(currentVal) >= ach.threshold
        }

        if (!satisfied) continue

        // Unlock it
        try {
            await pool.query(
                `INSERT INTO coolie_achievements (coolie_id, achievement_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                [coolieId, ach.id]
            )

            // Award achievement XP (direct SQL to avoid recursive loop)
            await pool.query(`
                INSERT INTO xp_transactions (coolie_id, xp_amount, reason, reference_id)
                VALUES ($1, $2, 'achievement_unlocked', $3)
            `, [coolieId, ach.xp, ach.id])

            await pool.query(`
                UPDATE coolie_xp_profiles
                SET lifetime_xp = lifetime_xp + $1, weekly_xp = weekly_xp + $1, updated_at = NOW()
                WHERE coolie_id = $2
            `, [ach.xp, coolieId])

            newlyUnlocked.push({ ...ach, unlockedAt: new Date() })

            // Fire notification (non-blocking)
            fireNotification(coolieId, 'achievement_unlocked', { title: ach.title, xp: ach.xp })
        } catch (_) {
            // Duplicate unlock is fine — ignore
        }
    }

    return newlyUnlocked
}

/**
 * Get enriched achievement list for a coolie (progress % included)
 */
async function getCoolieAchievements(coolieId) {
    const { rows: profileRows } = await pool.query(
        `SELECT total_trips, total_tips_earned, total_income_earned, five_star_count,
                perfect_score_streak, fast_trips_count, total_luggage_kg,
                night_trips_count, streak_days, current_league
         FROM coolie_xp_profiles WHERE coolie_id = $1`,
        [coolieId]
    )
    const profile = profileRows[0] || {}

    const { rows: unlockedRows } = await pool.query(
        `SELECT achievement_id, unlocked_at FROM coolie_achievements WHERE coolie_id = $1`,
        [coolieId]
    )
    const unlockedMap = {}
    unlockedRows.forEach(r => { unlockedMap[r.achievement_id] = r.unlocked_at })

    return ACHIEVEMENTS.map(ach => {
        const currentVal = ach.isString ? (profile[ach.field] === ach.threshold ? 1 : 0) : Number(profile[ach.field] || 0)
        const isUnlocked = !!unlockedMap[ach.id]
        const progressPct = isUnlocked ? 100 : ach.exact
            ? (currentVal >= ach.threshold ? 100 : Math.round((currentVal / ach.threshold) * 100))
            : Math.min(100, Math.round((currentVal / ach.threshold) * 100))

        return {
            ...ach,
            unlocked:   isUnlocked,
            unlockedAt: unlockedMap[ach.id] || null,
            currentVal,
            progressPct,
        }
    })
}

module.exports = { checkAchievements, getCoolieAchievements, ACHIEVEMENTS }
