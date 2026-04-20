/**
 * demotionCron.js — Daily midnight cron: drop tier by 1 for inactive coolies (30+ days)
 * Schedule: '0 0 * * *'  (every day at 00:00)
 */

const cron = require('node-cron')
const pool = require('../config/db')
const { LEAGUE_CONFIG } = require('../services/leagueService')

function getLowestTierForLeague(leagueName) {
    const cfg = LEAGUE_CONFIG.find(l => l.name === leagueName)
    return cfg ? cfg.tiers : 5  // tier 5 = entry
}

async function runDemotionJob() {
    console.log('[DemotionCron] Running inactivity demotion check...')

    const { rows } = await pool.query(`
        SELECT coolie_id, current_league, current_tier
        FROM coolie_xp_profiles
        WHERE last_active_date < (CURRENT_DATE - INTERVAL '30 days')
          AND current_tier < 6
    `)

    if (!rows.length) {
        console.log('[DemotionCron] No coolies to demote.')
        return
    }

    let demoted = 0
    for (const row of rows) {
        const lowestTier = getLowestTierForLeague(row.current_league)

        // Don't go below the entry tier (e.g. Tier 5 for Bronze)
        if (row.current_tier >= lowestTier) continue

        const newTier = row.current_tier + 1  // tier 5 > tier 4 numerically (5 = lowest)

        await pool.query(`
            UPDATE coolie_xp_profiles
            SET current_tier = $1, updated_at = NOW()
            WHERE coolie_id = $2
        `, [newTier, row.coolie_id])

        // Log zero-XP demotion event
        await pool.query(`
            INSERT INTO xp_transactions (coolie_id, xp_amount, reason)
            VALUES ($1, 0, 'inactivity_demotion')
        `, [row.coolie_id])

        demoted++
        console.log(`[DemotionCron] ${row.coolie_id}: ${row.current_league} Tier ${row.current_tier} → Tier ${newTier}`)
    }

    console.log(`[DemotionCron] Done. Demoted ${demoted} coolies.`)
}

// Schedule: every day at midnight
cron.schedule('0 0 * * *', runDemotionJob, {
    timezone: 'Asia/Kolkata',
})

module.exports = { runDemotionJob }
