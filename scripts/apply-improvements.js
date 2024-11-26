const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const config = {
  connectionString: 'postgresql://postgres.bcymbsmwjergqwnkwmbf:Tulpar321654987*@aws-0-eu-central-1.pooler.supabase.com:6543/postgres',
  ssl: {
    rejectUnauthorized: false
  }
};

async function applyImprovements() {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('Connected to database');

    const improvementsPath = path.join(__dirname, '..', 'supabase', 'migrations', '20240326_improvements.sql');
    const sql = fs.readFileSync(improvementsPath, 'utf8');
    
    console.log('Applying improvements...');
    await client.query(sql);
    console.log('Improvements applied successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

applyImprovements().catch(console.error);
