const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function fixSchema() {
    try {
        console.log('--- Fixing Coolie Schema constraints ---');
        
        // 1. Make old columns nullable or drop them
        console.log('- Making old document columns nullable...');
        await pool.query(`
            ALTER TABLE coolies 
            ALTER COLUMN secondary_doc_url DROP NOT NULL
        `);
        
        // 2. Ensure new columns are NOT NULL if desired, but for now just leave them as they are
        
        console.log('✅ Schema fix completed successfully!');
    } catch (err) {
        console.error('❌ Schema fix failed:', err.message);
    } finally {
        await pool.end();
        process.exit();
    }
}

fixSchema();
