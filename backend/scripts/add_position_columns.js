/**
 * Migration script to add starting_position and end_position columns to bookings table
 * Run: node backend/scripts/add_position_columns.js
 */

const pool = require('../src/config/db');

async function addPositionColumns() {
    const client = await pool.connect();
    try {
        console.log('🔄 Adding starting_position and end_position columns to bookings table...');

        await client.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS starting_position VARCHAR(200),
            ADD COLUMN IF NOT EXISTS end_position VARCHAR(200);
        `);

        console.log('✅ Columns added successfully!');
        console.log('   - starting_position: VARCHAR(200)');
        console.log('   - end_position: VARCHAR(200)');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addPositionColumns()
    .then(() => {
        console.log('✅ Migration completed successfully');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    });
