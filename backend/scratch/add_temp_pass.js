const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function updateDb() {
    try {
        console.log('Adding temp_password column to coolies table...');
        await db.query(`
            ALTER TABLE coolies 
            ADD COLUMN IF NOT EXISTS temp_password TEXT;
        `);
        console.log('✅ Column added successfully.');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        process.exit();
    }
}

updateDb();
