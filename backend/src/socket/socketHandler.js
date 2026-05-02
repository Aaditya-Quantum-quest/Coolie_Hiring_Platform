const { updateCoolieLocationInDB, setCoolieOffline, logLocation, getBookingCustomerLocation, haversine } = require('./locationEvents');
const { getNearbyConnectedCoolies } = require('../services/nearbySearch.service');

const setupSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        // Coolie goes online
        socket.on('coolie:go-online', async ({ coolieId, lat, lng }) => {
            if (!coolieId) return;
            await updateCoolieLocationInDB(coolieId, lat, lng, true);
            socket.join(`coolie_${coolieId}`);
            socket.coolieId = coolieId;
            
            // Broadcast nearby coolies to anyone in the general tracking pool
            const nearby = await getNearbyConnectedCoolies(lat, lng);
            io.emit('nearby:coolies-update', nearby);
        });

        // Coolie goes offline
        socket.on('coolie:go-offline', async ({ coolieId }) => {
            if (!coolieId) return;
            await setCoolieOffline(coolieId);
            socket.leave(`coolie_${coolieId}`);
            delete socket.coolieId;
        });

        // Coolie sends location update
        socket.on('coolie:location-update', async ({ coolieId, lat, lng, bookingId }) => {
            if (!coolieId) return;
            await updateCoolieLocationInDB(coolieId, lat, lng);
            
            if (bookingId) {
                // Log the location track
                await logLocation(coolieId, bookingId, lat, lng);
                
                // Broadcast to customer in this booking's room
                socket.to(`booking_${bookingId}`).emit('coolie:location-changed', {
                    coolieId, lat, lng, timestamp: Date.now()
                });

                // Check arrival (within 50 meters)
                const customerLoc = await getBookingCustomerLocation(bookingId);
                const dist = haversine(lat, lng, customerLoc.customerLat, customerLoc.customerLng);
                if (dist < 50) {
                    io.to(`booking_${bookingId}`).emit('coolie:arrived', { coolieId, bookingId });
                }
            } else {
                // If not in a booking, occasionally broadcast nearby update
                // Rate limit or throttle this in production
                const nearby = await getNearbyConnectedCoolies(lat, lng);
                io.emit('nearby:coolies-update', nearby);
            }
        });

        // Customer joins tracking room
        socket.on('customer:request-tracking', ({ bookingId, customerId }) => {
            socket.join(`booking_${bookingId}`);
            console.log(`Customer ${customerId} joined tracking for booking ${bookingId}`);
        });

        // Customer leaves tracking room
        socket.on('customer:stop-tracking', ({ bookingId }) => {
            socket.leave(`booking_${bookingId}`);
            console.log(`Customer left tracking for booking ${bookingId}`);
        });

        socket.on('disconnect', async () => {
            console.log(`Socket disconnected: ${socket.id}`);
            // Removed automatic offline to prevent flakiness. 
            // Coolie stays online until they explicitly click "Go Offline" or session expires.
            /*
            if (socket.coolieId) {
                await setCoolieOffline(socket.coolieId);
            }
            */
        });
    });
};

module.exports = setupSocketHandlers;
