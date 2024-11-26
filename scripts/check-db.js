const { Client } = require('pg');

const config = {
  connectionString: 'postgresql://postgres.bcymbsmwjergqwnkwmbf:Tulpar321654987*@aws-0-eu-central-1.pooler.supabase.com:6543/postgres',
  ssl: {
    rejectUnauthorized: false
  }
};

async function checkDatabase() {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('Connected to database\n');

    // Проверка существующих таблиц
    const tablesQuery = `
      SELECT 
        table_name,
        (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE';
    `;
    
    console.log('Checking tables:');
    const tablesResult = await client.query(tablesQuery);
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name} (${row.column_count} columns)`);
    });

    // Проверка RLS политик
    const policiesQuery = `
      SELECT tablename, policyname, permissive, roles, cmd, qual
      FROM pg_policies
      WHERE schemaname = 'public';
    `;
    
    console.log('\nChecking RLS policies:');
    const policiesResult = await client.query(policiesQuery);
    policiesResult.rows.forEach(row => {
      console.log(`\nTable: ${row.tablename}`);
      console.log(`Policy: ${row.policyname}`);
      console.log(`Command: ${row.cmd}`);
      console.log(`Roles: ${row.roles}`);
    });

    // Проверка индексов
    const indexesQuery = `
      SELECT 
        tablename, 
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public';
    `;
    
    console.log('\nChecking indexes:');
    const indexesResult = await client.query(indexesQuery);
    indexesResult.rows.forEach(row => {
      console.log(`\nTable: ${row.tablename}`);
      console.log(`Index: ${row.indexname}`);
      console.log(`Definition: ${row.indexdef}`);
    });

    // Проверка триггеров
    const triggersQuery = `
      SELECT 
        trigger_name,
        event_manipulation,
        event_object_table,
        action_statement
      FROM information_schema.triggers
      WHERE trigger_schema = 'public';
    `;
    
    console.log('\nChecking triggers:');
    const triggersResult = await client.query(triggersQuery);
    triggersResult.rows.forEach(row => {
      console.log(`\nTable: ${row.event_object_table}`);
      console.log(`Trigger: ${row.trigger_name}`);
      console.log(`Event: ${row.event_manipulation}`);
      console.log(`Action: ${row.action_statement}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkDatabase().catch(console.error);
