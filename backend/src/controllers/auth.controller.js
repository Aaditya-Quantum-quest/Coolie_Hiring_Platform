const authService = require('../services/auth.service')
const { sendLockoutEmail } = require('../utils/mailer')
const fs = require('fs')

// ─── COOKIE OPTIONS ─────────────────────────────────────────
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
}
const refreshCookieOptions = {
    ...cookieOptions,
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000,
}

const cleanupFiles = (files) => {
    if (!files) return
    Object.values(files).flat().forEach((f) => { try { fs.unlinkSync(f.path) } catch (_) { } })
}

// ═══════════════════════════════════════════════════════════
// CUSTOMER CONTROLLERS
// ═══════════════════════════════════════════════════════════

const registerCustomer = async (req, res) => {
    try {
        const { name, email, password, phone, city } = req.body

        const [existingEmail, existingPhone] = await Promise.all([
            authService.findCustomerByEmail(email),
            authService.findCustomerByPhone(phone),
        ])
        if (existingEmail) return res.status(409).json({ success: false, message: 'Email already registered.' })
        if (existingPhone) return res.status(409).json({ success: false, message: 'Phone number already registered.' })

        const customer = await authService.createCustomer({ name, email, password, phone, city })
        const payload = { id: customer.id, email: customer.email, role: 'customer' }
        const { accessToken, refreshToken } = authService.generateTokens(payload)
        await authService.storeRefreshToken(customer.id, 'customer', refreshToken)

        res.cookie('access_token', accessToken, cookieOptions)
            .cookie('refresh_token', refreshToken, refreshCookieOptions)
            .status(201).json({
                success: true,
                message: 'Account created successfully!',
                user: { ...customer, role: 'customer' },
            })
    } catch (err) {
        console.error('registerCustomer:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body

        const customer = await authService.findCustomerByEmail(email)
        if (!customer) return res.status(401).json({ success: false, message: 'Invalid email or password.' })
        if (customer.is_banned) return res.status(403).json({ success: false, message: 'Account banned. Contact support.' })

        // Check lockout
        if (customer.locked_until && new Date(customer.locked_until) > new Date()) {
            const remaining = Math.ceil((new Date(customer.locked_until) - new Date()) / 60000)
            return res.status(429).json({
                success: false,
                message: `Account locked due to too many failed attempts. Try again in ${remaining} minutes.`,
            })
        }

        const isMatch = await authService.comparePassword(password, customer.password_hash)
        if (!isMatch) {
            const attempts = await authService.incrementCustomerAttempts(customer.id)
            if (attempts >= authService.MAX_ATTEMPTS) {
                sendLockoutEmail(customer.email, customer.name).catch(console.error)
                return res.status(429).json({ success: false, message: 'Too many failed attempts. Account locked for 30 minutes.' })
            }
            return res.status(401).json({
                success: false,
                message: `Invalid email or password. ${authService.MAX_ATTEMPTS - attempts} attempt(s) remaining.`,
            })
        }

        // Success — reset attempts
        await authService.resetCustomerAttempts(customer.id)

        const payload = { id: customer.id, email: customer.email, role: 'customer' }
        const { accessToken, refreshToken } = authService.generateTokens(payload)
        await authService.storeRefreshToken(customer.id, 'customer', refreshToken)

        res.cookie('access_token', accessToken, cookieOptions)
            .cookie('refresh_token', refreshToken, refreshCookieOptions)
            .status(200).json({
                success: true,
                message: 'Login successful!',
                user: {
                    id: customer.id, name: customer.name, email: customer.email,
                    phone: customer.phone, city: customer.city,
                    profile_photo_url: customer.profile_photo_url, role: 'customer',
                },
            })
    } catch (err) {
        console.error('loginCustomer:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

// ═══════════════════════════════════════════════════════════
// COOLIE CONTROLLERS
// ═══════════════════════════════════════════════════════════

const registerCoolie = async (req, res) => {
    try {
        const files = req.files || {}
        const { email, phone, aadhaar_number } = req.body

        // Validate required files
        const missingFiles = []
        if (!files.passport_photo?.length) missingFiles.push('passport_photo (your passport size photo)')
        if (!files.aadhaar_front?.length) missingFiles.push('aadhaar_front (Aadhaar card — front side)')
        if (!files.aadhaar_back?.length) missingFiles.push('aadhaar_back (Aadhaar card — back side)')
        if (!files.secondary_doc?.length) missingFiles.push('secondary_doc (Voter ID / PAN / Driving License)')

        if (missingFiles.length > 0) {
            cleanupFiles(files)
            return res.status(422).json({ success: false, message: 'Required documents missing.', missing: missingFiles })
        }

        // Duplicate checks
        const [eEmail, ePhone, eAadhaar] = await Promise.all([
            authService.findCoolieByEmail(email),
            authService.findCoolieByPhone(phone),
            authService.findCoolieByAadhaarHash(aadhaar_number),
        ])

        if (eEmail) { cleanupFiles(files); return res.status(409).json({ success: false, message: 'Email already registered.' }) }
        if (ePhone) { cleanupFiles(files); return res.status(409).json({ success: false, message: 'Phone already registered.' }) }
        if (eAadhaar) { cleanupFiles(files); return res.status(409).json({ success: false, message: 'Aadhaar number already registered.' }) }

        const coolie = await authService.createCoolie(req.body, files)

        // Note: NO JWT issued yet — coolie cannot login until approved
        res.status(201).json({
            success: true,
            message: 'Registration submitted! Your documents are under review. You will receive a Coolie ID via email once approved.',
            data: {
                name: coolie.name,
                email: coolie.email,
                station_name: coolie.station_name,
                verification_status: coolie.verification_status,
            },
        })
    } catch (err) {
        console.error('registerCoolie:', err)
        if (req.files) cleanupFiles(req.files)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

/**
 * 🔐 Coolie Login — uses COOLIE ID + Password (NOT email)
 * Coolie ID is only issued after admin approval.
 */
const loginCoolie = async (req, res) => {
    try {
        const { coolie_id, password } = req.body

        // Find by Coolie ID
        const coolie = await authService.findCoolieByCoolieId(coolie_id)

        // Generic error to prevent enumeration
        if (!coolie) {
            return res.status(401).json({ success: false, message: 'Invalid Coolie ID or password.' })
        }

        // Must be approved before login
        if (!coolie.is_active || !coolie.is_verified || coolie.verification_status !== 'approved') {
            return res.status(403).json({
                success: false,
                message: 'Your account is pending verification. You will receive an email with your Coolie ID once approved.',
                verification_status: coolie.verification_status,
            })
        }

        if (coolie.is_suspended) {
            return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' })
        }

        // Check lockout
        if (coolie.locked_until && new Date(coolie.locked_until) > new Date()) {
            const remaining = Math.ceil((new Date(coolie.locked_until) - new Date()) / 60000)
            return res.status(429).json({
                success: false,
                message: `Account locked. Too many failed attempts. Try again in ${remaining} minutes.`,
            })
        }

        // Password check
        const isMatch = await authService.comparePassword(password, coolie.password_hash)
        if (!isMatch) {
            const attempts = await authService.incrementCoolieAttempts(coolie.id)
            if (attempts >= authService.MAX_ATTEMPTS) {
                // Send lockout email and return lock message
                sendLockoutEmail(coolie.email, coolie.name).catch(console.error)
                return res.status(429).json({
                    success: false,
                    message: 'Too many failed attempts. Account locked for 30 minutes. A security alert has been sent to your email.',
                })
            }
            return res.status(401).json({
                success: false,
                message: `Invalid Coolie ID or password. ${authService.MAX_ATTEMPTS - attempts} attempt(s) remaining.`,
            })
        }

        // ✅ Login successful — reset attempts
        await authService.resetCoolieAttempts(coolie.id)

        const payload = { id: coolie.id, email: coolie.email, role: 'coolie' }
        const { accessToken, refreshToken } = authService.generateTokens(payload)
        await authService.storeRefreshToken(coolie.id, 'coolie', refreshToken)

        res.cookie('access_token', accessToken, cookieOptions)
            .cookie('refresh_token', refreshToken, refreshCookieOptions)
            .status(200).json({
                success: true,
                message: `Welcome back, ${coolie.name}!`,
                user: {
                    id: coolie.id,
                    coolie_id: coolie.coolie_id,
                    name: coolie.name,
                    email: coolie.email,
                    phone: coolie.phone,
                    station_name: coolie.station_name,
                    passport_photo_url: coolie.passport_photo_url,
                    qr_code_url: coolie.qr_code_url,
                    rating_avg: coolie.rating_avg,
                    total_trips: coolie.total_trips,
                    badge: coolie.badge,
                    is_verified: coolie.is_verified,
                    role: 'coolie',
                },
            })
    } catch (err) {
        console.error('loginCoolie:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

// ═══════════════════════════════════════════════════════════
// SHARED CONTROLLERS
// ═══════════════════════════════════════════════════════════

const getMe = async (req, res) => {
    try {
        const { id, role } = req.user
        const user = role === 'coolie'
            ? await authService.getCoolieById(id)
            : await authService.getCustomerById(id)

        if (!user) return res.status(404).json({ success: false, message: 'User not found.' })
        res.status(200).json({ success: true, user: { ...user, role } })
    } catch (err) {
        console.error('getMe:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

const refreshAccessToken = async (req, res) => {
    try {
        const refresh_token_cookie = req.cookies?.refresh_token
        if (!refresh_token_cookie) return res.status(401).json({ success: false, message: 'No refresh token.' })

        let decoded
        try {
            decoded = require('jsonwebtoken').verify(refresh_token_cookie, process.env.JWT_SECRET)
        } catch {
            return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' })
        }

        const stored = await authService.verifyRefreshToken(refresh_token_cookie, decoded.role)
        if (!stored) return res.status(401).json({ success: false, message: 'Token revoked or expired.' })

        const payload = { id: decoded.id, email: decoded.email, role: decoded.role }
        const { accessToken, refreshToken: newRefresh } = authService.generateTokens(payload)
        await authService.storeRefreshToken(decoded.id, decoded.role, newRefresh)

        res.cookie('access_token', accessToken, cookieOptions)
            .cookie('refresh_token', newRefresh, refreshCookieOptions)
            .status(200).json({ success: true, message: 'Token refreshed.' })
    } catch (err) {
        console.error('refreshAccessToken:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

const logout = async (req, res) => {
    try {
        await authService.deleteRefreshToken(req.user.id, req.user.role)
        res.clearCookie('access_token')
            .clearCookie('refresh_token', { path: '/api/auth/refresh' })
            .status(200).json({ success: true, message: 'Logged out successfully.' })
    } catch (err) {
        console.error('logout:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

module.exports = { registerCustomer, loginCustomer, registerCoolie, loginCoolie, getMe, refreshAccessToken, logout }
