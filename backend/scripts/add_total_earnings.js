/**
 * Migration Script: Add total_earnings column to coolies table
 * Run: node backend/scripts/add_total_earnings.js
 */

const pool = require('../src/config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    const client = await pool.connect();
    
    try {
        console.log('🚀 Starting migration: Add total_earnings column...\n');
        
        // Read SQL file
        const sqlPath = path.join(__dirname, 'add_total_earnings.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Execute migration
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        
        console.log('✅ Migration completed successfully!');
        console.log('   - Added total_earnings column to coolies table');
        console.log('   - Created index on total_earnings');
        console.log('   - Updated existing coolies with calculated earnings');
        console.log('   - Created triggers to auto-update earnings on booking completion\n');
        
        // Verify the changes
        const result = await client.query(`
            SELECT 
                COUNT(*) as total_coolies,
                SUM(total_earnings) as total_earnings_sum,
                AVG(total_earnings) as avg_earnings
            FROM coolies
        `);
        
        console.log('📊 Current Statistics:');
        console.log(`   - Total Coolies: ${result.rows[0].total_coolies}`);
        console.log(`   - Total Earnings Sum: ₹${parseFloat(result.rows[0].total_earnings_sum || 0).toFixed(2)}`);
        console.log(`   - Average Earnings: ₹${parseFloat(result.rows[0].avg_earnings || 0).toFixed(2)}\n`);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
