const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

async function checkDatabases() {
  const client = new Client({
    connectionString: 'postgresql://localhost:5432/postgres',
  });

  try {
    await client.connect();
    console.log('Connected to default postgres database.');
    
    const res = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false;');
    console.log('Available databases:', res.rows.map(r => r.datname));
  } catch (err) {
    console.error('Error checking databases:', err);
  } finally {
    await client.end();
  }
}

checkDatabases();
