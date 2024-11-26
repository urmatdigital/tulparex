const { Client } = require('pg');

const config = {
  connectionString: 'postgresql://postgres.bcymbsmwjergqwnkwmbf:Tulpar321654987*@aws-0-eu-central-1.pooler.supabase.com:6543/postgres',
  ssl: {
    rejectUnauthorized: false
  }
};

async function checkTable() {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('Connected to database\n');

    const query = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'packages'
      ORDER BY ordinal_position;
    `;
    
    const result = await client.query(query);
    console.log('Columns in packages table:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type}, ${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkTable().catch(console.error);
