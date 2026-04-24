const db = require('../../config/db');

const getDashboard = async (req, res) => {
    try {
        const bizId = req.businessId;
        const bizType = req.businessType;

        const bizResult = await db.query('SELECT * FROM businesses WHERE id = $1', [bizId]);
        const business = bizResult.rows[0];

        const reviewStats = await db.query(
            `SELECT COUNT(*) as total, COALESCE(AVG(rating),0) as avg_rating FROM business_reviews WHERE business_id = $1 AND is_visible = true`,
            [bizId]
        );

        const latestReviews = await db.query(
            `SELECT * FROM business_reviews WHERE business_id = $1 AND is_visible = true ORDER BY created_at DESC LIMIT 3`,
            [bizId]
        );

        let specificStats = {};
        let chartData = {};

        if (bizType === 'restaurant') {
            const dishCount = await db.query('SELECT COUNT(*) as total FROM dishes WHERE business_id = $1', [bizId]);
            const dishesByCategory = await db.query(
                `SELECT category, food_type, COUNT(*) as count FROM dishes WHERE business_id = $1 GROUP BY category, food_type`,
                [bizId]
            );
            const foodTypeDist = await db.query(
                `SELECT food_type, COUNT(*) as count FROM dishes WHERE business_id = $1 GROUP BY food_type`,
                [bizId]
            );
            specificStats.total_dishes = parseInt(dishCount.rows[0].total);
            chartData.dishesByCategory = dishesByCategory.rows;
            chartData.foodTypeDistribution = foodTypeDist.rows;
        } else {
            const roomCount = await db.query('SELECT COUNT(*) as total FROM room_types WHERE business_id = $1', [bizId]);
            const roomPricing = await db.query('SELECT room_type, price_per_night FROM room_types WHERE business_id = $1', [bizId]);
            const hotelDetails = await db.query('SELECT amenities FROM hotel_details WHERE business_id = $1', [bizId]);
            specificStats.total_room_types = parseInt(roomCount.rows[0].total);
            const amenities = hotelDetails.rows[0]?.amenities || [];
            const totalAmenities = 13;
            chartData.roomPricing = roomPricing.rows;
            chartData.amenitiesCoverage = { enabled: amenities.length, total: totalAmenities };
        }

        const activity = await db.query(
            `SELECT message, is_read, created_at FROM business_notifications WHERE owner_id = $1 ORDER BY created_at DESC LIMIT 10`,
            [req.owner.id]
        );

        res.json({
            success: true,
            dashboard: {
                business,
                stats: {
                    ...specificStats,
                    total_reviews: parseInt(reviewStats.rows[0].total),
                    avg_rating: parseFloat(reviewStats.rows[0].avg_rating).toFixed(1),
                    profile_views: business.profile_views
                },
                chartData,
                latestReviews: latestReviews.rows,
                recentActivity: activity.rows
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

const getProfile = async (req, res) => {
    try {
        const bizId = req.businessId;
        const bizType = req.businessType;

        const bizResult = await db.query(
            `SELECT b.*, bo.full_name, bo.email, bo.phone_primary, bo.phone_alternate, bo.whatsapp_number, bo.website_url
             FROM businesses b JOIN business_owners bo ON bo.id = b.owner_id WHERE b.id = $1`,
            [bizId]
        );
        const business = bizResult.rows[0];

        let details = null;
        if (bizType === 'restaurant') {
            const r = await db.query('SELECT * FROM restaurant_details WHERE business_id = $1', [bizId]);
            details = r.rows[0];
        } else {
            const h = await db.query('SELECT * FROM hotel_details WHERE business_id = $1', [bizId]);
            const rooms = await db.query('SELECT * FROM room_types WHERE business_id = $1', [bizId]);
            details = { ...h.rows[0], room_types: rooms.rows };
        }

        const photos = await db.query('SELECT * FROM business_photos WHERE business_id = $1', [bizId]);
        const station = await db.query('SELECT name, code FROM stations WHERE id = $1', [business.nearest_station_id]);

        res.json({ success: true, profile: { ...business, details, photos: photos.rows, station: station.rows[0] } });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

const updateProfile = async (req, res) => {
    try {
        const bizId = req.businessId;
        const { business_name, description, gst_number, year_established, full_address, city, state, pincode,
                nearest_station_id, opening_time, closing_time, days_open, closed_on_holidays, payment_modes,
                full_name, phone_primary, phone_alternate, whatsapp_number, website_url } = req.body;

        await db.query(
            `UPDATE businesses SET business_name=$1, description=$2, gst_number=$3, year_established=$4,
             full_address=$5, city=$6, state=$7, pincode=$8, nearest_station_id=$9,
             opening_time=$10, closing_time=$11, days_open=$12, closed_on_holidays=$13, payment_modes=$14,
             status='pending', updated_at=NOW() WHERE id=$15`,
            [business_name, description, gst_number, year_established, full_address, city, state, pincode,
             nearest_station_id, opening_time, closing_time,
             days_open ? JSON.parse(days_open) : null,
             closed_on_holidays === 'true',
             payment_modes ? JSON.parse(payment_modes) : null, bizId]
        );

        await db.query(
            `UPDATE business_owners SET full_name=$1, phone_primary=$2, phone_alternate=$3, whatsapp_number=$4, website_url=$5 WHERE id=$6`,
            [full_name, phone_primary, phone_alternate, whatsapp_number, website_url, req.owner.id]
        );

        res.json({ success: true, message: 'Profile update submitted for admin review.' });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

const updateLocation = async (req, res) => {
    try {
        const { latitude, longitude, full_address, city, state, pincode } = req.body;
        await db.query(
            `UPDATE businesses SET latitude=$1, longitude=$2, full_address=$3, city=$4, state=$5, pincode=$6, status='pending', updated_at=NOW() WHERE id=$7`,
            [latitude, longitude, full_address, city, state, pincode, req.businessId]
        );
        res.json({ success: true, message: 'Location updated. Admin will review the change.' });
    } catch (err) {
        res.status(500).json({ success: false, error: { message: err.message } });
    }
};

module.exports = { getDashboard, getProfile, updateProfile, updateLocation };
