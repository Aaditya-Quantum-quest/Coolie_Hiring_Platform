const db = require('../config/db');
const { getNearbyConnectedCoolies } = require('../services/nearbySearch.service');

// Update Location Fallback (REST API)
const updateLocation = async (req, res) => {
    try {
        const { coolieId, lat, lng } = req.body;
        if (!coolieId || !lat || !lng) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        
        await db.query(
            `UPDATE coolies SET latitude = $1, longitude = $2, last_location_update = NOW() WHERE id = $3`,
            [lat, lng, coolieId]
        );

        res.status(200).json({ success: true, message: 'Location updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Nearby Coolies (REST API)
const getNearbyCoolies = async (req, res) => {
    try {
        const { lat, lng, radius = 3000 } = req.query;
        if (!lat || !lng) {
            return res.status(400).json({ success: false, message: 'Missing lat/lng' });
        }

        const coolies = await getNearbyConnectedCoolies(parseFloat(lat), parseFloat(lng), parseInt(radius));
        res.status(200).json({ success: true, coolies });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Specific Coolie Location
const getCoolieLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            `SELECT latitude, longitude, last_location_update FROM coolies WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Coolie not found' });
        }

        res.status(200).json({ success: true, location: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    updateLocation,
    getNearbyCoolies,
    getCoolieLocation
};
