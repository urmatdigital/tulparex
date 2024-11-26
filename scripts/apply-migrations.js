require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function applyMigration(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error(`Error applying migration ${filePath}:`, error);
      return false;
    }
    
    console.log(`Successfully applied migration: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error reading or applying migration ${filePath}:`, error);
    return false;
  }
}

async function applyMigrations() {
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  console.log('Found migration files:', files);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const success = await applyMigration(filePath);
    
    if (!success) {
      console.error('Migration failed. Stopping.');
      process.exit(1);
    }
  }

  console.log('All migrations applied successfully!');
}

applyMigrations().catch(console.error);
