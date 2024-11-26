const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const config = {
  user: 'postgres',
  password: 'cd7H/02DUBtU9w1dHWJUGiMVZ8Yn1Hy0A+NVbHJk6IEvR2kyqrOxKoZyb8HgqHSIEynkO8YuUFYmbsz9NydjgA==',
  host: 'db.bcymbsmwjergqwnkwmbf.supabase.co',
  port: 5432,
  database: 'postgres',
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

async function applyMigrations() {
  const client = new Client(config);
  
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log('Found migration files:', files);

    for (const file of files) {
      console.log(`Applying migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      const success = await executeSql(client, sql);
      if (!success) {
        console.error(`Failed to apply migration: ${file}`);
        process.exit(1);
      }
      
      console.log(`Successfully applied migration: ${file}`);
    }

    console.log('All migrations applied successfully!');
  } catch (error) {
    console.error('Database error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Запускаем миграции
applyMigrations().catch(error => {
  console.error('Migration error:', error);
  process.exit(1);
});
