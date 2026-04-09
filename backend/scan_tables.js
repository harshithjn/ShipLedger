const { Client } = require('pg');

async function checkTables(dbname) {
  const client = new Client({
    connectionString: `postgresql://localhost:5432/${dbname}`,
  });

  try {
    await client.connect();
    console.log(`Connected to database: ${dbname}`);
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
    console.log(`Tables in ${dbname}:`, res.rows.map(r => r.table_name));
  } catch (err) {
    console.log(`Error checking ${dbname}:`, err.message);
  } finally {
    await client.end();
  }
}

async function run() {
  const dbs = ['postgres', 'jobdb', 'retail_sales', 'atlas_crm'];
  for (const db of dbs) {
    await checkTables(db);
  }
}

run();
