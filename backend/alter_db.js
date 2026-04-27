const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Required for Render + Supabase
});

async function updateDb() {
    try {
        console.log('Adding columns to bookings table...');
        await db.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending',
            ADD COLUMN IF NOT EXISTS rating INTEGER,
            ADD COLUMN IF NOT EXISTS review_text TEXT;
        `);
        console.log('✅ Columns added successfully.');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        process.exit();
    }
}

updateDb();
