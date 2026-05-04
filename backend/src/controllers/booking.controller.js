const db = require('../config/db');

exports.createBooking = async (req, res) => {
    try {
        const { station, initialStation, platform, amount, trainNo, trainName, luggageImgUrl, luggageCount, startingPosition, endPosition } = req.body;
        const customerId = req.user.id;
        
        // Improve matching: station might be "Jaipur Junction (JP)"
        let stationSearch = station;
        let stationCode = '';
        
        const codeMatch = station.match(/\(([^)]+)\)/);
        if (codeMatch) {
            stationCode = codeMatch[1];
            // Also try to match without the code part if needed
            stationSearch = station.split(' (')[0];
        }

        const coolieResult = await db.query(`
            SELECT id FROM coolies 
            WHERE (station_name = $1 OR station_code = $2 OR station_name = $3) 
            AND is_online = true 
            AND is_verified = true
            LIMIT 1
        `, [station, stationCode, stationSearch]);

        if (coolieResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No available coolie found at the destination station.' });
        }

        const coolieId = coolieResult.rows[0].id;
        
        // Generate a random booking reference
        const bookingRef = 'BK' + Math.floor(1000 + Math.random() * 9000);
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        const result = await db.query(`
            INSERT INTO bookings (
                booking_ref, customer_id, coolie_id, initial_station_name, destination_station_name, platform, 
                amount, train_no, train_name, luggage_img_url, luggage_count, otp, status, payment_status,
                starting_position, end_position
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending', 'pending', $13, $14)
            RETURNING *
        `, [bookingRef, customerId, coolieId, initialStation, station, platform, amount, trainNo, trainName, luggageImgUrl, luggageCount, otp, startingPosition, endPosition]);

        const booking = result.rows[0];

        // Emit real-time notification to the assigned coolie
        if (req.io) {
            const socketData = {
                id: booking.booking_ref,
                customer: req.user.name || 'New Customer',
                tag: 'REGULAR',
                platform: booking.platform,
                bags: booking.luggage_count + ' bags',
                to: booking.destination_station_name,
                price: booking.amount,
                timer: 60,
                otp: booking.otp,
                trainNo: booking.train_no,
                trainName: booking.train_name
            };
            req.io.to(`coolie_${coolieId}`).emit('booking:new-request', socketData);
            console.log(`[Socket] New booking ${booking.booking_ref} emitted to coolie_${coolieId}`);
        }

        res.status(201).json({ success: true, booking });
    } catch (error) {
        console.error('createBooking error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const customerId = req.user.id;
        const result = await db.query(`
            SELECT b.*, c.name as "coolieName", c.rating_avg as "coolieRating", c.total_trips as "coolieTrips"
            FROM bookings b
            LEFT JOIN coolies c ON b.coolie_id = c.id
            WHERE b.customer_id = $1
            ORDER BY b.created_at DESC
        `, [customerId]);

        // Map to match frontend expectations
        const bookings = result.rows.map(b => ({
            id: b.booking_ref,
            coolieId: b.coolie_id,
            coolieName: b.coolieName || 'Demo Coolie',
            coolieRating: b.coolieRating || 4.8,
            coolieTrips: b.coolieTrips || 0,
            initialStation: b.initial_station_name,
            station: b.destination_station_name,
            platform: b.platform,
            destination: b.destination_station_name,
            luggageSize: null,
            luggageCount: 3, // Assuming fixed or could be dynamic
            date: b.created_at ? b.created_at.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            time: b.created_at ? b.created_at.toISOString().split('T')[1].substring(0, 5) : '00:00',
            amount: b.amount,
            status: b.status,
            paymentStatus: b.payment_status || 'pending',
            rating: b.rating || 0,
            reviewText: b.review_text || '',
            otp: b.otp,
            trainNo: b.train_no,
            trainName: b.train_name,
            luggageImgUrl: b.luggage_img_url,
            startingPosition: b.starting_position,
            endPosition: b.end_position
        }));

        res.status(200).json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getBookingDetails = async (req, res) => {
    try {
        const { id } = req.params; // booking_ref
        const result = await db.query(`
            SELECT b.*, 
                   c.name as "coolieName", c.passport_photo_url as "cooliePhoto",
                   cust.name as "customerName", cust.phone as "customerPhone"
            FROM bookings b
            LEFT JOIN coolies c ON b.coolie_id = c.id
            LEFT JOIN customers cust ON b.customer_id = cust.id
            WHERE b.booking_ref = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.status(200).json({ success: true, booking: result.rows[0] });
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

exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        let timeColumn = '';
        if (status === 'arrived') timeColumn = 'coolie_arrived_at = NOW(),';
        else if (status === 'in_progress') timeColumn = 'trip_started_at = NOW(),';
        else if (status === 'completed') timeColumn = 'trip_ended_at = NOW(),';

        const query = `
            UPDATE bookings 
            SET status = $1, 
                ${timeColumn}
                updated_at = NOW() 
            WHERE booking_ref = $2 
            RETURNING *
        `;

        const result = await db.query(query, [status, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.status(200).json({ success: true, booking: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
