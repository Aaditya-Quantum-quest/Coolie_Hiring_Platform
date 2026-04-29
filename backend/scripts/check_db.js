const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
    try {
        const r = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables:', r.rows.map(row => row.table_name));
        
        const profileTable = await pool.query("SELECT * FROM information_schema.columns WHERE table_name = 'coolie_xp_profiles'");
        console.log('Columns in coolie_xp_profiles:', profileTable.rows.map(row => row.column_name));

        const coolieTable = await pool.query("SELECT * FROM information_schema.columns WHERE table_name = 'coolies'");
        console.log('Columns in coolies:', coolieTable.rows.map(row => row.column_name));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

check();
