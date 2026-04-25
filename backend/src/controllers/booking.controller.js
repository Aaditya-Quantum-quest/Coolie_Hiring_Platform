const db = require('../config/db');

exports.createBooking = async (req, res) => {
    try {
        const { coolieId, station, platform, destination, luggageSize, luggageCount, date, time, amount, trainNo } = req.body;
        // In a real app, customerId would come from req.user (auth middleware)
        // For demo data, we'll assign a random existing customer or just leave it null if constraints allow
        
        // Generate a random booking reference
        const bookingRef = 'BK' + Math.floor(Math.random() * 10000);
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        const result = await db.query(`
            INSERT INTO bookings (
                booking_ref, coolie_id, station_name, platform, destination, 
                luggage_size, amount, train_no, otp, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
            RETURNING *
        `, [bookingRef, coolieId, station, platform, destination, luggageSize, amount, trainNo, otp]);

        res.status(201).json({ success: true, booking: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        // Ideally this filters by req.user.id
        // For now, we'll return all bookings to mimic the mockData exactly
        const result = await db.query(`
            SELECT b.*, c.name as "coolieName"
            FROM bookings b
            LEFT JOIN coolies c ON b.coolie_id = c.id
            ORDER BY b.created_at DESC
        `);

        // Map to match frontend expectations
        const bookings = result.rows.map(b => ({
            id: b.booking_ref,
            coolieId: b.coolie_id,
            coolieName: b.coolieName || 'Demo Coolie',
            station: b.station_name,
            platform: b.platform,
            destination: b.destination,
            luggageSize: b.luggage_size,
            luggageCount: 3, // mock
            date: b.created_at.toISOString().split('T')[0],
            time: b.created_at.toISOString().split('T')[1].substring(0, 5),
            amount: b.amount,
            status: b.status,
            paymentStatus: 'paid', // mock
            rating: 5, // mock
            otp: b.otp,
            trainNo: b.train_no
        }));

        res.status(200).json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
