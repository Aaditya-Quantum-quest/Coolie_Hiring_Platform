const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function test() {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, city, is_active, is_banned, created_at
       FROM customers ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [20, 0]
    );
    console.log('Result count:', result.rows.length);
    console.log('Rows:', JSON.stringify(result.rows, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

test();
