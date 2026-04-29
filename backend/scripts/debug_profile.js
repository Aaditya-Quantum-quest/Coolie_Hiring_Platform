const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
    try {
        const coolies = await pool.query("SELECT id, name, coolie_id FROM coolies LIMIT 5");
        console.log('Coolies:', coolies.rows);
        
        if (coolies.rows.length > 0) {
            const id = coolies.rows[0].id;
            const profile = await pool.query("SELECT * FROM coolie_xp_profiles WHERE coolie_id = $1", [id]);
            console.log('Profile for first coolie:', profile.rows);
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

check();
