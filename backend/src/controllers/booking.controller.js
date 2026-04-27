const db = require('../config/db');

exports.createBooking = async (req, res) => {
    try {
        const { coolieId, station, platform, destination, luggageSize, luggageCount, date, time, amount, trainNo } = req.body;
        // Generate a random booking reference
        const bookingRef = 'BK' + Math.floor(1000 + Math.random() * 9000);
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        const result = await db.query(`
            INSERT INTO bookings (
                booking_ref, coolie_id, station_name, platform, destination, 
                luggage_size, amount, train_no, otp, status, payment_status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', 'pending')
            RETURNING *
        `, [bookingRef, coolieId, station, platform, destination, luggageSize, amount, trainNo, otp]);

        res.status(201).json({ success: true, booking: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT b.*, c.name as "coolieName", c.rating_avg as "coolieRating", c.total_trips as "coolieTrips", c.badge as "coolieBadge"
            FROM bookings b
            LEFT JOIN coolies c ON b.coolie_id = c.id
            ORDER BY b.created_at DESC
        `);

        // Map to match frontend expectations
        const bookings = result.rows.map(b => ({
            id: b.booking_ref,
            coolieId: b.coolie_id,
            coolieName: b.coolieName || 'Demo Coolie',
            coolieRating: b.coolieRating || 4.8,
            coolieTrips: b.coolieTrips || 0,
            coolieBadge: b.coolieBadge || 'Verified Porter',
            station: b.station_name,
            platform: b.platform,
            destination: b.destination,
            luggageSize: b.luggage_size,
            luggageCount: 3, // Assuming fixed since it isn't in db currently
            date: b.created_at ? b.created_at.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            time: b.created_at ? b.created_at.toISOString().split('T')[1].substring(0, 5) : '00:00',
            amount: b.amount,
            status: b.status,
            paymentStatus: b.payment_status || 'pending',
            rating: b.rating || 0,
            reviewText: b.review_text || '',
            otp: b.otp,
            trainNo: b.train_no
        }));

        res.status(200).json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.rateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, review_text } = req.body;

        const updateBooking = await db.query(
            'UPDATE bookings SET rating = $1, review_text = $2 WHERE booking_ref = $3 RETURNING coolie_id',
            [rating, review_text, id]
        );

        if (updateBooking.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        const coolieId = updateBooking.rows[0].coolie_id;
        
        // Recalculate avg rating for the coolie
        await db.query(`
            UPDATE coolies 
            SET rating_avg = (
                SELECT ROUND(AVG(rating), 2) FROM bookings WHERE coolie_id = $1 AND rating > 0
            )
            WHERE id = $1
        `, [coolieId]);

        res.status(200).json({ success: true, message: 'Rating submitted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.payBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            'UPDATE bookings SET payment_status = $1 WHERE booking_ref = $2 RETURNING *',
            ['paid', id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.status(200).json({ success: true, message: 'Payment successful', booking: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
