const db = require('../config/db');

exports.getStations = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM stations ORDER BY name ASC');
        res.status(200).json({ success: true, stations: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllCoolies = async (req, res) => {
    try {
        // Return all coolies for the customer frontend
        // We'll return them even if not fully verified for demo purposes, 
        // but normally we'd add WHERE is_active = true
        const result = await db.query(`
            SELECT id, name, phone, age, station_name as station, 
                   rating_avg as rating, total_trips as "totalBookings", 
                   badge, is_online as status, passport_photo_url as photo,
                   experience_years as experience, languages_spoken as languages,
                   latitude as lat, longitude as lng
            FROM coolies
        `);
        // Note: 'status' in mock was 'available'/'busy'. We map is_online to available/offline.
        const coolies = result.rows.map(c => ({
            ...c,
            status: c.status ? 'available' : 'offline',
            basePrice: 80, // Hardcoded or fetch from price_tiers
        }));
        res.status(200).json({ success: true, coolies });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCoolieProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(`
            SELECT id, name, phone, age, station_name as station, 
                   rating_avg as rating, total_trips as "totalBookings", 
                   badge, is_online as status, passport_photo_url as photo,
                   experience_years as experience, languages_spoken as languages,
                   latitude as lat, longitude as lng
            FROM coolies WHERE id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Coolie not found' });
        }
        
        const coolie = result.rows[0];
        coolie.status = coolie.status ? 'available' : 'offline';
        coolie.basePrice = 80;

        res.status(200).json({ success: true, coolie });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
