/**
 * rankings.controller.js — Handlers for all /api/v1/rankings routes
 */

const pool = require('../config/db')
const { awardXP, onTripCompleted } = require('../services/xpService')
const { getProgressInfo, LEAGUE_CONFIG } = require('../services/leagueService')
const { getCoolieAchievements } = require('../services/achievementService')
const { updateStreak } = require('../services/streakService')
const { ensureProfile } = require('../services/xpService')

// ─── GET /profile/:coolie_id ─────────────────────────────────────────────────
const getProfile = async (req, res) => {
    try {
        const { coolie_id } = req.params

        // Ensure profile exists (upsert)
        await ensureProfile(coolie_id)

        const { rows } = await pool.query(`
            SELECT p.*, c.name, c.email, c.coolie_id as coolie_code, c.created_at as joined
            FROM coolie_xp_profiles p
            JOIN coolies c ON c.id = p.coolie_id
            WHERE p.coolie_id = $1
        `, [coolie_id])

        if (!rows.length) return res.status(404).json({ success: false, message: 'Coolie not found.' })

        const profile = rows[0]
        const progress = getProgressInfo(profile.lifetime_xp)
        const avgRating = profile.rating_count > 0
            ? (profile.total_rating_sum / profile.rating_count).toFixed(1)
            : null

        return res.json({
            success: true,
            data: {
                coolieId:         coolie_id,
                coolieCode:       profile.coolie_code,
                name:             profile.name,
                lifetimeXP:       profile.lifetime_xp,
                weeklyXP:         profile.weekly_xp,
                league:           profile.current_league,
                tier:             profile.current_tier,
                progressPct:      progress.progressPct,
                currentTierXP:    progress.currentTierXP,
                nextTierXP:       progress.nextTierXP,
                xpToNext:         progress.xpToNext,
                nearNextTier:     progress.nearNextTier,
                totalTrips:       profile.total_trips,
                avgRating:        Number(avgRating),
                totalTipsEarned:  Number(profile.total_tips_earned),
                totalIncome:      Number(profile.total_income_earned),
                streakDays:       profile.streak_days,
                lastActiveDate:   profile.last_active_date,
                joinDate:         profile.joined,
                fiveStarCount:    profile.five_star_count,
                nightTrips:       profile.night_trips_count,
                fastTrips:        profile.fast_trips_count,
                luggageKg:        Number(profile.total_luggage_kg),
            },
        })
    } catch (err) {
        console.error('getProfile error:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

// ─── GET /leaderboard/weekly ─────────────────────────────────────────────────
const getWeeklyLeaderboard = async (req, res) => {
    try {
        const requestingCoolieId = req.user?.id

        // Top 10 for the current week sorted by weekly_xp
        const { rows: top10 } = await pool.query(`
            SELECT p.coolie_id, c.name, c.coolie_id as coolie_code,
                   p.weekly_xp, p.current_league, p.current_tier,
                   RANK() OVER (ORDER BY p.weekly_xp DESC) as rank
            FROM coolie_xp_profiles p
            JOIN coolies c ON c.id = p.coolie_id
            ORDER BY p.weekly_xp DESC
            LIMIT 10
        `)

        // Requesting coolie's own rank (if not in top 10)
        let myRank = null
        if (requestingCoolieId) {
            const { rows: rankRows } = await pool.query(`
                SELECT rank FROM (
                    SELECT coolie_id, RANK() OVER (ORDER BY weekly_xp DESC) as rank
                    FROM coolie_xp_profiles
                ) ranked
                WHERE coolie_id = $1
            `, [requestingCoolieId])
            myRank = rankRows[0]?.rank || null
        }

        // Compute countdown to next Monday 00:01 AM
        const now      = new Date()
        const nextReset = new Date(now)
        const daysToMonday = (1 - now.getDay() + 7) % 7 || 7
        nextReset.setDate(now.getDate() + daysToMonday)
        nextReset.setHours(0, 1, 0, 0)
        const msLeft  = nextReset - now
        const secsLeft = Math.floor(msLeft / 1000)

        const prizes = { 1: '₹500 bonus', 2: '₹300 bonus', 3: '₹200 bonus' }

        const leaderboard = top10.map(row => ({
            rank:       Number(row.rank),
            coolieId:   row.coolie_id,
            coolieCode: row.coolie_code,
            name:       row.name,
            weeklyXP:   row.weekly_xp,
            league:     row.current_league,
            tier:       row.current_tier,
            isMe:       row.coolie_id === requestingCoolieId,
            prize:      prizes[row.rank] || (row.rank <= 10 ? 'Platform credit' : null),
        }))

        return res.json({
            success: true,
            data: {
                leaderboard,
                myRank:           Number(myRank),
                inTopTen:         leaderboard.some(e => e.isMe),
                resetInSeconds:   secsLeft,
                nextResetAt:      nextReset.toISOString(),
            },
        })
    } catch (err) {
        console.error('getWeeklyLeaderboard error:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

// ─── GET /achievements/:coolie_id ────────────────────────────────────────────
const getAchievements = async (req, res) => {
    try {
        const { coolie_id } = req.params
        await ensureProfile(coolie_id)
        const achievements = await getCoolieAchievements(coolie_id)
        return res.json({ success: true, data: achievements })
    } catch (err) {
        console.error('getAchievements error:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

// ─── GET /leagues ─────────────────────────────────────────────────────────────
const getLeagues = async (req, res) => {
    try {
        const REWARDS = {
            Bronze:  'Profile badge + visible rank on profile',
            Silver:  'Priority placement in customer search results',
            Gold:    '"Verified Pro" green tag visible to customers',
            Diamond: 'First access to premium/high-value trip requests',
            Master:  '₹50 platform bonus per completed trip',
            Legend:  'Featured on app homepage + special trust badge + ₹100 bonus per trip',
        }

        const leagues = LEAGUE_CONFIG.map(l => ({
            name:   l.name,
            minXP:  l.minXP,
            maxXP:  l.maxXP === Infinity ? null : l.maxXP,
            tiers:  l.tiers,
            tierXP: l.tierXP,
            reward: REWARDS[l.name],
        }))

        return res.json({ success: true, data: leagues })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

// ─── POST /award-xp (internal protected) ────────────────────────────────────
const awardXPRoute = async (req, res) => {
    try {
        const { coolie_id, reason, meta = {} } = req.body

        if (!coolie_id || !reason) {
            return res.status(400).json({ success: false, message: 'coolie_id and reason are required.' })
        }

        await ensureProfile(coolie_id)

        // Handle streak on trip completion
        if (reason === 'trip_completed') {
            await updateStreak(coolie_id)
            const result = await onTripCompleted(coolie_id, meta)
            return res.json({ success: true, data: result })
        }

        const result = await awardXP(coolie_id, reason, meta)
        return res.json({ success: true, data: result })
    } catch (err) {
        console.error('awardXP route error:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

// ─── GET /history/:coolie_id ─────────────────────────────────────────────────
const getXPHistory = async (req, res) => {
    try {
        const { coolie_id } = req.params
        const page  = Math.max(1, parseInt(req.query.page) || 1)
        const limit = Math.min(50, parseInt(req.query.limit) || 20)
        const offset = (page - 1) * limit

        const { rows } = await pool.query(`
            SELECT id, xp_amount, reason, reference_id, created_at
            FROM xp_transactions
            WHERE coolie_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        `, [coolie_id, limit, offset])

        const { rows: countRows } = await pool.query(
            `SELECT COUNT(*) as total FROM xp_transactions WHERE coolie_id = $1`,
            [coolie_id]
        )
        const total = parseInt(countRows[0].total)

        return res.json({
            success: true,
            data:  rows,
            meta:  { page, limit, total, totalPages: Math.ceil(total / limit) },
        })
    } catch (err) {
        console.error('getXPHistory error:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

module.exports = { getProfile, getWeeklyLeaderboard, getAchievements, getLeagues, awardXPRoute, getXPHistory }
