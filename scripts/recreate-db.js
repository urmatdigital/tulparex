const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const config = {
  connectionString: 'postgresql://postgres.bcymbsmwjergqwnkwmbf:Tulpar321654987*@aws-0-eu-central-1.pooler.supabase.com:6543/postgres',
  ssl: {
    rejectUnauthorized: false
  }
};

async function executeSql(client, sql) {
  try {
    await client.query(sql);
    return true;
  } catch (error) {
    console.error('Error executing SQL:', error.message);
    return false;
  }
}

async function recreateDatabase() {
  const client = new Client(config);
  
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    // Удаляем существующие таблицы
    console.log('Dropping existing tables...');
    const dropTablesSQL = `
      DROP TABLE IF EXISTS public.telegram_users CASCADE;
      DROP TABLE IF EXISTS public.packages CASCADE;
      DROP TABLE IF EXISTS public.client_codes CASCADE;
      DROP TABLE IF EXISTS public.profiles CASCADE;
      DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
    `;
    
    const dropSuccess = await executeSql(client, dropTablesSQL);
    if (!dropSuccess) {
      console.error('Failed to drop tables');
      return;
    }
    console.log('Existing tables dropped successfully');

    // Создаем таблицы заново
    console.log('Creating new tables...');
    const createTablesPath = path.join(__dirname, '..', 'supabase', 'migrations', '20240326_create_tables.sql');
    const createTablesSQL = fs.readFileSync(createTablesPath, 'utf8');
    
    const createSuccess = await executeSql(client, createTablesSQL);
    if (!createSuccess) {
      console.error('Failed to create tables');
      return;
    }
    
    console.log('Tables created successfully!');
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await client.end();
  }
}

// Запускаем пересоздание базы данных
recreateDatabase().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
