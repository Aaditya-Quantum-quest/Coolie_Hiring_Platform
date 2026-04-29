const express = require('express')
const router = express.Router()

const {
    loginAdmin,
    getPendingCoolies, getCoolieDetail, getAllCoolies,
    approveCoolieLevel1, approveCoolieLevel2,
    rejectCoolie, suspendCoolie,
    getAllCustomers, banCustomer,
    getDashboardStats, getLiveBookings, getRevenueData, getStationCoverage, getUrgentDisputes,
} = require('../controllers/admin.controller')

const { protectAdmin, requireSuperAdmin, requireRegularAdmin } = require('../middleware/adminAuth.middleware')
const { body } = require('express-validator')
const { validate } = require('../middleware/validate.middleware')

// POST /api/admin/login
router.post('/login', [
    body('email').trim().isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
], validate, loginAdmin)

// ─── DASHBOARD STATS ──────────────────────────────────────
// GET /api/admin/dashboard/stats
router.get('/dashboard/stats', protectAdmin, getDashboardStats)

// GET /api/admin/bookings/live
router.get('/bookings/live', protectAdmin, getLiveBookings)

// GET /api/admin/revenue/:period
router.get('/revenue/:period', protectAdmin, getRevenueData)

// GET /api/admin/stations/coverage
router.get('/stations/coverage', protectAdmin, getStationCoverage)

// GET /api/admin/disputes/urgent
router.get('/disputes/urgent', protectAdmin, getUrgentDisputes)

// ─── COOLIE MANAGEMENT ──────────────────────────────────────
// GET /api/admin/coolies/pending
router.get('/coolies/pending', protectAdmin, getPendingCoolies)

// GET /api/admin/coolies — all with filters (?status=pending&station=NDLS&page=1)
router.get('/coolies', protectAdmin, getAllCoolies)

// GET /api/admin/coolies/:id — full detail for review
router.get('/coolies/:id', protectAdmin, getCoolieDetail)

// POST /api/admin/coolies/:id/approve/level1 — Document verification ✅
router.post('/coolies/:id/approve/level1', protectAdmin, requireRegularAdmin, approveCoolieLevel1)

// POST /api/admin/coolies/:id/approve/level2 — Final approval (generates Coolie ID + QR)
// requireSuperAdmin ensures only super admin can do final approval
router.post('/coolies/:id/approve/level2', protectAdmin, requireSuperAdmin, approveCoolieLevel2)

// POST /api/admin/coolies/:id/reject
router.post('/coolies/:id/reject', protectAdmin, [
    body('reason').trim().notEmpty().withMessage('Rejection reason is required').isLength({ min: 5 }),
], validate, rejectCoolie)

// PATCH /api/admin/coolies/:id/suspend
router.patch('/coolies/:id/suspend', protectAdmin, suspendCoolie)

// ─── CUSTOMER MANAGEMENT ────────────────────────────────────
// GET /api/admin/customers
router.get('/customers', protectAdmin, getAllCustomers)

// PATCH /api/admin/customers/:id/ban
router.patch('/customers/:id/ban', protectAdmin, banCustomer)

// ─── BOOKINGS MANAGEMENT ──────────────────────────────────────
router.get('/bookings', protectAdmin, require('../controllers/admin.controller').getAllBookingsAdmin)
router.get('/bookings/:id', protectAdmin, require('../controllers/admin.controller').getBookingDetailAdmin)
router.patch('/bookings/:id/status', protectAdmin, require('../controllers/admin.controller').updateBookingStatusAdmin)

// ─── DISPUTES MANAGEMENT ──────────────────────────────────────
router.get('/disputes', protectAdmin, require('../controllers/admin.controller').getAllDisputes)
router.get('/disputes/:id', protectAdmin, require('../controllers/admin.controller').getDisputeDetails)
router.post('/disputes/:id/resolve', protectAdmin, require('../controllers/admin.controller').resolveDispute)

// ─── ANALYTICS ──────────────────────────────────────
router.get('/analytics', protectAdmin, require('../controllers/admin.controller').getAnalyticsData)
router.get('/analytics/user-growth', protectAdmin, require('../controllers/admin.controller').getUserGrowth)
router.get('/analytics/revenue', protectAdmin, require('../controllers/admin.controller').getRevenueAnalytics)
router.get('/analytics/stations', protectAdmin, require('../controllers/admin.controller').getStationPerformanceAdmin)

module.exports = router
