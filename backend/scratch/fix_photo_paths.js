const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  try {
    const result = await pool.query(`
      UPDATE customers 
      SET profile_photo_url = REPLACE(profile_photo_url, '/uploads/', '/uploads/profile_photos/') 
      WHERE profile_photo_url LIKE '/uploads/%' 
      AND profile_photo_url NOT LIKE '/uploads/profile_photos/%'
    `);
    console.log('Updated rows:', result.rowCount);
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await pool.end();
  }
}

migrate();
