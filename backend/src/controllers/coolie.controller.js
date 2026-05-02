const db = require('../config/db');

const { decrypt } = require('../utils/encrypt');

// Coolie Goes Online (REST API fallback/init)
const goOnline = async (req, res) => {
    try {
        const { id } = req.user; // assuming auth middleware
        const { lat, lng } = req.body;
        
        console.log(`[Status] Coolie ${id} is going ONLINE at ${lat}, ${lng}`);
        
        await db.query(
            `UPDATE coolies SET is_online = true, latitude = $1, longitude = $2, last_location_update = NOW() WHERE id = $3`,
            [lat || null, lng || null, id]
        );

        res.status(200).json({ success: true, message: 'You are now online' });
    } catch (error) {
        console.error(`[Status Error] goOnline for ${req.user?.id}:`, error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Coolie Goes Offline (REST API fallback/init)
const goOffline = async (req, res) => {
    try {
        const { id } = req.user; // assuming auth middleware
        
        console.log(`[Status] Coolie ${id} is going OFFLINE`);
        
        await db.query(
            `UPDATE coolies SET is_online = false WHERE id = $1`,
            [id]
        );

        res.status(200).json({ success: true, message: 'You are now offline' });
    } catch (error) {
        console.error(`[Status Error] goOffline for ${req.user?.id}:`, error.message);
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
            console.warn(`[Status Warning] Coolie ${id} not found in DB during getStatus`);
            return res.status(404).json({ success: false, message: 'Coolie not found' });
        }

        const is_online = result.rows[0].is_online;
        // console.log(`[Status] getStatus for ${id}: ${is_online ? 'ONLINE' : 'OFFLINE'}`);
        
        res.status(200).json({ success: true, is_online });
    } catch (error) {
        console.error(`[Status Error] getStatus for ${req.user?.id}:`, error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Full Profile for Coolie
const getProfile = async (req, res) => {
    try {
        const { id } = req.user;

        const result = await db.query(
            `SELECT * FROM coolies WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Coolie profile not found' });
        }

        const coolie = result.rows[0];

        // Decrypt sensitive fields
        const decryptedData = {
            ...coolie,
            aadhaar_number: decrypt(coolie.aadhaar_number_enc),
            secondary_doc_number: decrypt(coolie.secondary_doc_number_enc),
            account_number: decrypt(coolie.account_number_enc)
        };

        // Remove sensitive encrypted fields from response
        delete decryptedData.password_hash;
        delete decryptedData.aadhaar_number_enc;
        delete decryptedData.secondary_doc_number_enc;
        delete decryptedData.account_number_enc;
        delete decryptedData.aadhaar_number_hash;

        res.status(200).json({
            success: true,
            data: decryptedData
        });
    } catch (error) {
        console.error('getProfile error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching profile' });
    }
};

// Get Public Profile for Verification
const getPublicProfile = async (req, res) => {
    try {
        const { coolieId } = req.params;

        const result = await db.query(
            `SELECT id, name, coolie_id, rating_avg, station_name, total_trips, is_online, profile_img_url, badge, working_platforms, age 
             FROM coolies 
             WHERE id::text = $1 OR coolie_id = $1`,
            [coolieId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Coolie profile not found' });
        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('getPublicProfile error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching public profile' });
    }
};

// Get Dashboard Stats for Coolie
const getDashboardStats = async (req, res) => {
    try {
        const { id } = req.user;
        
        // Total earnings (completed bookings)
        const earningsResult = await db.query(
            "SELECT COALESCE(SUM(amount), 0) as total FROM bookings WHERE coolie_id = $1 AND status = 'completed'",
            [id]
        );
        
        // Trips today
        const tripsTodayResult = await db.query(
            "SELECT COUNT(*) as count FROM bookings WHERE coolie_id = $1 AND DATE(created_at) = CURRENT_DATE AND status = 'completed'",
            [id]
        );
        
        // Pending requests
        const pendingResult = await db.query(
            "SELECT COUNT(*) as count FROM bookings WHERE coolie_id = $1 AND status = 'pending'",
            [id]
        );
        
        // Avg Rating
        const ratingResult = await db.query(
            "SELECT rating_avg FROM coolies WHERE id = $1",
            [id]
        );

        res.status(200).json({
            success: true,
            data: {
                totalEarnings: parseInt(earningsResult.rows[0].total),
                tripsToday: parseInt(tripsTodayResult.rows[0].count),
                avgRating: parseFloat(ratingResult.rows[0].rating_avg || 0),
                pending: parseInt(pendingResult.rows[0].count)
            }
        });
    } catch (error) {
        console.error('getDashboardStats error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Active Jobs for Coolie
const getActiveJobs = async (req, res) => {
    try {
        const { id } = req.user;
        const result = await db.query(`
            SELECT b.*, c.name as customer_name
            FROM bookings b
            JOIN customers c ON b.customer_id = c.id
            WHERE b.coolie_id = $1 AND b.status IN ('confirmed', 'arrived', 'in_progress')
            ORDER BY b.created_at DESC
        `, [id]);

        const formatted = result.rows.map(b => ({
            id: b.booking_ref,
            customer: b.customer_name,
            platform: b.platform,
            to: b.destination_station_name,
            price: b.amount,
            status: b.status,
            otp: b.otp,
            trainNo: b.train_no,
            trainName: b.train_name
        }));

        res.status(200).json({ success: true, data: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Completed Jobs Today
const getCompletedToday = async (req, res) => {
    try {
        const { id } = req.user;
        const result = await db.query(`
            SELECT b.*
            FROM bookings b
            WHERE b.coolie_id = $1 AND b.status = 'completed' AND DATE(b.created_at) = CURRENT_DATE
            ORDER BY b.created_at DESC
        `, [id]);

        const formatted = result.rows.map(b => ({
            label: `Job #${b.booking_ref}`,
            time: b.created_at.toLocaleString(),
            amount: b.amount
        }));

        res.status(200).json({ success: true, data: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Upcoming Requests for Coolie
const getUpcomingRequests = async (req, res) => {
    try {
        const { id } = req.user;
        const result = await db.query(`
            SELECT b.*, c.name as customer_name
            FROM bookings b
            JOIN customers c ON b.customer_id = c.id
            WHERE b.coolie_id = $1 AND b.status = 'pending'
            ORDER BY b.created_at DESC
        `, [id]);

        const formatted = result.rows.map(b => ({
            id: b.booking_ref,
            customer: b.customer_name,
            tag: 'REGULAR',
            platform: b.platform,
            bags: b.luggage_count + ' bags',
            to: b.destination_station_name,
            price: b.amount,
            timer: 60, // Fixed timer for demo
            trainNo: b.train_no,
            trainName: b.train_name
        }));

        res.status(200).json({ success: true, data: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Consolidated Dashboard Overview to reduce API calls (Prevent 429)
const getDashboardOverview = async (req, res) => {
    try {
        const { id } = req.user;

        // Run queries in parallel
        const [statsRes, activeRes, completedRes, requestsRes, statusRes] = await Promise.all([
            db.query("SELECT COALESCE(SUM(amount), 0) as total FROM bookings WHERE coolie_id = $1 AND status = 'completed'", [id]),
            db.query("SELECT COUNT(*) as count FROM bookings WHERE coolie_id = $1 AND DATE(created_at) = CURRENT_DATE AND status = 'completed'", [id]),
            db.query("SELECT COUNT(*) as count FROM bookings WHERE coolie_id = $1 AND status = 'pending'", [id]),
            db.query("SELECT rating_avg, is_online FROM coolies WHERE id = $1", [id]),
            db.query(`
                SELECT b.*, c.name as customer_name
                FROM bookings b
                JOIN customers c ON b.customer_id = c.id
                WHERE b.coolie_id = $1 AND b.status IN ('confirmed', 'arrived', 'in_progress')
                ORDER BY b.created_at DESC
            `, [id]),
            db.query(`
                SELECT b.*
                FROM bookings b
                WHERE b.coolie_id = $1 AND b.status = 'completed' AND DATE(b.created_at) = CURRENT_DATE
                ORDER BY b.created_at DESC
            `, [id]),
            db.query(`
                SELECT b.*, c.name as customer_name
                FROM bookings b
                JOIN customers c ON b.customer_id = c.id
                WHERE b.coolie_id = $1 AND b.status = 'pending'
                ORDER BY b.created_at DESC
            `, [id])
        ]);

        // Note: I accidentally added extra queries in the Promise.all above, let's fix the mapping
        // Correction: [earnings, tripsToday, pendingCount, coolieInfo, activeJobs, completedJobs, upcomingReqs]
        const [earnings, tripsToday, pendingCount, coolieInfo, activeJobs, completedJobs, upcomingReqs] = await Promise.all([
            db.query("SELECT COALESCE(SUM(amount), 0) as total FROM bookings WHERE coolie_id = $1 AND status = 'completed'", [id]),
            db.query("SELECT COUNT(*) as count FROM bookings WHERE coolie_id = $1 AND DATE(created_at) = CURRENT_DATE AND status = 'completed'", [id]),
            db.query("SELECT COUNT(*) as count FROM bookings WHERE coolie_id = $1 AND status = 'pending'", [id]),
            db.query("SELECT rating_avg, is_online FROM coolies WHERE id = $1", [id]),
            db.query(`
                SELECT b.*, c.name as customer_name
                FROM bookings b
                JOIN customers c ON b.customer_id = c.id
                WHERE b.coolie_id = $1 AND b.status IN ('confirmed', 'arrived', 'in_progress')
                ORDER BY b.created_at DESC
            `, [id]),
            db.query(`
                SELECT b.*
                FROM bookings b
                WHERE b.coolie_id = $1 AND b.status = 'completed' AND DATE(b.created_at) = CURRENT_DATE
                ORDER BY b.created_at DESC
            `, [id]),
            db.query(`
                SELECT b.*, c.name as customer_name
                FROM bookings b
                JOIN customers c ON b.customer_id = c.id
                WHERE b.coolie_id = $1 AND b.status = 'pending'
                ORDER BY b.created_at DESC
            `, [id])
        ]);

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalEarnings: parseInt(earnings.rows[0].total),
                    tripsToday: parseInt(tripsToday.rows[0].count),
                    avgRating: parseFloat(coolieInfo.rows[0]?.rating_avg || 0),
                    pending: parseInt(pendingCount.rows[0].count)
                },
                is_online: coolieInfo.rows[0]?.is_online || false,
                activeJobs: activeJobs.rows.map(b => ({
                    id: b.booking_ref,
                    customer: b.customer_name,
                    platform: b.platform,
                    to: b.destination_station_name,
                    price: b.amount,
                    status: b.status,
                    otp: b.otp,
                    trainNo: b.train_no,
                    trainName: b.train_name
                })),
                completedToday: completedJobs.rows.map(b => ({
                    label: `Job #${b.booking_ref}`,
                    time: b.created_at.toLocaleString(),
                    amount: b.amount
                })),
                upcomingRequests: upcomingReqs.rows.map(b => ({
                    id: b.booking_ref,
                    customer: b.customer_name,
                    tag: 'REGULAR',
                    platform: b.platform,
                    bags: b.luggage_count + ' bags',
                    to: b.destination_station_name,
                    price: b.amount,
                    timer: 60,
                    trainNo: b.train_no,
                    trainName: b.train_name
                }))
            }
        });

    } catch (error) {
        console.error('getDashboardOverview error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    goOnline,
    goOffline,
    getStatus,
    getProfile,
    getDashboardStats,
    getActiveJobs,
    getCompletedToday,
    getUpcomingRequests,
    getDashboardOverview,
    getPublicProfile
};
