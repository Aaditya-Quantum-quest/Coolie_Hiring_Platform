const jwt = require('jsonwebtoken')
const pool = require('../config/db')

/**
 * Middleware: verifies the access token from HTTP-only cookie.
 * Attaches req.user = { id, email, role: 'customer' | 'coolie' }
 */
const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.access_token

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authenticated. Please login.' })
        }

        let decoded
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET)
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ success: false, message: 'Session expired. Please login again.' })
            }
            return res.status(401).json({ success: false, message: 'Invalid token.' })
        }

        // Verify user still exists and is active
        const table = decoded.role === 'coolie' ? 'coolies' : 'customers'
        const statusColumn = decoded.role === 'coolie' ? 'is_suspended' : 'is_banned'
        
        const result = await pool.query(
            `SELECT id, name, email, is_active, ${statusColumn} as is_blocked FROM ${table} WHERE id = $1`,
            [decoded.id]
        )

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'User no longer exists.' })
        }

        const user = result.rows[0]

        if (!user.is_active) {
            return res.status(403).json({ success: false, message: 'Account deactivated. Contact support.' })
        }

        if (user.is_blocked) {
            return res.status(403).json({ success: false, message: 'Account suspended/banned. Contact support.' })
        }

        req.user = { id: decoded.id, email: decoded.email, role: decoded.role, name: user.name }
        next()
    } catch (err) {
        console.error('Auth middleware error:', err)
        res.status(500).json({ success: false, message: 'Server error during authentication.' })
    }
}

/**
 * Middleware: restrict access to specific roles
 * Usage: restrictTo('admin', 'coolie')
 */
const restrictTo = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
        return res.status(403).json({
            success: false,
            message: `Access denied. This route is for: ${roles.join(', ')} only.`,
        })
    }
    next()
}

module.exports = { protect, restrictTo }
