const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  console.log('🚀 Setting up SyncUp database...');
  
  // First, connect to the default 'postgres' database
  const adminPool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'postgres', // Connect to default database first
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🔍 Connecting to PostgreSQL server...');
    const adminClient = await adminPool.connect();
    console.log('✅ Connected successfully!');
    
    // Check if syncup database exists
    const dbCheck = await adminClient.query(`SELECT datname FROM pg_database WHERE datname = 'syncup'`);
    
    if (dbCheck.rows.length === 0) {
      console.log('📝 Creating syncup database...');
      await adminClient.query('CREATE DATABASE syncup');
      console.log('✅ Database "syncup" created successfully!');
    } else {
      console.log('ℹ️  Database "syncup" already exists');
    }
    
    adminClient.release();
    await adminPool.end();
    
    // Now connect to the syncup database and run schema
    console.log('🔧 Setting up database schema...');
    const syncupPool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: 'syncup',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false },
    });
    
    const syncupClient = await syncupPool.connect();
    
    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'src', 'config', 'database.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📊 Executing database schema...');
    await syncupClient.query(schema);
    console.log('✅ Database schema created successfully!');
    
    // Test that tables were created
    const tablesResult = await syncupClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    syncupClient.release();
    await syncupPool.end();
    
    console.log('\n🎉 Database setup complete!');
    console.log('You can now run: node test-db-connection.js');
    
  } catch (err) {
    console.error('❌ Setup failed:', err.message);
    if (err.code === 'ENOTFOUND') {
      console.log('❌ Cannot reach RDS endpoint - check your DB_HOST');
    } else if (err.code === 'ETIMEDOUT') {
      console.log('❌ Connection timeout - check security group allows your IP');
    }
  }
}

setupDatabase();