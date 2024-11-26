const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  'https://bcymbsmwjergqwnkwmbf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjeW1ic213amVyZ3F3bmt3bWJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjQ1Nzk4MCwiZXhwIjoyMDQ4MDMzOTgwfQ._Z5qgqn5_vqeGwFTmHezg80rprLLjAKYF-M9J448yZo',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function executeSql(sql) {
  try {
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
      console.error('Error executing SQL:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error executing SQL:', error);
    return false;
  }
}

async function applyMigrations() {
  try {
    // Сначала создаем функцию exec_sql
    console.log('Creating exec_sql function...');
    const execSqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '20240326_create_exec_sql.sql');
    const execSqlContent = fs.readFileSync(execSqlPath, 'utf8');
    const { error: execSqlError } = await supabase.rpc('exec_sql', { sql_query: execSqlContent });
    
    if (execSqlError) {
      console.error('Error creating exec_sql function:', execSqlError);
      // Продолжаем выполнение, так как функция может уже существовать
    }

    // Затем создаем основные таблицы
    console.log('Creating tables...');
    const tablesPath = path.join(__dirname, '..', 'supabase', 'migrations', '20240326_create_tables.sql');
    const tablesContent = fs.readFileSync(tablesPath, 'utf8');
    const success = await executeSql(tablesContent);
    
    if (!success) {
      console.error('Failed to create tables');
      process.exit(1);
    }

    console.log('Tables created successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

// Запускаем миграции
applyMigrations().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
