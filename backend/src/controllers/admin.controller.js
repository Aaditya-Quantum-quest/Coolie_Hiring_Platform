const authService = require('../services/auth.service')
const pool = require('../config/db')

// ─── ADMIN LOGIN ────────────────────────────────────────────

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

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body
        const admin = await authService.findAdminByEmail(email)

        if (!admin || !admin.is_active) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' })
        }

        const isMatch = await authService.comparePassword(password, admin.password_hash)
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials.' })

        const payload = { id: admin.id, email: admin.email, role: 'admin', adminRole: admin.role }
        const { accessToken, refreshToken } = authService.generateTokens(payload)
        await authService.storeRefreshToken(admin.id, 'admin', refreshToken)

        res.cookie('access_token', accessToken, cookieOptions)
            .cookie('refresh_token', refreshToken, refreshCookieOptions)
            .status(200).json({
                success: true,
                message: 'Admin login successful!',
                user: { id: admin.id, name: admin.name, email: admin.email, role: 'admin', adminRole: admin.role },
            })
    } catch (err) {
        console.error('loginAdmin:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

// ─── PENDING COOLIES LIST ────────────────────────────────────

/**
 * GET /api/admin/coolies/pending
 * Returns all coolies awaiting verification
 */
const getPendingCoolies = async (req, res) => {
    try {
        const coolies = await authService.getPendingCoolies()
        res.status(200).json({ success: true, count: coolies.length, data: coolies })
    } catch (err) {
        console.error('getPendingCoolies:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

/**
 * GET /api/admin/coolies/:id
 * Get full coolie details for review (documents, all fields)
 */
const getCoolieDetail = async (req, res) => {
    try {
        const coolie = await authService.getCoolieForAdmin(req.params.id)
        if (!coolie) return res.status(404).json({ success: false, message: 'Coolie not found.' })
        res.status(200).json({ success: true, data: coolie })
    } catch (err) {
        console.error('getCoolieDetail:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

/**
 * GET /api/admin/coolies — All coolies with filter
 */
const getAllCoolies = async (req, res) => {
    try {
        const { status, station, page = 1, limit = 20 } = req.query
        const offset = (page - 1) * limit

        let query = `
            SELECT id, coolie_id, name, email, phone, station_name, city,
                   passport_photo_url, verification_status, is_verified, is_active, is_suspended,
                   rating_avg, total_trips, badge, created_at
            FROM coolies WHERE 1=1`
        const params = []

        if (status) {
            params.push(status)
            query += ` AND verification_status = $${params.length}`
        }
        if (station) {
            params.push(`%${station}%`)
            query += ` AND station_name ILIKE $${params.length}`
        }

        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
        params.push(limit, offset)

        const result = await pool.query(query, params)
        const countResult = await pool.query(
            `SELECT COUNT(*) FROM coolies WHERE 1=1${status ? ` AND verification_status = '${status}'` : ''}`
        )

        res.status(200).json({
            success: true,
            total: parseInt(countResult.rows[0].count),
            page: parseInt(page),
            data: result.rows,
        })
    } catch (err) {
        console.error('getAllCoolies:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

// ─── TWO-LEVEL APPROVAL ──────────────────────────────────────

/**
 * POST /api/admin/coolies/:id/approve/level1
 * Level 1: Document verification passed
 */
const approveCoolieLevel1 = async (req, res) => {
    try {
        const { id } = req.params
        const adminId = req.user.id

        const coolie = await authService.getCoolieForAdmin(id)
        if (!coolie) return res.status(404).json({ success: false, message: 'Coolie not found.' })

        if (coolie.verification_status !== 'pending') {
            return res.status(400).json({ success: false, message: `Cannot approve: current status is "${coolie.verification_status}".` })
        }

        await authService.approveLevel1(id, adminId)

        res.status(200).json({
            success: true,
            message: `✅ Level 1 (Document Verification) approved for ${coolie.name}. Awaiting Level 2 final approval.`,
        })
    } catch (err) {
        console.error('approveCoolieLevel1:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

/**
 * POST /api/admin/coolies/:id/approve/level2
 * Level 2: Final approval — generates Coolie ID + QR code
 */
const approveCoolieLevel2 = async (req, res) => {
    try {
        const { id } = req.params
        const adminId = req.user.id

        const coolie = await authService.getCoolieForAdmin(id)
        if (!coolie) return res.status(404).json({ success: false, message: 'Coolie not found.' })

        if (coolie.verification_status !== 'level1_approved') {
            return res.status(400).json({
                success: false,
                message: `Cannot do Level 2 approval: current status is "${coolie.verification_status}". Level 1 must be done first.`,
            })
        }

        const result = await authService.approveLevel2(id, adminId)

        res.status(200).json({
            success: true,
            message: `🎉 ${coolie.name} is now APPROVED! Coolie ID: ${result.coolie_id}. Approval email sent.`,
            coolie_id: result.coolie_id,
            qr_code_url: result.qr_code_url,
        })
    } catch (err) {
        console.error('approveCoolieLevel2:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

/**
 * POST /api/admin/coolies/:id/reject
 * Reject coolie with reason
 */
const rejectCoolie = async (req, res) => {
    try {
        const { id } = req.params
        const { reason } = req.body

        if (!reason || reason.trim().length < 5) {
            return res.status(422).json({ success: false, message: 'Please provide a rejection reason (min 5 characters).' })
        }

        const coolie = await authService.getCoolieForAdmin(id)
        if (!coolie) return res.status(404).json({ success: false, message: 'Coolie not found.' })

        if (coolie.verification_status === 'approved') {
            return res.status(400).json({ success: false, message: 'Cannot reject an already approved coolie.' })
        }

        await authService.rejectCoolie(id, req.user.id, reason)

        res.status(200).json({ success: true, message: `Coolie ${coolie.name} has been rejected. Rejection email sent.` })
    } catch (err) {
        console.error('rejectCoolie:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

/**
 * PATCH /api/admin/coolies/:id/suspend
 */
const suspendCoolie = async (req, res) => {
    try {
        const { id } = req.params
        const { suspend = true } = req.body

        await pool.query('UPDATE coolies SET is_suspended=$1 WHERE id=$2', [suspend, id])

        res.status(200).json({
            success: true,
            message: `Coolie account ${suspend ? 'suspended' : 'reinstated'}.`,
        })
    } catch (err) {
        console.error('suspendCoolie:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

// ─── CUSTOMER MANAGEMENT ─────────────────────────────────────

const getAllCustomers = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query
        const offset = (page - 1) * limit

        const result = await pool.query(
            `SELECT id, name, email, phone, city, is_active, is_banned, created_at
             FROM customers ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
            [limit, offset]
        )
        const countResult = await pool.query('SELECT COUNT(*) FROM customers')

        res.status(200).json({
            success: true,
            total: parseInt(countResult.rows[0].count),
            page: parseInt(page),
            data: result.rows,
        })
    } catch (err) {
        console.error('getAllCustomers:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

const banCustomer = async (req, res) => {
    try {
        const { id } = req.params
        const { ban = true } = req.body
        await pool.query('UPDATE customers SET is_banned=$1 WHERE id=$2', [ban, id])
        res.status(200).json({ success: true, message: `Customer ${ban ? 'banned' : 'unbanned'}.` })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

module.exports = {
    loginAdmin,
    getPendingCoolies, getCoolieDetail, getAllCoolies,
    approveCoolieLevel1, approveCoolieLevel2,
    rejectCoolie, suspendCoolie,
    getAllCustomers, banCustomer,
}
