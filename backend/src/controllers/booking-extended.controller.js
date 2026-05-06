const db = require('../config/db');

// Confirm Coolie Arrival
exports.confirmCoolieArrival = async (req, res) => {
    try {
        const { id } = req.params; // booking_ref
        const coolieId = req.user.id;
        
        // Update booking status to arrived
        const result = await db.query(
            'UPDATE bookings SET status = $1, coolie_arrived_at = NOW(), updated_at = NOW() WHERE booking_ref = $2 AND coolie_id = $3 RETURNING *',
            ['arrived', id, coolieId]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found or not assigned to you' });
        }
        
        const booking = result.rows[0];
        
        // Emit notification to customer
        if (req.io) {
            const socketData = {
                id: booking.booking_ref,
                coolie: req.user.name || 'Coolie',
                status: 'arrived',
                message: 'Coolie has arrived! Please confirm to start the trip.'
            };
            req.io.to(`customer_${booking.customer_id}`).emit('booking:coolie-arrived', socketData);
            console.log(`[Socket] Coolie arrival for booking ${booking.booking_ref} emitted to customer_${booking.customer_id}`);
        }
        
        res.status(200).json({ success: true, booking, message: 'Arrival confirmed successfully!' });
    } catch (error) {
        console.error('confirmCoolieArrival error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// Verify OTP and Start Trip
exports.verifyOtpAndStartTrip = async (req, res) => {
    try {
        const { id } = req.params; // booking_ref
        const { otp } = req.body;
        const customerId = req.user.id;
        
        // Verify OTP and start trip
        const result = await db.query(
            'UPDATE bookings SET status = $1, trip_started_at = NOW(), updated_at = NOW() WHERE booking_ref = $2 AND customer_id = $3 AND otp = $4 RETURNING *',
            ['in_progress', id, customerId, otp]
        );
        
        if (result.rowCount === 0) {
            return res.status(400).json({ success: false, message: 'Invalid OTP or booking not found' });
        }
        
        const booking = result.rows[0];
        
        // Emit notification to coolie
        if (req.io) {
            const socketData = {
                id: booking.booking_ref,
                status: 'trip_started',
                message: 'Trip has started! Customer verified with OTP.'
            };
            req.io.to(`coolie_${booking.coolie_id}`).emit('booking:trip-started', socketData);
            console.log(`[Socket] Trip start for booking ${booking.booking_ref} emitted to coolie_${booking.coolie_id}`);
        }
        
        res.status(200).json({ success: true, booking, message: 'Trip started successfully!' });
    } catch (error) {
        console.error('verifyOtpAndStartTrip error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// Complete Trip (Customer marks destination reached)
exports.completeTrip = async (req, res) => {
    try {
        const { id } = req.params; // booking_ref
        const customerId = req.user.id;
        
        // Complete the trip
        const result = await db.query(
            'UPDATE bookings SET status = $1, trip_ended_at = NOW(), updated_at = NOW() WHERE booking_ref = $2 AND customer_id = $3 RETURNING *',
            ['completed', id, customerId]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        const booking = result.rows[0];
        
        // Update coolie's total_earnings and total_trips
        if (booking.coolie_id && booking.amount) {
            await db.query(`
                UPDATE coolies 
                SET total_earnings = total_earnings + $1,
                    total_trips = total_trips + 1
                WHERE id = $2
            `, [booking.amount, booking.coolie_id]);
            
            console.log(`✅ Updated coolie ${booking.coolie_id} earnings: +₹${booking.amount}`);
        }
        
        // Emit notifications
        if (req.io) {
            // Notify coolie
            const coolieSocketData = {
                id: booking.booking_ref,
                status: 'completed',
                message: 'Trip completed! Customer marked destination reached.'
            };
            req.io.to(`coolie_${booking.coolie_id}`).emit('booking:completed', coolieSocketData);
            
            // Notify customer
            const customerSocketData = {
                id: booking.booking_ref,
                status: 'completed',
                message: 'Trip completed! Thank you for using CoolieSeva.'
            };
            req.io.to(`customer_${booking.customer_id}`).emit('booking:completed', customerSocketData);
            
            console.log(`[Socket] Trip completion for booking ${booking.booking_ref} emitted to both parties`);
        }
        
        res.status(200).json({ success: true, booking, message: 'Trip completed successfully!' });
    } catch (error) {
        console.error('completeTrip error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};
