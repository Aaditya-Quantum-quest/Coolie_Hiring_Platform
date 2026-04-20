/**
 * rankings.routes.js — All routes under /api/v1/rankings
 */

const express = require('express')
const router  = express.Router()
const rateLimit = require('express-rate-limit')
const { body, param, query } = require('express-validator')
const { validate } = require('../middleware/validate.middleware')
const { protect, restrictTo } = require('../middleware/auth.middleware')

const {
    getProfile,
    getWeeklyLeaderboard,
    getAchievements,
    getLeagues,
    awardXPRoute,
    getXPHistory,
} = require('../controllers/rankings.controller')

// ─── Rate limiter for XP award endpoint ──────────────────────────────────────
const xpAwardLimiter = rateLimit({
    windowMs: 60 * 1000,  // 1 minute
    max: 20,
    message: { success: false, message: 'Too many XP award requests.' },
    keyGenerator: (req) => req.body?.coolie_id || req.ip,
})

// ─── Internal service key middleware ─────────────────────────────────────────
const requireServiceKey = (req, res, next) => {
    const key = req.headers['x-service-key']
    if (!key || key !== process.env.INTERNAL_SERVICE_KEY) {
        return res.status(403).json({ success: false, message: 'Forbidden. Internal endpoint.' })
    }
    next()
}

// ─── PUBLIC / COOLIE-PROTECTED ROUTES ────────────────────────────────────────

// GET /api/v1/rankings/leagues — no auth needed (static data)
router.get('/leagues', getLeagues)

// GET /api/v1/rankings/profile/:coolie_id
router.get(
    '/profile/:coolie_id',
    protect,
    [param('coolie_id').isUUID().withMessage('Invalid coolie ID')],
    validate,
    getProfile
)

// GET /api/v1/rankings/leaderboard/weekly
router.get('/leaderboard/weekly', protect, getWeeklyLeaderboard)

// GET /api/v1/rankings/achievements/:coolie_id
router.get(
    '/achievements/:coolie_id',
    protect,
    [param('coolie_id').isUUID().withMessage('Invalid coolie ID')],
    validate,
    getAchievements
)

// GET /api/v1/rankings/history/:coolie_id
router.get(
    '/history/:coolie_id',
    protect,
    [
        param('coolie_id').isUUID().withMessage('Invalid coolie ID'),
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 50 }),
    ],
    validate,
    getXPHistory
)

// ─── INTERNAL PROTECTED ROUTE ─────────────────────────────────────────────────

// POST /api/v1/rankings/award-xp
router.post(
    '/award-xp',
    requireServiceKey,
    xpAwardLimiter,
    [
        body('coolie_id').isUUID().withMessage('Invalid coolie_id'),
        body('reason').isString().notEmpty().withMessage('reason is required'),
        body('meta').optional().isObject(),
    ],
    validate,
    awardXPRoute
)

module.exports = router
