const db = require('../../config/db');

const getReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10, rating, sort = 'newest' } = req.query;
        const bizId = req.businessId;
        const offset = (page - 1) * limit;
        let where = ['business_id = $1'];
        let params = [bizId];
        let idx = 2;
        if (rating) { where.push(`rating = $${idx++}`); params.push(parseInt(rating)); }

        const total = parseInt((await db.query(`SELECT COUNT(*) FROM business_reviews WHERE ${where.join(' AND ')}`, params)).rows[0].count);
        const orderBy = sort === 'rating' ? 'rating DESC' : 'created_at DESC';

        params.push(limit, offset);
        const reviews = await db.query(
            `SELECT * FROM business_reviews WHERE ${where.join(' AND ')} ORDER BY ${orderBy} LIMIT $${idx} OFFSET $${idx+1}`,
            params
        );

        const breakdown = await db.query(
            `SELECT rating, COUNT(*) as count FROM business_reviews WHERE business_id = $1 GROUP BY rating ORDER BY rating DESC`,
            [bizId]
        );
        const avgResult = await db.query(
            `SELECT COALESCE(AVG(rating),0) as avg FROM business_reviews WHERE business_id = $1 AND is_visible = true`,
            [bizId]
        );

        res.json({
            success: true,
            data: reviews.rows,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
            breakdown: breakdown.rows,
            avg_rating: parseFloat(avgResult.rows[0].avg).toFixed(1)
        });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

const replyToReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { reply_text } = req.body;
        const result = await db.query(
            `UPDATE business_reviews SET owner_reply=$1, updated_at=NOW() WHERE id=$2 AND business_id=$3 RETURNING *`,
            [reply_text, reviewId, req.businessId]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false, error: { message: 'Review not found' } });
        res.json({ success: true, review: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

const toggleVisibility = async (req, res) => {
    try {
        await db.query('UPDATE business_reviews SET is_visible=$1 WHERE id=$2 AND business_id=$3', [req.body.is_visible, req.params.reviewId, req.businessId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

module.exports = { getReviews, replyToReview, toggleVisibility };
