/**
 * Verify total_earnings column exists in coolies table
 * Run: node backend/scripts/verify_total_earnings.js
 */

const pool = require('../src/config/db');

async function verifyTotalEarnings() {
    try {
        console.log('🔍 Checking if total_earnings column exists...');
        
        const result = await pool.query(`
            SELECT column_name, data_type, column_default
            FROM information_schema.columns
            WHERE table_name = 'coolies' AND column_name = 'total_earnings'
        `);
        
        if (result.rows.length > 0) {
            console.log('✅ total_earnings column exists!');
            console.log('   Type:', result.rows[0].data_type);
            console.log('   Default:', result.rows[0].column_default);
            
            // Check current values
            const stats = await pool.query(`
                SELECT 
                    COUNT(*) as total_coolies,
                    SUM(total_earnings) as sum_earnings,
                    AVG(total_earnings) as avg_earnings,
                    MAX(total_earnings) as max_earnings
                FROM coolies
            `);
            
            console.log('\n📊 Current Statistics:');
            console.log('   Total Coolies:', stats.rows[0].total_coolies);
            console.log('   Sum of Earnings: ₹', stats.rows[0].sum_earnings || 0);
            console.log('   Avg Earnings: ₹', parseFloat(stats.rows[0].avg_earnings || 0).toFixed(2));
            console.log('   Max Earnings: ₹', stats.rows[0].max_earnings || 0);
            
        } else {
            console.log('❌ total_earnings column does NOT exist');
            console.log('   The column should already be in schema.sql');
            console.log('   Please run the schema migration or add it manually');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verifyTotalEarnings();
