const db = require('../../config/db');

const getAll = async (req, res) => {
    try {
        const { status, type, search, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        let where = ['1=1'];
        let params = [];
        let idx = 1;
        if (status) { where.push(`b.status = $${idx++}`); params.push(status); }
        if (type) { where.push(`b.business_type = $${idx++}`); params.push(type); }
        if (search) { where.push(`b.business_name ILIKE $${idx++}`); params.push(`%${search}%`); }

        const total = parseInt((await db.query(`SELECT COUNT(*) FROM businesses b WHERE ${where.join(' AND ')}`, params)).rows[0].count);
        params.push(limit, offset);
        const result = await db.query(
            `SELECT b.*, bo.full_name as owner_name, bo.email as owner_email
             FROM businesses b JOIN business_owners bo ON bo.id = b.owner_id
             WHERE ${where.join(' AND ')} ORDER BY b.created_at DESC LIMIT $${idx} OFFSET $${idx+1}`,
            params
        );
        res.json({ success: true, data: result.rows, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

const getOne = async (req, res) => {
    try {
        const biz = await db.query('SELECT b.*, bo.full_name, bo.email FROM businesses b JOIN business_owners bo ON bo.id = b.owner_id WHERE b.id = $1', [req.params.businessId]);
        if (biz.rows.length === 0) return res.status(404).json({ success: false, error: { message: 'Not found' } });
        res.json({ success: true, business: biz.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

const approve = async (req, res) => {
    try {
        const { businessId } = req.params;
        await db.query(`UPDATE businesses SET status='approved', admin_reviewed_at=NOW() WHERE id=$1`, [businessId]);
        const biz = await db.query('SELECT owner_id, business_name FROM businesses WHERE id = $1', [businessId]);
        if (biz.rows.length > 0) {
            await db.query(`INSERT INTO business_notifications (owner_id, message) VALUES ($1,$2)`, [biz.rows[0].owner_id, `🎉 Your business "${biz.rows[0].business_name}" has been approved and is now live!`]);
        }
        res.json({ success: true, message: 'Business approved' });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

const reject = async (req, res) => {
    try {
        const { businessId } = req.params;
        const { rejection_reason } = req.body;
        await db.query(`UPDATE businesses SET status='rejected', rejection_reason=$1, admin_reviewed_at=NOW() WHERE id=$2`, [rejection_reason, businessId]);
        const biz = await db.query('SELECT owner_id, business_name FROM businesses WHERE id = $1', [businessId]);
        if (biz.rows.length > 0) {
            await db.query(`INSERT INTO business_notifications (owner_id, message) VALUES ($1,$2)`, [biz.rows[0].owner_id, `Your business "${biz.rows[0].business_name}" was not approved. Reason: ${rejection_reason}`]);
        }
        res.json({ success: true, message: 'Business rejected' });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

const deactivate = async (req, res) => {
    try {
        await db.query(`UPDATE businesses SET is_active=false WHERE id=$1`, [req.params.businessId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

module.exports = { getAll, getOne, approve, reject, deactivate };
