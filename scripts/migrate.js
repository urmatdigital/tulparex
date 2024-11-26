const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Функция для выполнения SQL-запроса через psql
async function executeSql(sql) {
  const result = spawnSync('npx', [
    'supabase',
    'db',
    'execute',
    '--db-url',
    'postgresql://postgres:VW0aHojYjjzGWtr0MsV1nnyh0cUClpo4Gb54uR8TvEQYhRJhz6p0F4LpIsWgjnJ9fInFYKzHdDivxKa2eVI1Rg==@db.htuoynnbsqaxkyadcvnl.supabase.co:5432/postgres'
  ], {
    input: sql,
    encoding: 'utf-8'
  });

  if (result.error) {
    console.error('Error executing SQL:', result.error);
    return false;
  }

  if (result.stderr) {
    console.error('SQL Error:', result.stderr);
    return false;
  }

  console.log('SQL Output:', result.stdout);
  return true;
}

// Функция для применения миграций
async function applyMigrations() {
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  console.log('Found migration files:', files);

  for (const file of files) {
    console.log(`Applying migration: ${file}`);
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    const success = await executeSql(sql);
    if (!success) {
      console.error(`Failed to apply migration: ${file}`);
      process.exit(1);
    }
    
    console.log(`Successfully applied migration: ${file}`);
  }

  console.log('All migrations applied successfully!');
}

// Запускаем миграции
applyMigrations().catch(error => {
  console.error('Migration error:', error);
  process.exit(1);
});
