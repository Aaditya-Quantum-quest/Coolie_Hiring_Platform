const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function listAdmins() {
    try {
        const r = await pool.query('SELECT name, email, role FROM admins');
        console.log(JSON.stringify(r.rows, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

listAdmins();
