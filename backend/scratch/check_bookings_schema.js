const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
    try {
        const bookingsTable = await pool.query("SELECT * FROM information_schema.columns WHERE table_name = 'bookings'");
        console.log('Columns in bookings:', bookingsTable.rows.map(row => row.column_name));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

check();
