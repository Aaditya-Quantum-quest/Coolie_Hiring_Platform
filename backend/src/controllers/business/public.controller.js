const db = require('../../config/db');

const getBusinessesByStation = async (req, res) => {
    try {
        const { stationId } = req.params;
        const { type, sort = 'rating', search, page = 1, limit = 12 } = req.query;
        const offset = (page - 1) * limit;

        let where = [`b.nearest_station_id = $1`, `b.status = 'approved'`, `b.is_active = true`];
        let params = [stationId];
        let idx = 2;

        if (type && type !== 'all') { where.push(`b.business_type = $${idx++}`); params.push(type); }
        if (search) { where.push(`b.business_name ILIKE $${idx++}`); params.push(`%${search}%`); }

        const total = parseInt((await db.query(`SELECT COUNT(*) FROM businesses b WHERE ${where.join(' AND ')}`, params)).rows[0].count);

        const orderBy = sort === 'rating' ? 'avg_rating DESC NULLS LAST' : 'b.created_at DESC';
        params.push(limit, offset);

        const result = await db.query(
            `SELECT b.id, b.business_name, b.business_type, b.cover_photo_url, b.logo_url,
                    b.full_address, b.city, b.latitude, b.longitude,
                    COALESCE(AVG(r.rating),0) as avg_rating, COUNT(r.id) as review_count,
                    rd.cuisine_types, rd.food_type,
                    COALESCE(
                        (SELECT json_agg(room_type) FROM room_types rt WHERE rt.business_id = b.id LIMIT 3),
                        '[]'
                    ) as room_types
             FROM businesses b
             LEFT JOIN business_reviews r ON r.business_id = b.id AND r.is_visible = true
             LEFT JOIN restaurant_details rd ON rd.business_id = b.id
             WHERE ${where.join(' AND ')}
             GROUP BY b.id, rd.cuisine_types, rd.food_type
             ORDER BY ${orderBy} LIMIT $${idx} OFFSET $${idx+1}`,
            params
        );

        res.json({ success: true, businesses: result.rows, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

const getBusinessDetail = async (req, res) => {
    try {
        const { businessId } = req.params;

        await db.query('UPDATE businesses SET profile_views = profile_views + 1 WHERE id = $1', [businessId]);

        const biz = await db.query(`SELECT b.*, s.name as station_name FROM businesses b LEFT JOIN stations s ON s.id = b.nearest_station_id WHERE b.id = $1 AND b.status = 'approved'`, [businessId]);
        if (biz.rows.length === 0) return res.status(404).json({ success: false, error: { message: 'Business not found' } });

        const business = biz.rows[0];
        let details = null;

        if (business.business_type === 'restaurant') {
            const rd = await db.query('SELECT * FROM restaurant_details WHERE business_id = $1', [businessId]);
            const dishes = await db.query('SELECT * FROM dishes WHERE business_id = $1 AND is_available = true ORDER BY category', [businessId]);
            details = { ...rd.rows[0], dishes: dishes.rows };
        } else {
            const hd = await db.query('SELECT * FROM hotel_details WHERE business_id = $1', [businessId]);
            const rooms = await db.query(
                `SELECT rt.*, COALESCE(json_agg(rp.photo_url) FILTER (WHERE rp.photo_url IS NOT NULL), '[]') as photos
                 FROM room_types rt LEFT JOIN room_photos rp ON rp.room_type_id = rt.id
                 WHERE rt.business_id = $1 AND rt.is_available = true GROUP BY rt.id`, [businessId]
            );
            const halls = await db.query(
                `SELECT h.*, COALESCE(json_agg(hp.photo_url) FILTER (WHERE hp.photo_url IS NOT NULL), '[]') as photos
                 FROM halls h LEFT JOIN hall_photos hp ON hp.hall_id = h.id
                 WHERE h.business_id = $1 GROUP BY h.id`, [businessId]
            );
            details = { ...hd.rows[0], room_types: rooms.rows, halls: halls.rows };
        }

        const reviews = await db.query(
            `SELECT * FROM business_reviews WHERE business_id = $1 AND is_visible = true ORDER BY created_at DESC LIMIT 20`,
            [businessId]
        );
        const avgResult = await db.query(
            `SELECT COALESCE(AVG(rating),0) as avg FROM business_reviews WHERE business_id = $1 AND is_visible = true`,
            [businessId]
        );
        const photos = await db.query('SELECT * FROM business_photos WHERE business_id = $1', [businessId]);

        res.json({ success: true, business, details, photos: photos.rows, reviews: reviews.rows, avg_rating: parseFloat(avgResult.rows[0].avg).toFixed(1) });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

const postReview = async (req, res) => {
    try {
        const { businessId } = req.params;
        const { rating, review_text } = req.body;
        const userId = req.customer?.id || null;

        const existing = await db.query('SELECT id FROM business_reviews WHERE business_id = $1 AND user_id = $2', [businessId, userId]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ success: false, error: { message: 'You have already reviewed this business.' } });
        }

        const result = await db.query(
            `INSERT INTO business_reviews (business_id, user_id, rating, review_text) VALUES ($1,$2,$3,$4) RETURNING *`,
            [businessId, userId, rating, review_text]
        );

        // Notify owner
        const biz = await db.query('SELECT owner_id, business_name FROM businesses WHERE id = $1', [businessId]);
        if (biz.rows.length > 0) {
            await db.query(
                `INSERT INTO business_notifications (owner_id, message) VALUES ($1, $2)`,
                [biz.rows[0].owner_id, `New ${rating}⭐ review received for ${biz.rows[0].business_name}`]
            );
        }

        res.status(201).json({ success: true, review: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

const getStations = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM stations ORDER BY name');
        res.json({ success: true, stations: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

module.exports = { getBusinessesByStation, getBusinessDetail, postReview, getStations };
