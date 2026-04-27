const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function alterTable() {
  try {
    await client.connect();
    console.log('Connected to database');

    await client.query(`
      ALTER TABLE customers 
      ADD COLUMN IF NOT EXISTS total_bookings INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3,2) DEFAULT 0.00;
    `);

    console.log('Columns total_bookings and avg_rating added to customers table');
  } catch (err) {
    console.error('Error altering table:', err);
  } finally {
    await client.end();
  }
}

alterTable();
