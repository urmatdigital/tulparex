const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const config = {
  connectionString: 'postgresql://postgres.bcymbsmwjergqwnkwmbf:Tulpar321654987*@aws-0-eu-central-1.pooler.supabase.com:6543/postgres',
  ssl: {
    rejectUnauthorized: false
  }
};

async function applySequence() {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('Connected to database');

    const sequencePath = path.join(__dirname, '..', 'supabase', 'migrations', '20240326_add_code_sequence.sql');
    const sql = fs.readFileSync(sequencePath, 'utf8');
    
    console.log('Applying sequence and triggers...');
    await client.query(sql);
    console.log('Sequence and triggers applied successfully!');
    
    // Проверяем текущее значение последовательности
    const seqResult = await client.query("SELECT last_value FROM public.client_code_seq;");
    console.log(`Current sequence value: ${seqResult.rows[0].last_value}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

applySequence().catch(console.error);
