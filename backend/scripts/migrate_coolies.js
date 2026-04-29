const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function migrate() {
    try {
        console.log('--- Starting Coolie Schema Migration ---');
        
        // 1. Remove account_number_enc
        console.log('- Removing account_number_enc...');
        await pool.query('ALTER TABLE coolies DROP COLUMN IF EXISTS account_number_enc');
        
        // 2. Add/Ensure missing fields
        console.log('- Adding missing fields...');
        await pool.query(`
            ALTER TABLE coolies 
            ADD COLUMN IF NOT EXISTS alt_phone VARCHAR(15),
            ADD COLUMN IF NOT EXISTS date_of_birth DATE,
            ADD COLUMN IF NOT EXISTS gender VARCHAR(10),
            ADD COLUMN IF NOT EXISTS address TEXT,
            ADD COLUMN IF NOT EXISTS city VARCHAR(100),
            ADD COLUMN IF NOT EXISTS state VARCHAR(100),
            ADD COLUMN IF NOT EXISTS pincode VARCHAR(10),
            ADD COLUMN IF NOT EXISTS station_code VARCHAR(20),
            ADD COLUMN IF NOT EXISTS age INTEGER,
            ADD COLUMN IF NOT EXISTS languages_spoken TEXT[],
            ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100),
            ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(20),
            ADD COLUMN IF NOT EXISTS upi_id VARCHAR(100),
            ADD COLUMN IF NOT EXISTS secondary_doc_front_url TEXT,
            ADD COLUMN IF NOT EXISTS secondary_doc_back_url TEXT
        `);

        // 3. Migrate old secondary_doc_url to secondary_doc_front_url if needed
        console.log('- Syncing secondary document URLs...');
        await pool.query(`
            UPDATE coolies 
            SET secondary_doc_front_url = secondary_doc_url 
            WHERE secondary_doc_front_url IS NULL AND secondary_doc_url IS NOT NULL
        `);
        
        console.log('✅ Migration completed successfully!');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    } finally {
        await pool.end();
        process.exit();
    }
}

migrate();
