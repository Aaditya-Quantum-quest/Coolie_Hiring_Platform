require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Required for Render + Supabase
    connectionTimeoutMillis: 15000, // Increased from 5000 to 15000
    idleTimeoutMillis: 30000, // Increased from 10000 to 30000
    max: 20, // Increased from 10 to 20
    min: 2, // Ensure minimum 2 connections
    acquireTimeoutMillis: 60000, // Timeout for acquiring connection
    createTimeoutMillis: 30000, // Timeout for creating new connection
    destroyTimeoutMillis: 5000, // Timeout for destroying connection
    reapIntervalMillis: 1000, // Check for idle connections every second
    createRetryIntervalMillis: 200, // Retry interval for failed connections
});

pool.on('connect', () => {
    console.log('✅ PostgreSQL connected');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL pool error:', err.message);
});

module.exports = pool;