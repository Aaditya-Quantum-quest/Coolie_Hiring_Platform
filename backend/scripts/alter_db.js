require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await pool.query('ALTER TABLE businesses ADD COLUMN IF NOT EXISTS nearest_station_name VARCHAR(200);');
        console.log('Column added successfully');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
run();