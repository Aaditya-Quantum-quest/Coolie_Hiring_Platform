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

        // Calculate age from date_of_birth if age is missing or incorrect
        let calculatedAge = coolie.age;
        if (coolie.date_of_birth) {
            const birthDate = new Date(coolie.date_of_birth);
            const today = new Date();
            calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                calculatedAge--;
            }
        }

        // Decrypt sensitive fields
        const decryptedData = {
            ...coolie,
            age: calculatedAge,
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
            `SELECT id, name, coolie_id, rating_avg, station_name, total_trips, total_earnings, is_online, profile_img_url, working_platforms, age 
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
        
        // Get coolie data including total_earnings
        const coolieResult = await db.query(
            "SELECT total_earnings, rating_avg FROM coolies WHERE id = $1",
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

        res.status(200).json({
            success: true,
            data: {
                totalEarnings: parseFloat(coolieResult.rows[0]?.total_earnings || 0),
                tripsToday: parseInt(tripsTodayResult.rows[0].count),
                avgRating: parseFloat(coolieResult.rows[0]?.rating_avg || 0),
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
        const [coolieInfo, tripsToday, pendingCount, activeJobs, completedJobs, upcomingReqs] = await Promise.all([
            db.query("SELECT rating_avg, is_online, total_earnings FROM coolies WHERE id = $1", [id]),
            db.query("SELECT COUNT(*) as count FROM bookings WHERE coolie_id = $1 AND DATE(created_at) = CURRENT_DATE AND status = 'completed'", [id]),
            db.query("SELECT COUNT(*) as count FROM bookings WHERE coolie_id = $1 AND status = 'pending'", [id]),
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
                    totalEarnings: parseFloat(coolieInfo.rows[0]?.total_earnings || 0),
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

// Update Coolie Profile (whitelist only editable fields)
const updateProfile = async (req, res) => {
    try {
        const { id } = req.user;
        const updates = req.body;

        // Whitelist of fields coolies are allowed to update
        const allowedFields = ['phone', 'alt_phone', 'languages_spoken', 'working_platforms'];
        const keys = Object.keys(updates);
        const invalidKeys = keys.filter(k => !allowedFields.includes(k));

        if (invalidKeys.length > 0) {
            return res.status(403).json({
                success: false,
                message: `Cannot update restricted fields: ${invalidKeys.join(', ')}`
            });
        }

        if (keys.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields to update' });
        }

        // Build dynamic SET clause
        const setClauses = [];
        const values = [];
        let idx = 1;

        for (const key of keys) {
            if (key === 'languages_spoken' || key === 'working_platforms') {
                // Ensure arrays
                const arr = Array.isArray(updates[key]) ? updates[key] : [updates[key]];
                setClauses.push(`${key} = $${idx}`);
                values.push(arr);
            } else {
                setClauses.push(`${key} = $${idx}`);
                values.push(updates[key]);
            }
            idx++;
        }

        values.push(id);
        const query = `UPDATE coolies SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING phone, alt_phone, languages_spoken, working_platforms`;
        const result = await db.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Coolie not found' });
        }

        res.status(200).json({ success: true, data: result.rows[0], message: 'Profile updated successfully' });
    } catch (error) {
        console.error('updateProfile error:', error);
        res.status(500).json({ success: false, message: 'Server error updating profile' });
    }
};

// Get Earnings Data (Weekly or Monthly)
const getEarnings = async (req, res) => {
    try {
        const { coolieId } = req.params;
        const { period } = req.query; // 'weekly' or 'monthly'

        // Get coolie UUID from coolie_id or use as UUID directly
        const coolieResult = await db.query(
            'SELECT id, total_earnings FROM coolies WHERE id::text = $1 OR coolie_id = $1',
            [coolieId]
        );

        if (coolieResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Coolie not found' });
        }

        const coolieUUID = coolieResult.rows[0].id;
        const totalEarnings = parseFloat(coolieResult.rows[0].total_earnings || 0);

        if (period === 'weekly') {
            // Get last 7 days earnings
            const weeklyResult = await db.query(`
                SELECT 
                    TO_CHAR(created_at, 'Day') as day,
                    COALESCE(SUM(amount), 0) as earnings,
                    COUNT(*) as trips
                FROM bookings
                WHERE coolie_id = $1 
                    AND status = 'completed'
                    AND created_at >= CURRENT_DATE - INTERVAL '7 days'
                GROUP BY TO_CHAR(created_at, 'Day'), EXTRACT(DOW FROM created_at)
                ORDER BY EXTRACT(DOW FROM created_at)
            `, [coolieUUID]);

            // Get total for the week
            const weekTotalResult = await db.query(`
                SELECT 
                    COALESCE(SUM(amount), 0) as total,
                    COUNT(*) as trips
                FROM bookings
                WHERE coolie_id = $1 
                    AND status = 'completed'
                    AND created_at >= CURRENT_DATE - INTERVAL '7 days'
            `, [coolieUUID]);

            return res.status(200).json({
                success: true,
                data: {
                    weeklyData: weeklyResult.rows.map(row => ({
                        day: row.day.trim(),
                        earnings: parseFloat(row.earnings),
                        trips: parseInt(row.trips)
                    })),
                    totalWeek: parseFloat(weekTotalResult.rows[0].total),
                    totalTrips: parseInt(weekTotalResult.rows[0].trips)
                }
            });
        } else if (period === 'monthly') {
            // Get last 4 weeks earnings
            const monthlyResult = await db.query(`
                SELECT 
                    'Week ' || EXTRACT(WEEK FROM created_at) as week,
                    COALESCE(SUM(amount), 0) as earnings,
                    COUNT(*) as trips
                FROM bookings
                WHERE coolie_id = $1 
                    AND status = 'completed'
                    AND created_at >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY EXTRACT(WEEK FROM created_at)
                ORDER BY EXTRACT(WEEK FROM created_at)
            `, [coolieUUID]);

            // Get total for the month
            const monthTotalResult = await db.query(`
                SELECT 
                    COALESCE(SUM(amount), 0) as total
                FROM bookings
                WHERE coolie_id = $1 
                    AND status = 'completed'
                    AND created_at >= CURRENT_DATE - INTERVAL '30 days'
            `, [coolieUUID]);

            return res.status(200).json({
                success: true,
                data: {
                    monthlyData: monthlyResult.rows.map(row => ({
                        week: row.week,
                        earnings: parseFloat(row.earnings),
                        trips: parseInt(row.trips)
                    })),
                    totalMonth: parseFloat(monthTotalResult.rows[0].total)
                }
            });
        }

        res.status(400).json({ success: false, message: 'Invalid period. Use "weekly" or "monthly"' });
    } catch (error) {
        console.error('getEarnings error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Transaction History
const getTransactions = async (req, res) => {
    try {
        const { coolieId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        // Get coolie UUID
        const coolieResult = await db.query(
            'SELECT id FROM coolies WHERE id::text = $1 OR coolie_id = $1',
            [coolieId]
        );

        if (coolieResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Coolie not found' });
        }

        const coolieUUID = coolieResult.rows[0].id;
        const offset = (page - 1) * limit;

        const result = await db.query(`
            SELECT 
                b.booking_ref as id,
                c.name as customer,
                b.amount,
                TO_CHAR(b.created_at, 'DD Mon, HH24:MI') as date,
                'UPI' as method
            FROM bookings b
            JOIN customers c ON b.customer_id = c.id
            WHERE b.coolie_id = $1 AND b.status = 'completed'
            ORDER BY b.created_at DESC
            LIMIT $2 OFFSET $3
        `, [coolieUUID, limit, offset]);

        res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('getTransactions error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Weekly Summary
const getWeeklySummary = async (req, res) => {
    try {
        const { coolieId } = req.params;

        // Get coolie UUID
        const coolieResult = await db.query(
            'SELECT id FROM coolies WHERE id::text = $1 OR coolie_id = $1',
            [coolieId]
        );

        if (coolieResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Coolie not found' });
        }

        const coolieUUID = coolieResult.rows[0].id;

        // Get today's earnings and trips
        const todayResult = await db.query(`
            SELECT 
                COALESCE(SUM(amount), 0) as earnings,
                COUNT(*) as trips
            FROM bookings
            WHERE coolie_id = $1 
                AND status = 'completed'
                AND DATE(created_at) = CURRENT_DATE
        `, [coolieUUID]);

        // Get tips received this week (assuming tips are tracked separately or as a percentage)
        // For now, we'll calculate it as 10% of weekly earnings
        const weeklyResult = await db.query(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM bookings
            WHERE coolie_id = $1 
                AND status = 'completed'
                AND created_at >= CURRENT_DATE - INTERVAL '7 days'
        `, [coolieUUID]);

        const tipsReceived = Math.floor(parseFloat(weeklyResult.rows[0].total) * 0.1);

        res.status(200).json({
            success: true,
            data: {
                todayEarnings: parseFloat(todayResult.rows[0].earnings),
                todayTrips: parseInt(todayResult.rows[0].trips),
                tipsReceived
            }
        });
    } catch (error) {
        console.error('getWeeklySummary error:', error);
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
    getPublicProfile,
    updateProfile,
    getEarnings,
    getTransactions,
    getWeeklySummary
};
