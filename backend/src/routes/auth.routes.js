const express = require('express')
const router = express.Router()

const {
    registerCustomer,
    loginCustomer,
    registerCoolie,
    loginCoolie,
    getMe,
    refreshAccessToken,
    logout,
    requestPasswordReset,
    resetPassword,
} = require('../controllers/auth.controller')

const { protect } = require('../middleware/auth.middleware')
const { validate } = require('../middleware/validate.middleware')
const { coolieUpload } = require('../config/multer')

const {
    customerRegisterRules,
    customerLoginRules,
    coolieRegisterRules,
    coolieLoginRules,
} = require('../validators/auth.validator')

// ─── CUSTOMER ─────────────────────────────────────────────────────
// POST /api/auth/customer/register
router.post('/customer/register', customerRegisterRules, validate, registerCustomer)

// POST /api/auth/customer/login
router.post('/customer/login', customerLoginRules, validate, loginCustomer)

// ─── COOLIE ───────────────────────────────────────────────────────
// POST /api/auth/coolie/register — multipart/form-data with document images
// Multer runs FIRST, then validators run on parsed body fields
router.post(
    '/coolie/register',
    coolieUpload,               // parse multipart: extracts files + body fields
    coolieRegisterRules,        // validate body fields
    validate,                   // respond with errors if any
    registerCoolie              // create coolie in DB
)

// POST /api/auth/coolie/login
router.post('/coolie/login', coolieLoginRules, validate, loginCoolie)

// ─── SHARED ───────────────────────────────────────────────────────
// GET /api/auth/me — get current logged-in user
router.get('/me', protect, getMe)

// POST /api/auth/refresh — refresh access token using refresh cookie
router.post('/refresh', refreshAccessToken)

// POST /api/auth/logout — protected, clears cookies
router.post('/logout', protect, logout)

// ─── PASSWORD RESET ───────────────────────────────────────
// POST /api/auth/forgot-password — request password reset OTP
router.post('/forgot-password', requestPasswordReset)

// POST /api/auth/reset-password — reset password with OTP
router.post('/reset-password', resetPassword)

module.exports = router
