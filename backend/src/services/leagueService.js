/**
 * leagueService.js — Calculates and updates a coolie's league and tier based on lifetime XP
 */

const pool = require('../config/db')

// League definitions: min XP (inclusive), max XP (exclusive), tier count
const LEAGUE_CONFIG = [
    { name: 'Bronze',  minXP: 0,     maxXP: 1000,  tiers: 5, tierXP: 200  },
    { name: 'Silver',  minXP: 1000,  maxXP: 3000,  tiers: 5, tierXP: 400  },
    { name: 'Gold',    minXP: 3000,  maxXP: 6000,  tiers: 5, tierXP: 600  },
    { name: 'Diamond', minXP: 6000,  maxXP: 10000, tiers: 5, tierXP: 800  },
    { name: 'Master',  minXP: 10000, maxXP: 15000, tiers: 3, tierXP: 1667 },
    { name: 'Legend',  minXP: 15000, maxXP: Infinity, tiers: 1, tierXP: 0 },
]

/**
 * Given lifetime XP, return the league name and tier number (1 = top, 5 = entry)
 */
function calculateLeagueAndTier(lifetimeXP) {
    const league = LEAGUE_CONFIG.find((l, i) => {
        const next = LEAGUE_CONFIG[i + 1]
        return lifetimeXP >= l.minXP && (next ? lifetimeXP < next.minXP : true)
    }) || LEAGUE_CONFIG[0]

    if (league.tiers === 1) return { league: league.name, tier: 1 }

    const xpInLeague = lifetimeXP - league.minXP
    const tierIndex  = Math.floor(xpInLeague / league.tierXP)     // 0 = entry tier
    const tier       = league.tiers - Math.min(tierIndex, league.tiers - 1)  // 5 → 1

    return { league: league.name, tier }
}

/**
 * Calculate XP progress info toward next tier/league
 */
function getProgressInfo(lifetimeXP) {
    const { league, tier } = calculateLeagueAndTier(lifetimeXP)
    const leagueCfg = LEAGUE_CONFIG.find(l => l.name === league)

    if (!leagueCfg) return { progressPct: 100, currentTierXP: lifetimeXP, nextTierXP: lifetimeXP, xpToNext: 0 }

    // XP at which current tier starts
    const tiersFromTop     = leagueCfg.tiers - tier   // 0 at top tier
    const currentTierMinXP = leagueCfg.minXP + tiersFromTop * leagueCfg.tierXP
    const nextTierMinXP    = currentTierMinXP + leagueCfg.tierXP

    const xpToNext  = Math.max(0, nextTierMinXP - lifetimeXP)
    const progressPct = leagueCfg.tiers === 1 ? 100
        : Math.min(100, Math.round(((lifetimeXP - currentTierMinXP) / leagueCfg.tierXP) * 100))

    return {
        progressPct,
        currentTierXP: currentTierMinXP,
        nextTierXP:    nextTierMinXP,
        xpToNext,
        nearNextTier:  xpToNext > 0 && xpToNext <= 50,
    }
}

/**
 * Recalculate and persist a coolie's league + tier. Returns { changed, oldLeague, newLeague, oldTier, newTier }
 */
async function recalculateLeague(coolieId) {
    // Fetch current XP and league
    const { rows } = await pool.query(
        `SELECT lifetime_xp, current_league, current_tier FROM coolie_xp_profiles WHERE coolie_id = $1`,
        [coolieId]
    )
    if (!rows.length) return { changed: false }

    const { lifetime_xp, current_league, current_tier } = rows[0]
    const { league: newLeague, tier: newTier } = calculateLeagueAndTier(lifetime_xp)

    const changed = newLeague !== current_league || newTier !== current_tier

    if (changed) {
        await pool.query(
            `UPDATE coolie_xp_profiles SET current_league = $1, current_tier = $2, updated_at = NOW() WHERE coolie_id = $3`,
            [newLeague, newTier, coolieId]
        )

        // Fire notification (non-blocking — best effort)
        const notifType = newLeague !== current_league ? 'league_promotion' : 'tier_up'
        fireNotification(coolieId, notifType, { oldLeague: current_league, newLeague, oldTier: current_tier, newTier })
    }

    return { changed, oldLeague: current_league, newLeague, oldTier: current_tier, newTier }
}

/**
 * Stub: replace with actual FCM / web-push call in production
 */
function fireNotification(coolieId, type, data) {
    const messages = {
        league_promotion: `🎉 You've been promoted to ${data.newLeague} League!`,
        tier_up:          `🔥 You reached ${data.newLeague} Tier ${data.newTier}! Keep pushing!`,
        near_next_tier:   `⚡ Only ${data.xpToNext} XP to reach ${data.newLeague} Tier ${data.newTier - 1}!`,
        inactivity_drop:  `😔 You dropped to ${data.newLeague} Tier ${data.newTier} due to inactivity.`,
    }
    // TODO: integrate FCM — for now, just log
    console.log(`[Notification] ${coolieId} | ${type}: ${messages[type] || type}`)
}

module.exports = { recalculateLeague, calculateLeagueAndTier, getProgressInfo, LEAGUE_CONFIG, fireNotification }
