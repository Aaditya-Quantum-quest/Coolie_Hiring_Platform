const db = require('../config/db');

// Coolie Goes Online (REST API fallback/init)
const goOnline = async (req, res) => {
    try {
        const { id } = req.user; // assuming auth middleware
        const { lat, lng } = req.body;
        
        await db.query(
            `UPDATE coolies SET is_online = true, latitude = $1, longitude = $2, last_location_update = NOW() WHERE id = $3`,
            [lat || null, lng || null, id]
        );

        res.status(200).json({ success: true, message: 'You are now online' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Coolie Goes Offline (REST API fallback/init)
const goOffline = async (req, res) => {
    try {
        const { id } = req.user; // assuming auth middleware
        
        await db.query(
            `UPDATE coolies SET is_online = false WHERE id = $1`,
            [id]
        );

        res.status(200).json({ success: true, message: 'You are now offline' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Coolie Status
const getStatus = async (req, res) => {
    try {
        const { id } = req.user; 
        
        const result = await db.query(
            `SELECT is_online FROM coolies WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Coolie not found' });
        }

        res.status(200).json({ success: true, is_online: result.rows[0].is_online });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    goOnline,
    goOffline,
    getStatus
};
