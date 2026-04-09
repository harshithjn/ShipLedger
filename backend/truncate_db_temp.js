const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

async function truncate() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database.');
    
    console.log('Truncating tables...');
    await client.query('TRUNCATE TABLE notifications, shipment_meta RESTART IDENTITY CASCADE;');
    console.log('✅ Tables truncated successfully.');
    
    const res = await client.query('SELECT COUNT(*) FROM shipment_meta;');
    console.log(`Remaining records in shipment_meta: ${res.rows[0].count}`);
  } catch (err) {
    console.error('Error during truncation:', err);
  } finally {
    await client.end();
  }
}

truncate();
