require('dotenv').config();
const { Pool } = require('pg');

console.log('🔍 Testing Database Connection...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'NOT SET');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 10000,
    max: 5,
});

async function testConnection() {
    try {
        console.log('⏳ Attempting to connect...');
        
        const client = await pool.connect();
        console.log('✅ Connected successfully!');
        
        const result = await client.query('SELECT NOW() as current_time, version() as version');
        console.log('📊 Database Info:');
        console.log('   Current Time:', result.rows[0].current_time);
        console.log('   Version:', result.rows[0].version.split(' ')[0]);
        
        await client.query('SELECT COUNT(*) as count FROM users');
        console.log('✅ Basic query successful');
        
        client.release();
        console.log('✅ Connection test completed successfully');
        
    } catch (error) {
        console.error('❌ Database connection failed:');
        console.error('   Error:', error.message);
        console.error('   Code:', error.code);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Possible causes:');
            console.log('   - PostgreSQL server is not running');
            console.log('   - Wrong host or port in DATABASE_URL');
            console.log('   - Firewall blocking connection');
        } else if (error.code === '28000') {
            console.log('💡 Possible causes:');
            console.log('   - Wrong username or password');
            console.log('   - Database doesn\'t exist');
        } else if (error.code === '3D000') {
            console.log('💡 Possible causes:');
            console.log('   - Database doesn\'t exist');
        } else if (error.message.includes('timeout')) {
            console.log('💡 Possible causes:');
            console.log('   - Network connectivity issues');
            console.log('   - Database server is overloaded');
            console.log('   - Wrong connection parameters');
        }
        
        console.log('\n🔧 Troubleshooting steps:');
        console.log('1. Check if DATABASE_URL is correctly set in .env file');
        console.log('2. Verify PostgreSQL server is running');
        console.log('3. Test connection with psql or GUI tool');
        console.log('4. Check network connectivity to database server');
    } finally {
        await pool.end();
        console.log('🔚 Pool closed');
    }
}

testConnection();
