const db = require('../../config/db');

const getRooms = async (req, res) => {
    try {
        const rooms = await db.query(
            `SELECT rt.*, COALESCE(json_agg(rp.photo_url) FILTER (WHERE rp.photo_url IS NOT NULL), '[]') as photos
             FROM room_types rt LEFT JOIN room_photos rp ON rp.room_type_id = rt.id
             WHERE rt.business_id = $1 GROUP BY rt.id ORDER BY rt.created_at DESC`,
            [req.businessId]
        );
        res.json({ success: true, data: rooms.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

const addRoom = async (req, res) => {
    try {
        const { room_type, price_per_night, total_rooms_of_type, extra_bed_available, extra_bed_charge, description } = req.body;
        const result = await db.query(
            `INSERT INTO room_types (business_id, room_type, price_per_night, total_rooms_of_type, extra_bed_available, extra_bed_charge, description)
             VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
            [req.businessId, room_type, price_per_night, total_rooms_of_type || null, extra_bed_available === 'true', extra_bed_charge || null, description || null]
        );
        const roomId = result.rows[0].id;

        if (req.files?.photos) {
            for (const file of req.files.photos) {
                await db.query('INSERT INTO room_photos (room_type_id, photo_url) VALUES ($1,$2)', [roomId, `/uploads/businesses/${file.filename}`]);
            }
        }

        res.status(201).json({ success: true, room: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

const updateRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { room_type, price_per_night, total_rooms_of_type, extra_bed_available, extra_bed_charge, description } = req.body;
        const result = await db.query(
            `UPDATE room_types SET room_type=$1, price_per_night=$2, total_rooms_of_type=$3, extra_bed_available=$4, extra_bed_charge=$5, description=$6, updated_at=NOW()
             WHERE id=$7 AND business_id=$8 RETURNING *`,
            [room_type, price_per_night, total_rooms_of_type, extra_bed_available === 'true', extra_bed_charge || null, description, roomId, req.businessId]
        );
        if (result.rows.length === 0) return res.status(404).json({ success: false, error: { message: 'Room not found' } });
        res.json({ success: true, room: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

const deleteRoom = async (req, res) => {
    try {
        await db.query('DELETE FROM room_types WHERE id=$1 AND business_id=$2', [req.params.roomId, req.businessId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

const toggleRoomAvailability = async (req, res) => {
    try {
        await db.query('UPDATE room_types SET is_available=$1 WHERE id=$2 AND business_id=$3', [req.body.is_available, req.params.roomId, req.businessId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

module.exports = { getRooms, addRoom, updateRoom, deleteRoom, toggleRoomAvailability };
