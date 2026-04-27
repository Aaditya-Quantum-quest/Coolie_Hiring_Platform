const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  try {
    console.log('Running migration: Adding train_name and luggage_img_url to bookings...');
    await pool.query(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS train_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS luggage_img_url VARCHAR(255);
    `);
    console.log('✅ Migration successful!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
