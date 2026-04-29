const jwt = require('jsonwebtoken')
const pool = require('../config/db')

/**
 * Middleware to verify admin JWT cookie.
 * Attaches req.user = { id, email, role: 'admin', adminRole: 'super_admin'|'admin' }
 */
const protectAdmin = async (req, res, next) => {
    try {
        const token = req.cookies?.access_token
        if (!token) return res.status(401).json({ success: false, message: 'Admin authentication required.' })

        let decoded
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET)
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ success: false, message: 'Session expired. Please login again.' })
            }
            return res.status(401).json({ success: false, message: 'Invalid token.' })
        }

        if (decoded.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access only.' })
        }

        const result = await pool.query(
            'SELECT id, name, email, role, is_active FROM admins WHERE id=$1',
            [decoded.id]
        )

        if (!result.rows.length || !result.rows[0].is_active) {
            return res.status(401).json({ success: false, message: 'Admin account not found or disabled.' })
        }

        req.user = { ...decoded, adminRole: result.rows[0].role, name: result.rows[0].name }
        next()
    } catch (err) {
        console.error('Admin auth error:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

/**
 * Only allow super_admin to perform certain actions
 */
const requireSuperAdmin = (req, res, next) => {
    if (req.user?.adminRole !== 'super_admin') {
        return res.status(403).json({ success: false, message: 'Super Admin access required for this action.' })
    }
    next()
}

/**
 * Only allow regular admins to perform Level 1
 */
const requireRegularAdmin = (req, res, next) => {
    if (req.user?.adminRole !== 'admin') {
        return res.status(403).json({ success: false, message: 'Regular Admin access required for this action.' })
    }
    next()
}

module.exports = { protectAdmin, requireSuperAdmin, requireRegularAdmin }
