const db = require('../config/db');

const updateCoolieLocationInDB = async (coolieId, lat, lng, isOnline = true) => {
    try {
        if (isOnline) {
            console.log(`[Status] Coolie ${coolieId} is ONLINE at ${lat}, ${lng}`);
        }
        await db.query(
            `UPDATE coolies 
             SET is_online = $1, latitude = $2, longitude = $3, last_location_update = NOW() 
             WHERE id = $4`,
            [isOnline, lat, lng, coolieId]
        );
    } catch (error) {
        console.error('Error updating coolie location:', error.message);
    }
};

const setCoolieOffline = async (coolieId) => {
    try {
        console.log(`[Status] Setting coolie ${coolieId} to OFFLINE`);
        await db.query(
            `UPDATE coolies 
             SET is_online = false 
             WHERE id = $1`,
            [coolieId]
        );
    } catch (error) {
        console.error('Error setting coolie offline:', error.message);
    }
};

const logLocation = async (coolieId, bookingId, lat, lng) => {
    if (!bookingId) return; // Only log active booking tracks
    try {
        await db.query(
            `INSERT INTO location_logs (coolie_id, booking_id, latitude, longitude)
             VALUES ($1, $2, $3, $4)`,
            [coolieId, bookingId, lat, lng]
        );
    } catch (error) {
        console.error('Error logging location:', error.message);
    }
};

const getBookingCustomerLocation = async (bookingId) => {
    // Currently customer doesn't have live location on their side, they have station/platform
    // For this implementation, we will assume customer location is fixed from the booking creation.
    // Or we could track customer location if provided.
    // For now we simulate that customer location is available or return dummy for testing.
    return { customerLat: 28.6410, customerLng: 77.2190 };
};

// Haversine JS implementation for quick arrival check
const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
};

module.exports = {
    updateCoolieLocationInDB,
    setCoolieOffline,
    logLocation,
    getBookingCustomerLocation,
    haversine
};
