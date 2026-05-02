const db = require('../../config/db');
const {
    sendBusinessLevel1ApprovalEmail,
    sendBusinessLevel2ApprovalEmail,
    sendBusinessRejectionEmail
} = require('../../utils/mailer');

const getAll = async (req, res) => {
    try {
        const { status, type, search, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        let where = ['1=1'];
        let params = [];
        let idx = 1;
        if (status) { where.push(`b.verification_status = $${idx++}`); params.push(status); }
        if (type) { where.push(`b.business_type = $${idx++}`); params.push(type); }
        if (search) { where.push(`(b.business_name ILIKE $${idx} OR bo.email ILIKE $${idx})`); params.push(`%${search}%`); idx++; }

        const total = parseInt((await db.query(`SELECT COUNT(*) FROM businesses b JOIN business_owners bo ON bo.id = b.owner_id WHERE ${where.join(' AND ')}`, params)).rows[0].count);
        params.push(limit, offset);
        const result = await db.query(
            `SELECT b.id, b.business_name, b.business_type, b.city, b.state, b.status,
                    b.verification_level, b.verification_status, b.rejection_reason,
                    b.level1_approved_at, b.level2_approved_at, b.created_at,
                    b.logo_url, b.cover_photo_url,
                    bo.id as owner_id, bo.full_name as owner_name, bo.email as owner_email, bo.phone_primary as owner_phone
             FROM businesses b JOIN business_owners bo ON bo.id = b.owner_id
             WHERE ${where.join(' AND ')} ORDER BY b.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
            params
        );
        res.json({ success: true, data: result.rows, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) });
    } catch (err) {
        console.error('getAll businesses error:', err);
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

const getOne = async (req, res) => {
    try {
        const biz = await db.query(
            `SELECT b.*, bo.full_name, bo.email, bo.phone_primary, bo.phone_alternate, bo.whatsapp_number, bo.website_url
             FROM businesses b JOIN business_owners bo ON bo.id = b.owner_id WHERE b.id = $1`,
            [req.params.businessId]
        );
        if (biz.rows.length === 0) return res.status(404).json({ success: false, error: { message: 'Not found' } });

        // Get hotel or restaurant specific details
        const business = biz.rows[0];
        if (business.business_type === 'hotel') {
            const hotel = await db.query('SELECT * FROM hotel_details WHERE business_id = $1', [business.id]);
            const rooms = await db.query('SELECT * FROM room_types WHERE business_id = $1', [business.id]);
            business.hotel_details = hotel.rows[0] || null;
            business.room_types = rooms.rows;
        } else if (business.business_type === 'restaurant') {
            const rest = await db.query('SELECT * FROM restaurant_details WHERE business_id = $1', [business.id]);
            business.restaurant_details = rest.rows[0] || null;
        }

        const photos = await db.query('SELECT * FROM business_photos WHERE business_id = $1', [business.id]);
        business.photos = photos.rows;

        res.json({ success: true, business });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

// Level 1 approval — done by regular admin (business details review)
const approveLevel1 = async (req, res) => {
    try {
        const { businessId } = req.params;
        const adminId = req.admin?.id || null;

        await db.query(
            `UPDATE businesses SET 
                verification_level = 1, 
                verification_status = 'level1_approved',
                status = 'approved',
                level1_approved_at = NOW(),
                level1_approved_by = $2
             WHERE id = $1`,
            [businessId, adminId]
        );

        const biz = await db.query(
            'SELECT b.business_name, b.owner_id, bo.full_name, bo.email FROM businesses b JOIN business_owners bo ON bo.id = b.owner_id WHERE b.id = $1',
            [businessId]
        );

        if (biz.rows.length > 0) {
            const { business_name, owner_id, full_name, email } = biz.rows[0];
            await db.query(
                `INSERT INTO business_notifications (owner_id, message) VALUES ($1,$2)`,
                [owner_id, `✅ Your business "${business_name}" has passed Level 1 verification! You can now log in to your portal.`]
            );
            sendBusinessLevel1ApprovalEmail(email, full_name, business_name).catch(e =>
                console.warn('[MAILER] Level1 email failed:', e.message)
            );
        }

        res.json({ success: true, message: 'Business Level 1 approved' });
    } catch (err) {
        console.error('approveLevel1 error:', err);
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

// Level 2 approval — done by super admin (owner identity review)
const approveLevel2 = async (req, res) => {
    try {
        const { businessId } = req.params;
        const adminId = req.admin?.id || null;

        await db.query(
            `UPDATE businesses SET 
                verification_level = 2, 
                verification_status = 'fully_approved',
                level2_approved_at = NOW(),
                level2_approved_by = $2
             WHERE id = $1`,
            [businessId, adminId]
        );

        const biz = await db.query(
            'SELECT b.business_name, b.owner_id, bo.full_name, bo.email FROM businesses b JOIN business_owners bo ON bo.id = b.owner_id WHERE b.id = $1',
            [businessId]
        );

        if (biz.rows.length > 0) {
            const { business_name, owner_id, full_name, email } = biz.rows[0];
            await db.query(
                `INSERT INTO business_notifications (owner_id, message) VALUES ($1,$2)`,
                [owner_id, `🎉 Your business "${business_name}" is now LIVE on CoolieSeva! Level 2 verification complete.`]
            );
            sendBusinessLevel2ApprovalEmail(email, full_name, business_name).catch(e =>
                console.warn('[MAILER] Level2 email failed:', e.message)
            );
        }

        res.json({ success: true, message: 'Business Level 2 approved — now fully live' });
    } catch (err) {
        console.error('approveLevel2 error:', err);
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

const reject = async (req, res) => {
    try {
        const { businessId } = req.params;
        const { rejection_reason } = req.body;

        await db.query(
            `UPDATE businesses SET 
                status = 'rejected', 
                verification_status = 'rejected',
                rejection_reason = $1, 
                admin_reviewed_at = NOW() 
             WHERE id = $2`,
            [rejection_reason, businessId]
        );

        const biz = await db.query(
            'SELECT b.business_name, b.owner_id, bo.full_name, bo.email FROM businesses b JOIN business_owners bo ON bo.id = b.owner_id WHERE b.id = $1',
            [businessId]
        );

        if (biz.rows.length > 0) {
            const { business_name, owner_id, full_name, email } = biz.rows[0];
            await db.query(
                `INSERT INTO business_notifications (owner_id, message) VALUES ($1,$2)`,
                [owner_id, `Your business "${business_name}" was not approved. Reason: ${rejection_reason}`]
            );
            sendBusinessRejectionEmail(email, full_name, business_name, rejection_reason).catch(e =>
                console.warn('[MAILER] Rejection email failed:', e.message)
            );
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

// Get stats for admin dashboard
const getStats = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                COUNT(*) FILTER (WHERE verification_status = 'pending') as pending,
                COUNT(*) FILTER (WHERE verification_status = 'level1_approved') as level1_approved,
                COUNT(*) FILTER (WHERE verification_status = 'fully_approved') as fully_approved,
                COUNT(*) FILTER (WHERE verification_status = 'rejected') as rejected,
                COUNT(*) FILTER (WHERE business_type = 'restaurant') as restaurants,
                COUNT(*) FILTER (WHERE business_type = 'hotel') as hotels,
                COUNT(*) as total
            FROM businesses
        `);
        res.json({ success: true, stats: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

module.exports = { getAll, getOne, approveLevel1, approveLevel2, reject, deactivate, getStats };
