const express = require('express')
const router = express.Router()

const {
    loginAdmin,
    getPendingCoolies, getCoolieDetail, getAllCoolies,
    approveCoolieLevel1, approveCoolieLevel2,
    rejectCoolie, suspendCoolie,
    getAllCustomers, banCustomer,
} = require('../controllers/admin.controller')

const { protectAdmin, requireSuperAdmin } = require('../middleware/adminAuth.middleware')
const { body } = require('express-validator')
const { validate } = require('../middleware/validate.middleware')

// ─── ADMIN AUTH ──────────────────────────────────────────────
// POST /api/admin/login
router.post('/login', [
    body('email').trim().isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
], validate, loginAdmin)

// ─── COOLIE MANAGEMENT ──────────────────────────────────────
// GET /api/admin/coolies/pending
router.get('/coolies/pending', protectAdmin, getPendingCoolies)

// GET /api/admin/coolies — all with filters (?status=pending&station=NDLS&page=1)
router.get('/coolies', protectAdmin, getAllCoolies)

// GET /api/admin/coolies/:id — full detail for review
router.get('/coolies/:id', protectAdmin, getCoolieDetail)

// POST /api/admin/coolies/:id/approve/level1 — Document verification ✅
router.post('/coolies/:id/approve/level1', protectAdmin, approveCoolieLevel1)

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

module.exports = router
