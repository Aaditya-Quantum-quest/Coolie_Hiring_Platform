const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
});

async function fixBookings() {
    try {
        console.log('Fixing bookings table schema...');
        await db.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS luggage_count INTEGER DEFAULT 1;
        `);
        console.log('✅ Column luggage_count added successfully.');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await db.end();
        process.exit();
    }
}

fixBookings();
