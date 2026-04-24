const jwt = require('jsonwebtoken');
const db = require('../config/db');

const BUSINESS_JWT_SECRET = process.env.BUSINESS_JWT_SECRET || 'business_secret_key_change_in_prod';

const authenticateOwner = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: { code: 'NO_TOKEN', message: 'No token provided' } });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, BUSINESS_JWT_SECRET);

        const result = await db.query(
            'SELECT bo.*, b.id as business_id, b.business_type, b.status, b.business_name FROM business_owners bo JOIN businesses b ON b.owner_id = bo.id WHERE bo.id = $1',
            [decoded.owner_id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Owner not found' } });
        }

        req.owner = result.rows[0];
        req.businessId = result.rows[0].business_id;
        req.businessType = result.rows[0].business_type;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } });
    }
};

const checkBusinessType = (type) => (req, res, next) => {
    if (req.businessType !== type) {
        return res.status(403).json({
            success: false,
            error: { code: 'WRONG_TYPE', message: `This route is only for ${type} owners` }
        });
    }
    next();
};

module.exports = { authenticateOwner, checkBusinessType, BUSINESS_JWT_SECRET };
