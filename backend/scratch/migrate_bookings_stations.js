const db = require('../src/config/db');

async function migrateBookingsTable() {
    try {
        console.log('Migrating bookings table...');

        // 1. Rename station_name to destination_station_name
        await db.query(`
            ALTER TABLE bookings 
            RENAME COLUMN station_name TO destination_station_name
        `);
        console.log('Renamed station_name to destination_station_name');

        // 2. Add initial_station_name
        await db.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS initial_station_name VARCHAR(255)
        `);
        console.log('Added initial_station_name column');

        console.log('Migration successful!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateBookingsTable();
