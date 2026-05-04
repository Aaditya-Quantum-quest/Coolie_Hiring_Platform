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
        const customerId = req.user.id;
        
        // Fetch the current station for the customer
        const customerResult = await db.query('SELECT current_station FROM customers WHERE id = $1', [customerId]);
        if (customerResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        
        const currentStation = customerResult.rows[0].current_station;

        let query = `
            SELECT id, name, age, station_name as station, 
                   rating_avg as rating, total_trips as "totalBookings", 
                   badge, is_online as status, passport_photo_url as photo,
                   languages_spoken as languages,
                   latitude as lat, longitude as lng
            FROM coolies
        `;
        let params = [];

        if (currentStation) {
            // Filter by the detected current station
            query += ` WHERE station_name = $1`;
            params.push(currentStation);
        }

        const result = await db.query(query, params);

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
            SELECT id, name, age, station_name as station, 
                   rating_avg as rating, total_trips as "totalBookings", 
                   badge, is_online as status, passport_photo_url as photo,
                   languages_spoken as languages,
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

exports.getProfile = async (req, res) => {
    try {
        const { id } = req.user;
        const result = await db.query(
            `SELECT c.id, c.name, c.email, c.phone, c.city, c.profile_photo_url, c.created_at,
                    (SELECT COUNT(*)::int FROM bookings b WHERE b.customer_id = c.id) as total_bookings,
                    '5.0' as avg_rating
             FROM customers c WHERE c.id = $1`,
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }
        
        res.status(200).json({ success: true, customer: result.rows[0] });
    } catch (error) {
        console.error('getProfile error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching profile.' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { id } = req.user;
        const { phone, city } = req.body;
        let profile_photo_url = req.body.profile_photo_url;

        if (req.file) {
            // The file is stored in 'uploads/profile_photos/' by multer
            profile_photo_url = `/uploads/profile_photos/${req.file.filename}`;
        }

        const updateResult = await db.query(
            `UPDATE customers 
             SET phone = COALESCE($1, phone), 
                 city = COALESCE($2, city), 
                 profile_photo_url = COALESCE($3, profile_photo_url),
                 updated_at = NOW()
             WHERE id = $4
             RETURNING id, name, email, phone, city, profile_photo_url`,
            [phone, city, profile_photo_url, id]
        );

        if (updateResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        // Fetch bookings count to return a complete profile object
        const countRes = await db.query('SELECT COUNT(*)::int as total FROM bookings WHERE customer_id = $1', [id]);
        const customerData = {
            ...updateResult.rows[0],
            total_bookings: countRes.rows[0].total,
            avg_rating: '5.0'
        };

        res.status(200).json({ 
            success: true, 
            message: 'Profile updated successfully', 
            customer: customerData 
        });
    } catch (error) {
        console.error('updateProfile error:', error);
        res.status(500).json({ success: false, message: 'Server error updating profile.' });
    }
};

exports.updateCurrentStation = async (req, res) => {
    try {
        const { id } = req.user;
        const { current_station } = req.body;

        if (!current_station) {
            return res.status(400).json({ success: false, message: 'current_station is required' });
        }

        const result = await db.query(
            'UPDATE customers SET current_station = $1, updated_at = NOW() WHERE id = $2 RETURNING current_station',
            [current_station, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.status(200).json({ success: true, current_station: result.rows[0].current_station });
    } catch (error) {
        console.error('updateCurrentStation error:', error);
        res.status(500).json({ success: false, message: 'Server error updating station.' });
    }
};
