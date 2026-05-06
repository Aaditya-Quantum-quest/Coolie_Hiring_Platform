const authService = require('../services/auth.service')
const pool = require('../config/db')

// ─── ADMIN LOGIN ────────────────────────────────────────────

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000, // 1 hour
}
const refreshCookieOptions = {
    ...cookieOptions,
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000,
}

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body
        const admin = await authService.findAdminByEmail(email)

        if (!admin || !admin.is_active) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' })
        }

        const isMatch = await authService.comparePassword(password, admin.password_hash)
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials.' })

        const payload = { id: admin.id, email: admin.email, role: 'admin', adminRole: admin.role }
        const { accessToken, refreshToken } = authService.generateTokens(payload)
        await authService.storeRefreshToken(admin.id, 'admin', refreshToken)

        res.cookie('access_token', accessToken, cookieOptions)
            .cookie('refresh_token', refreshToken, refreshCookieOptions)
            .status(200).json({
                success: true,
                message: 'Admin login successful!',
                user: { id: admin.id, name: admin.name, email: admin.email, role: 'admin', adminRole: admin.role },
            })
    } catch (err) {
        console.error('loginAdmin:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

// ─── PENDING COOLIES LIST ────────────────────────────────────

/**
 * GET /api/admin/coolies/pending
 * Returns all coolies awaiting verification
 */
const getPendingCoolies = async (req, res) => {
    try {
        const coolies = await authService.getPendingCoolies()
        res.status(200).json({ success: true, count: coolies.length, data: coolies })
    } catch (err) {
        console.error('getPendingCoolies:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

/**
 * GET /api/admin/coolies/:id
 * Get full coolie details for review (documents, all fields)
 */
const getCoolieDetail = async (req, res) => {
    try {
        const coolie = await authService.getCoolieForAdmin(req.params.id)
        if (!coolie) return res.status(404).json({ success: false, message: 'Coolie not found.' })
        res.status(200).json({ success: true, data: coolie })
    } catch (err) {
        console.error('getCoolieDetail:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

/**
 * GET /api/admin/coolies — All coolies with filter
 */
const getAllCoolies = async (req, res) => {
    try {
        const { status, station, page = 1, limit = 20 } = req.query
        const offset = (page - 1) * limit

        let query = `
            SELECT id, coolie_id, name, email, phone, station_name, city,
                   passport_photo_url, verification_status, is_verified, is_active, is_suspended,
                   rating_avg, total_trips, created_at
            FROM coolies WHERE 1=1`
        const params = []

        if (status && status !== 'undefined' && status !== 'all') {
            if (status === 'active') {
                query += ` AND verification_status = 'approved' AND is_suspended = false`
            } else if (status === 'suspended') {
                query += ` AND is_suspended = true`
            } else {
                params.push(status)
                query += ` AND verification_status = $${params.length}`
            }
        }
        
        if (station) {
            params.push(`%${station}%`)
            query += ` AND station_name ILIKE $${params.length}`
        }

        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
        params.push(limit, offset)

        const result = await pool.query(query, params)

        // Generate count query with same filters
        let countQuery = `SELECT COUNT(*) FROM coolies WHERE 1=1`
        const countParams = []
        if (status && status !== 'undefined' && status !== 'all') {
            if (status === 'active') {
                countQuery += ` AND verification_status = 'approved' AND is_suspended = false`
            } else if (status === 'suspended') {
                countQuery += ` AND is_suspended = true`
            } else {
                countParams.push(status)
                countQuery += ` AND verification_status = $${countParams.length}`
            }
        }
        if (station) {
            countParams.push(`%${station}%`)
            countQuery += ` AND station_name ILIKE $${countParams.length}`
        }
        const countResult = await pool.query(countQuery, countParams)

        res.status(200).json({
            success: true,
            total: parseInt(countResult.rows[0].count),
            page: parseInt(page),
            data: result.rows,
        })
    } catch (err) {
        console.error('getAllCoolies:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

// ─── TWO-LEVEL APPROVAL ──────────────────────────────────────

/**
 * POST /api/admin/coolies/:id/approve/level1
 * Level 1: Document verification passed
 */
const approveCoolieLevel1 = async (req, res) => {
    try {
        const { id } = req.params
        const adminId = req.user.id

        const coolie = await authService.getCoolieForAdmin(id)
        if (!coolie) return res.status(404).json({ success: false, message: 'Coolie not found.' })

        if (coolie.verification_status !== 'pending') {
            return res.status(400).json({ success: false, message: `Cannot approve: current status is "${coolie.verification_status}".` })
        }

        await authService.approveLevel1(id, adminId)

        res.status(200).json({
            success: true,
            message: `✅ Level 1 (Document Verification) approved for ${coolie.name}. Awaiting Level 2 final approval.`,
        })
    } catch (err) {
        console.error('approveCoolieLevel1:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

/**
 * POST /api/admin/coolies/:id/approve/level2
 * Level 2: Final approval — generates Coolie ID + QR code
 */
const approveCoolieLevel2 = async (req, res) => {
    try {
        const { id } = req.params
        const adminId = req.user.id

        const coolie = await authService.getCoolieForAdmin(id)
        if (!coolie) return res.status(404).json({ success: false, message: 'Coolie not found.' })

        if (coolie.verification_status !== 'level1_approved') {
            return res.status(400).json({
                success: false,
                message: `Cannot do Level 2 approval: current status is "${coolie.verification_status}". Level 1 must be done first.`,
            })
        }

        const result = await authService.approveLevel2(id, adminId)

        res.status(200).json({
            success: true,
            message: `🎉 ${coolie.name} is now APPROVED! Coolie ID: ${result.coolie_id}. Approval email sent.`,
            coolie_id: result.coolie_id,
            qr_code_url: result.qr_code_url,
        })
    } catch (err) {
        console.error('approveCoolieLevel2:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

/**
 * POST /api/admin/coolies/:id/reject
 * Reject coolie with reason
 */
const rejectCoolie = async (req, res) => {
    try {
        const { id } = req.params
        const { reason } = req.body

        if (!reason || reason.trim().length < 5) {
            return res.status(422).json({ success: false, message: 'Please provide a rejection reason (min 5 characters).' })
        }

        const coolie = await authService.getCoolieForAdmin(id)
        if (!coolie) return res.status(404).json({ success: false, message: 'Coolie not found.' })

        if (coolie.verification_status === 'approved') {
            return res.status(400).json({ success: false, message: 'Cannot reject an already approved coolie.' })
        }

        await authService.rejectCoolie(id, req.user.id, reason)

        res.status(200).json({ success: true, message: `Coolie ${coolie.name} has been rejected. Rejection email sent.` })
    } catch (err) {
        console.error('rejectCoolie:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

/**
 * PATCH /api/admin/coolies/:id/suspend
 */
const suspendCoolie = async (req, res) => {
    try {
        const { id } = req.params
        const { suspend = true } = req.body

        await pool.query('UPDATE coolies SET is_suspended=$1 WHERE id=$2', [suspend, id])

        res.status(200).json({
            success: true,
            message: `Coolie account ${suspend ? 'suspended' : 'reinstated'}.`,
        })
    } catch (err) {
        console.error('suspendCoolie:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

// ─── CUSTOMER MANAGEMENT ─────────────────────────────────────

const getAllCustomers = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query
        const offset = (page - 1) * limit

        const result = await pool.query(
            `SELECT id, name, email, phone, city, total_bookings, avg_rating, is_active, is_banned, banned_reason, profile_photo_url, created_at
             FROM customers ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
            [limit, offset]
        )
        const countResult = await pool.query('SELECT COUNT(*) FROM customers')

        res.status(200).json({
            success: true,
            total: parseInt(countResult.rows[0].count),
            page: parseInt(page),
            data: result.rows,
        })
    } catch (err) {
        console.error('getAllCustomers:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

const banCustomer = async (req, res) => {
    try {
        const { id } = req.params
        const { ban = true, reason } = req.body

        if (ban && (!reason || reason.trim().length < 5)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid ban reason (min 5 characters).' })
        }

        // Get customer details for email
        const customerResult = await pool.query('SELECT name, email FROM customers WHERE id=$1', [id])
        const customer = customerResult.rows[0]
        if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' })

        await pool.query(
            'UPDATE customers SET is_banned=$1, banned_reason=$2 WHERE id=$3', 
            [ban, ban ? reason : null, id]
        )

        // Send email
        const { sendBanEmail } = require('../utils/mailer')
        await sendBanEmail(customer.email, customer.name, reason, !ban).catch(err => console.error('Error sending ban email:', err))

        res.status(200).json({ 
            success: true, 
            message: `Customer ${ban ? 'banned' : 'unbanned'}. ${ban ? 'Ban' : 'Unban'} email sent.` 
        })
    } catch (err) {
        console.error('banCustomer:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

// ─── DASHBOARD STATS ─────────────────────────────────────

const getDashboardStats = async (req, res) => {
    try {
        // Get total users
        const customersResult = await pool.query('SELECT COUNT(*) as count FROM customers WHERE is_banned = false')
        const totalUsers = parseInt(customersResult.rows[0].count)

        // Users created today
        const usersTodayResult = await pool.query('SELECT COUNT(*) as count FROM customers WHERE DATE(created_at) = CURRENT_DATE')
        const usersToday = parseInt(usersTodayResult.rows[0].count)

        // Get active coolies (verified and not suspended)
        const activeCooliesResult = await pool.query(
            'SELECT COUNT(*) as count FROM coolies WHERE is_verified = true AND is_suspended = false AND is_active = true'
        )
        const activeCoolies = parseInt(activeCooliesResult.rows[0].count)

        // Online coolies
        const onlineCooliesResult = await pool.query('SELECT COUNT(*) as count FROM coolies WHERE is_online = true AND is_suspended = false')
        const onlineCoolies = parseInt(onlineCooliesResult.rows[0].count)

        // Get today's bookings
        const todayBookingsResult = await pool.query(
            'SELECT COUNT(*) as count FROM bookings WHERE DATE(created_at) = CURRENT_DATE'
        )
        const todayBookings = parseInt(todayBookingsResult.rows[0].count)

        // Get bookings this hour
        const hourBookingsResult = await pool.query(
            "SELECT COUNT(*) as count FROM bookings WHERE created_at >= NOW() - INTERVAL '1 hour'"
        )
        const hourBookings = parseInt(hourBookingsResult.rows[0].count)

        // Get today's revenue
        const todayRevenueResult = await pool.query(
            'SELECT COALESCE(SUM(amount), 0) as total FROM bookings WHERE DATE(created_at) = CURRENT_DATE AND status = \'completed\''
        )
        const todayRevenue = parseInt(todayRevenueResult.rows[0].total)

        // Get yesterday's revenue
        const yesterdayRevenueResult = await pool.query(
            "SELECT COALESCE(SUM(amount), 0) as total FROM bookings WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day' AND status = 'completed'"
        )
        const yesterdayRevenue = parseInt(yesterdayRevenueResult.rows[0].total)
        
        let revenueChange = 0;
        if (yesterdayRevenue > 0) {
            revenueChange = Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100);
        } else if (todayRevenue > 0) {
            revenueChange = 100;
        }

        // Get open disputes
        const openDisputesResult = await pool.query(
            'SELECT COUNT(*) as count FROM disputes WHERE status = \'open\''
        )
        const openDisputes = parseInt(openDisputesResult.rows[0].count)

        // Get urgent disputes
        const urgentDisputesResult = await pool.query(
            'SELECT COUNT(*) as count FROM disputes WHERE status = \'open\' AND priority = \'high\''
        )
        const urgentDisputes = parseInt(urgentDisputesResult.rows[0].count)

        // Get average rating
        const avgRatingResult = await pool.query(
            'SELECT COALESCE(AVG(rating_avg), 0) as avg_rating FROM coolies WHERE rating_avg IS NOT NULL AND rating_avg > 0'
        )
        const avgRating = parseFloat(avgRatingResult.rows[0].avg_rating)

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                usersToday,
                activeCoolies,
                onlineCoolies,
                todayBookings,
                hourBookings,
                todayRevenue,
                revenueChange,
                openDisputes,
                urgentDisputes,
                avgRating
            }
        })
    } catch (err) {
        console.error('getDashboardStats:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

const getLiveBookings = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                b.id,
                c.name as customer_name,
                co.name as coolie_name,
                b.initial_station_name as station_name,
                b.status,
                b.amount,
                b.created_at
            FROM bookings b
            LEFT JOIN customers c ON b.customer_id = c.id
            LEFT JOIN coolies co ON b.coolie_id = co.id
            WHERE DATE(b.created_at) = CURRENT_DATE
            ORDER BY b.created_at DESC
            LIMIT 10
        `)
        
        const bookings = result.rows.map(booking => ({
            id: `BK-${booking.id}`,
            customer: booking.customer_name ? booking.customer_name.split(' ').map(n => n[0]).join('') + '.' : 'Unknown',
            coolie: booking.coolie_name ? booking.coolie_name.split(' ').map(n => n[0]).join('') + '.' : 'Unknown',
            station: booking.station_name || 'Unknown',
            status: booking.status,
            amount: booking.amount
        }))
        
        res.status(200).json({ success: true, data: bookings })
    } catch (err) {
        console.error('getLiveBookings:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

const getRevenueData = async (req, res) => {
    try {
        const { period = 'today' } = req.query
        let query = ''
        
        if (period === 'today') {
            query = `
                SELECT 
                    EXTRACT(HOUR FROM created_at) as hour,
                    COUNT(*) as bookings,
                    COALESCE(SUM(amount), 0) as revenue
                FROM bookings 
                WHERE DATE(created_at) = CURRENT_DATE AND status = 'completed'
                GROUP BY EXTRACT(HOUR FROM created_at)
                ORDER BY hour
            `
        } else if (period === 'week') {
            query = `
                SELECT 
                    TO_CHAR(created_at, 'Day') as time,
                    COUNT(*) as bookings,
                    COALESCE(SUM(amount), 0) as revenue
                FROM bookings 
                WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' AND status = 'completed'
                GROUP BY TO_CHAR(created_at, 'Day')
                ORDER BY created_at
            `
        }
        
        const result = await pool.query(query)
        
        let chartData = []
        if (period === 'today') {
            // Fill missing hours with 0
            const hourlyData = {}
            for (let i = 0; i < 24; i++) {
                hourlyData[i] = { bookings: 0, revenue: 0 }
            }
            result.rows.forEach(row => {
                hourlyData[row.hour] = { bookings: row.bookings, revenue: row.revenue }
            })
            
            chartData = [
                { time: '12AM', bookings: hourlyData[0].bookings, revenue: hourlyData[0].revenue },
                { time: '2AM', bookings: hourlyData[2].bookings, revenue: hourlyData[2].revenue },
                { time: '4AM', bookings: hourlyData[4].bookings, revenue: hourlyData[4].revenue },
                { time: '6AM', bookings: hourlyData[6].bookings, revenue: hourlyData[6].revenue },
                { time: '8AM', bookings: hourlyData[8].bookings, revenue: hourlyData[8].revenue },
                { time: '10AM', bookings: hourlyData[10].bookings, revenue: hourlyData[10].revenue },
                { time: '12PM', bookings: hourlyData[12].bookings, revenue: hourlyData[12].revenue },
                { time: '2PM', bookings: hourlyData[14].bookings, revenue: hourlyData[14].revenue },
                { time: '4PM', bookings: hourlyData[16].bookings, revenue: hourlyData[16].revenue },
                { time: '6PM', bookings: hourlyData[18].bookings, revenue: hourlyData[18].revenue },
                { time: '8PM', bookings: hourlyData[20].bookings, revenue: hourlyData[20].revenue },
                { time: '10PM', bookings: hourlyData[22].bookings, revenue: hourlyData[22].revenue },
            ]
        } else {
            chartData = result.rows.map(row => ({
                time: row.time,
                bookings: row.bookings,
                revenue: row.revenue
            }))
        }
        
        res.status(200).json({ success: true, data: chartData })
    } catch (err) {
        console.error('getRevenueData:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

const getStationCoverage = async (req, res) => {
    try {
        const totalVerified = await pool.query('SELECT COUNT(*) as count FROM coolies WHERE is_verified = true')
        const total = parseInt(totalVerified.rows[0].count) || 1 // avoid division by zero

        const result = await pool.query(`
            SELECT 
                co.station_name as station,
                COUNT(co.id) as coolies_count
            FROM coolies co
            WHERE co.is_verified = true AND co.is_suspended = false
            GROUP BY co.station_name
            ORDER BY coolies_count DESC
            LIMIT 10
        `)
        
        const coverage = result.rows.map(row => ({
            station: row.station,
            coolies: parseInt(row.coolies_count),
            pct: Math.round((parseInt(row.coolies_count) / total) * 100)
        }))
        
        res.status(200).json({ success: true, data: coverage })
    } catch (err) {
        console.error('getStationCoverage:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

const getUrgentDisputes = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT COUNT(*) as count 
            FROM disputes 
            WHERE status = 'open' AND priority = 'high'
        `)
        
        const count = parseInt(result.rows[0].count)
        
        res.status(200).json({ success: true, data: { count } })
    } catch (err) {
        console.error('getUrgentDisputes:', err)
        res.status(500).json({ success: false, message: 'Server error.' })
    }
}

const getAllBookingsAdmin = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT b.id, b.booking_ref, b.initial_station_name, b.destination_station_name, b.platform, 
                   b.amount, b.status, b.created_at as date, b.otp, b.train_no,
                   c.name as customer_name, co.name as coolie_name,
                   c.id as customerId, co.coolie_id as coolieId
            FROM bookings b
            LEFT JOIN customers c ON b.customer_id = c.id
            LEFT JOIN coolies co ON b.coolie_id = co.id
            WHERE 1=1
        `;
        const params = [];
        if (status && status !== 'all') {
            params.push(status);
            query += ` AND b.status = $${params.length}`;
        }
        if (search) {
            params.push(`%${search}%`);
            query += ` AND (b.booking_ref ILIKE $${params.length} OR c.name ILIKE $${params.length} OR co.name ILIKE $${params.length} OR b.destination_station_name ILIKE $${params.length} OR b.initial_station_name ILIKE $${params.length})`;
        }
        query += ` ORDER BY b.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);
        
        const result = await pool.query(query, params);
        
        const countQuery = `
            SELECT COUNT(*) FROM bookings b
            LEFT JOIN customers c ON b.customer_id = c.id
            LEFT JOIN coolies co ON b.coolie_id = co.id
            WHERE 1=1
            ${status && status !== 'all' ? ` AND b.status = '${status}'` : ''}
            ${search ? ` AND (b.booking_ref ILIKE '%${search}%' OR c.name ILIKE '%${search}%' OR co.name ILIKE '%${search}%' OR b.destination_station_name ILIKE '%${search}%' OR b.initial_station_name ILIKE '%${search}%')` : ''}
        `;
        const countResult = await pool.query(countQuery);
        
        // Map to match frontend expectations
        const formatted = result.rows.map(b => ({
            id: b.booking_ref,
            dbId: b.id,
            customer: b.customer_name || 'Demo Customer',
            customerId: b.customerId || 'N/A',
            coolie: b.coolie_name || 'Demo Coolie',
            coolieId: b.coolieId || 'N/A',
            initialStation: b.initial_station_name,
            station: b.destination_station_name,
            from: b.platform,
            amount: b.amount,
            status: b.status,
            date: b.date,
            otp: b.otp,
            trainNo: b.train_no
        }));
        
        res.status(200).json({ success: true, data: formatted, total: parseInt(countResult.rows[0].count) });
    } catch (err) {
        console.error('getAllBookingsAdmin:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

const getBookingDetailAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT b.*, c.name as customer_name, c.phone as customer_phone, co.name as coolie_name, co.phone as coolie_phone 
            FROM bookings b
            LEFT JOIN customers c ON b.customer_id = c.id
            LEFT JOIN coolies co ON b.coolie_id = co.id
            WHERE b.booking_ref = $1 OR b.id::text = $1
        `, [id]);
        
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
        
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('getBookingDetailAdmin:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

const updateBookingStatusAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await pool.query('UPDATE bookings SET status=$1 WHERE booking_ref=$2 OR id::text=$2', [status, id]);
        res.status(200).json({ success: true, message: `Booking status updated to ${status}.` });
    } catch (err) {
        console.error('updateBookingStatusAdmin:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

const getAllDisputes = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT d.*, b.booking_ref, c.name as customer_name, co.name as coolie_name
            FROM disputes d
            LEFT JOIN bookings b ON d.booking_id = b.id
            LEFT JOIN customers c ON d.customer_id = c.id
            LEFT JOIN coolies co ON d.coolie_id = co.id
            WHERE 1=1
        `;
        const params = [];
        if (status && status !== 'all') {
            params.push(status);
            query += ` AND d.status = $${params.length}`;
        }
        query += ` ORDER BY d.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);
        
        const result = await pool.query(query, params);
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        console.error('getAllDisputes:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

const getDisputeDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT d.*, b.booking_ref, c.name as customer_name, co.name as coolie_name
            FROM disputes d
            LEFT JOIN bookings b ON d.booking_id = b.id
            LEFT JOIN customers c ON d.customer_id = c.id
            LEFT JOIN coolies co ON d.coolie_id = co.id
            WHERE d.id = $1
        `, [id]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Dispute not found' });
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('getDisputeDetails:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

const resolveDispute = async (req, res) => {
    try {
        const { id } = req.params;
        const { resolution } = req.body;
        await pool.query('UPDATE disputes SET status=$1, resolution=$2 WHERE id=$3', ['resolved', resolution, id]);
        res.status(200).json({ success: true, message: 'Dispute resolved.' });
    } catch (err) {
        console.error('resolveDispute:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

const getAnalyticsData = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM customers) as total_customers,
                (SELECT COUNT(*) FROM coolies) as total_coolies,
                (SELECT COUNT(*) FROM bookings) as total_bookings,
                (SELECT COALESCE(SUM(amount), 0) FROM bookings WHERE status = 'completed') as total_revenue
        `);
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error('getAnalyticsData:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

const getUserGrowth = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM customers
            WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY DATE(created_at)
            ORDER BY date
        `);
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        console.error('getUserGrowth:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

const getRevenueAnalytics = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DATE(created_at) as date, SUM(amount) as revenue
            FROM bookings
            WHERE created_at >= CURRENT_DATE - INTERVAL '30 days' AND status = 'completed'
            GROUP BY DATE(created_at)
            ORDER BY date
        `);
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        console.error('getRevenueAnalytics:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

const getStationPerformanceAdmin = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT station_name as name, COUNT(*) as bookings, SUM(amount) as revenue
            FROM bookings
            WHERE status = 'completed'
            GROUP BY station_name
            ORDER BY bookings DESC
        `);
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        console.error('getStationPerformanceAdmin:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
}

const deleteCoolie = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        await client.query('BEGIN');

        // Delete dependencies
        await client.query('DELETE FROM xp_transactions WHERE coolie_id = $1', [id]);
        await client.query('DELETE FROM coolie_xp_profiles WHERE coolie_id = $1', [id]);
        await client.query('DELETE FROM coolie_achievements WHERE coolie_id = $1', [id]);
        await client.query('DELETE FROM location_logs WHERE coolie_id = $1', [id]);
        await client.query('DELETE FROM disputes WHERE coolie_id = $1', [id]);
        await client.query('DELETE FROM bookings WHERE coolie_id = $1', [id]);
        
        // Delete the coolie
        const result = await client.query('DELETE FROM coolies WHERE id = $1 RETURNING name', [id]);
        
        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Coolie not found.' });
        }

        await client.query('COMMIT');
        res.status(200).json({ success: true, message: `Coolie ${result.rows[0].name} and all related data deleted completely.` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('deleteCoolie:', err);
        res.status(500).json({ success: false, message: 'Server error during deletion.' });
    } finally {
        client.release();
    }
}

const deleteCustomer = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        await client.query('BEGIN');

        // Delete dependencies
        await client.query('DELETE FROM disputes WHERE customer_id = $1', [id]);
        await client.query('DELETE FROM bookings WHERE customer_id = $1', [id]);
        
        // Delete the customer
        const result = await client.query('DELETE FROM customers WHERE id = $1 RETURNING name', [id]);
        
        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Customer not found.' });
        }

        await client.query('COMMIT');
        res.status(200).json({ success: true, message: `Customer ${result.rows[0].name} and all related data deleted completely.` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('deleteCustomer:', err);
        res.status(500).json({ success: false, message: 'Server error during deletion.' });
    } finally {
        client.release();
    }
}

module.exports = {
    loginAdmin,
    getPendingCoolies, getCoolieDetail, getAllCoolies,
    approveCoolieLevel1, approveCoolieLevel2,
    rejectCoolie, suspendCoolie,
    getAllCustomers, banCustomer,
    getDashboardStats, getLiveBookings, getRevenueData, getStationCoverage, getUrgentDisputes,
    getAllBookingsAdmin, getBookingDetailAdmin, updateBookingStatusAdmin,
    getAllDisputes, getDisputeDetails, resolveDispute,
    getAnalyticsData, getUserGrowth, getRevenueAnalytics, getStationPerformanceAdmin,
    deleteCoolie, deleteCustomer
}
