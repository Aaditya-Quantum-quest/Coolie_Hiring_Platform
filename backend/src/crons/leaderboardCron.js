/**
 * leaderboardCron.js — Weekly Monday 00:01 cron: snapshot leaderboard, distribute prizes, reset weekly XP
 * Schedule: '1 0 * * 1'  (every Monday at 00:01 IST)
 */

const cron = require('node-cron')
const pool = require('../config/db')
const { fireNotification } = require('../services/leagueService')

function getPrize(rank) {
    const prizes = { 1: 500, 2: 300, 3: 200 }
    return prizes[rank] || 0  // ranks 4–10 get platform credits (handled separately)
}

function getPlatformCredit(rank) {
    if (rank >= 4 && rank <= 10) return { days: 7, description: '7 days free subscription' }
    return null
}

function getNextMonday() {
    const d = new Date()
    d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7 || 7))
    d.setHours(0, 1, 0, 0)
    return d
}

async function runLeaderboardJob() {
    console.log('[LeaderboardCron] Starting weekly leaderboard snapshot...')

    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        // 1. Read all coolies sorted by weekly XP
        const { rows: coolies } = await client.query(`
            SELECT p.coolie_id, c.name, c.coolie_id as coolie_code,
                   p.weekly_xp, p.current_league, p.current_tier
            FROM coolie_xp_profiles p
            JOIN coolies c ON c.id = p.coolie_id
            ORDER BY p.weekly_xp DESC
        `)

        // 2. Assign ranks
        const rankings = coolies.map((row, i) => ({
            coolie_id:  row.coolie_id,
            name:       row.name,
            coolie_code: row.coolie_code,
            weekly_xp:  row.weekly_xp,
            league:     row.current_league,
            tier:       row.current_tier,
            rank:       i + 1,
        }))

        // 3. Determine week bounds
        const now        = new Date()
        const weekStart  = new Date(now); weekStart.setDate(now.getDate() - now.getDay() + 1); weekStart.setHours(0, 0, 0, 0)
        const weekEnd    = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6); weekEnd.setHours(23, 59, 59, 999)

        // 4. Save snapshot
        const snap = await client.query(`
            INSERT INTO weekly_leaderboard (week_start, week_end, rankings, prizes_paid)
            VALUES ($1, $2, $3, FALSE)
            RETURNING id
        `, [weekStart, weekEnd, JSON.stringify(rankings)])
        const leaderboardId = snap.rows[0].id

        // 5. Reset weekly XP for all coolies
        await client.query(`
            UPDATE coolie_xp_profiles
            SET weekly_xp = 0, weekly_xp_reset_date = NOW(), updated_at = NOW()
        `)

        // 6. Distribute prizes (top 10)
        for (const entry of rankings.slice(0, 10)) {
            const bonus = getPrize(entry.rank)
            const credit = getPlatformCredit(entry.rank)

            if (bonus > 0) {
                // Add to coolie wallet — adjust column name to match your schema
                await client.query(`
                    UPDATE coolies SET wallet_balance = COALESCE(wallet_balance, 0) + $1 WHERE id = $2
                `, [bonus, entry.coolie_id]).catch(() => {
                    // wallet_balance column may not exist yet — silently skip
                })
            }

            // Notify top 10
            fireNotification(entry.coolie_id, 'weekly_prize', {
                rank: entry.rank,
                bonus,
                credit,
                weeklyXP: entry.weekly_xp,
            })
        }

        // 7. Mark prizes paid
        await client.query(`UPDATE weekly_leaderboard SET prizes_paid = TRUE WHERE id = $1`, [leaderboardId])

        await client.query('COMMIT')
        console.log(`[LeaderboardCron] Snapshot saved. Processed ${rankings.length} coolies. Next run: ${getNextMonday()}`)
    } catch (err) {
        await client.query('ROLLBACK')
        console.error('[LeaderboardCron] FAILED:', err.message)
    } finally {
        client.release()
    }
}

// Schedule: every Monday at 00:01 AM IST
cron.schedule('1 0 * * 1', runLeaderboardJob, {
    timezone: 'Asia/Kolkata',
})

module.exports = { runLeaderboardJob }
