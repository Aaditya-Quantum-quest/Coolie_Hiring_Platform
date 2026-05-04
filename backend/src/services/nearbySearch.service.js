const db = require('../config/db');

/**
 * Find nearby coolies within a radius using Haversine formula
 * @param {number} lat Customer latitude
 * @param {number} lng Customer longitude
 * @param {number} radiusMeters Radius to search in meters
 * @returns {Array} List of nearby coolies
 */
const getNearbyConnectedCoolies = async (lat, lng, radiusMeters = 3000) => {
    try {
        const query = `
            SELECT 
                c.id, 
                c.name, 
                c.rating_avg as rating, 
                c.total_trips as "totalBookings",
                c.latitude as lat, 
                c.longitude as lng,
                (6371000 * acos(
                    cos(radians($1)) * cos(radians(c.latitude)) *
                    cos(radians(c.longitude) - radians($2)) +
                    sin(radians($1)) * sin(radians(c.latitude))
                )) AS distance_meters
            FROM coolies c
            WHERE c.is_online = true
              AND c.latitude IS NOT NULL
              AND c.longitude IS NOT NULL
              AND c.last_location_update > NOW() - INTERVAL '5 minutes'
            HAVING (6371000 * acos(
                    cos(radians($1)) * cos(radians(c.latitude)) *
                    cos(radians(c.longitude) - radians($2)) +
                    sin(radians($1)) * sin(radians(c.latitude))
                )) < $3
            ORDER BY distance_meters ASC
            LIMIT 20
        `;
        // Note: PostgreSQL does not support HAVING without GROUP BY unless it's just aggregating.
        // We need a subquery or CTE to filter by distance alias.
        
        const validQuery = `
            WITH NearbyCoolies AS (
                SELECT
                    c.id,
                    c.name,
                    c.rating_avg as rating,
                    c.total_trips as "totalBookings",
                    c.latitude as lat,
                    c.longitude as lng,
                    (6371000 * acos(
                        least(1.0, greatest(-1.0,
                            cos(radians($1)) * cos(radians(c.latitude)) *
                            cos(radians(c.longitude) - radians($2)) +
                            sin(radians($1)) * sin(radians(c.latitude))
                        ))
                    )) AS distance_meters
                FROM coolies c
                WHERE c.is_online = true
                  AND c.latitude IS NOT NULL
                  AND c.longitude IS NOT NULL
                  AND c.last_location_update > NOW() - INTERVAL '5 minutes'
            )
            SELECT * FROM NearbyCoolies
            WHERE distance_meters < $3
            ORDER BY distance_meters ASC
            LIMIT 20
        `;

        const result = await db.query(validQuery, [lat, lng, radiusMeters]);
        
        // Enhance with distance label and base price (mocked basePrice for now or fetch from db)
        return result.rows.map(coolie => ({
            ...coolie,
            distanceLabel: (coolie.distance_meters / 1000).toFixed(1) + ' km',
            basePrice: 100, // Replace with dynamic if needed
            experience: '3 years', // Replace with dynamic if needed
            status: 'available'
        }));
    } catch (error) {
        console.error('Error fetching nearby coolies:', error.message);
        return [];
    }
};

module.exports = {
    getNearbyConnectedCoolies
};
