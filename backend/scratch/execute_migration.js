const pool = require('../src/config/db');

async function runMigration() {
    try {
        console.log('🔄 Starting migration: Adding password_reset_tokens table...');
        
        // Read the SQL file
        const fs = require('fs');
        const path = require('path');
        const sqlFile = path.join(__dirname, 'add_password_reset_tokens.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');
        
        // Execute the migration
        await pool.query(sql);
        
        console.log('✅ Migration completed successfully!');
        console.log('📋 password_reset_tokens table created with all indexes');
        
        // Verify the table was created
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'password_reset_tokens'
        `);
        
        if (result.rows.length > 0) {
            console.log('✅ Verification: Table exists in database');
        } else {
            console.log('❌ Verification: Table was not created');
        }
        
        // Close the connection
        await pool.end();
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
