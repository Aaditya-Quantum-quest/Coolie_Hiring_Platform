const db = require('../../config/db');

const getHalls = async (req, res) => {
    try {
        const halls = await db.query(
            `SELECT h.*, COALESCE(json_agg(hp.photo_url) FILTER (WHERE hp.photo_url IS NOT NULL), '[]') as photos
             FROM halls h LEFT JOIN hall_photos hp ON hp.hall_id = h.id
             WHERE h.business_id = $1 GROUP BY h.id ORDER BY h.created_at DESC`,
            [req.businessId]
        );
        res.json({ success: true, data: halls.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

const addHall = async (req, res) => {
    try {
        const { hall_name, capacity, price_per_event, has_ac, has_av_equipment, description } = req.body;
        const result = await db.query(
            `INSERT INTO halls (business_id, hall_name, capacity, price_per_event, has_ac, has_av_equipment, description)
             VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
            [req.businessId, hall_name, capacity || null, price_per_event || null, has_ac === 'true', has_av_equipment === 'true', description || null]
        );
        const hallId = result.rows[0].id;
        if (req.files?.photos) {
            for (const file of req.files.photos) {
                await db.query('INSERT INTO hall_photos (hall_id, photo_url) VALUES ($1,$2)', [hallId, `/uploads/businesses/${file.filename}`]);
            }
        }
        res.status(201).json({ success: true, hall: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

const updateHall = async (req, res) => {
    try {
        const { hallId } = req.params;
        const { hall_name, capacity, price_per_event, has_ac, has_av_equipment, description, is_available } = req.body;
        const result = await db.query(
            `UPDATE halls SET hall_name=$1, capacity=$2, price_per_event=$3, has_ac=$4, has_av_equipment=$5, description=$6, is_available=$7
             WHERE id=$8 AND business_id=$9 RETURNING *`,
            [hall_name, capacity, price_per_event, has_ac === 'true', has_av_equipment === 'true', description, is_available !== 'false', hallId, req.businessId]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false, error: { message: 'Hall not found' } });
        res.json({ success: true, hall: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

const deleteHall = async (req, res) => {
    try {
        await db.query('DELETE FROM halls WHERE id=$1 AND business_id=$2', [req.params.hallId, req.businessId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

module.exports = { getHalls, addHall, updateHall, deleteHall };
