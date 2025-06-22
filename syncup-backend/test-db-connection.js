const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing database connection...');
  
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }, // For AWS RDS
  });

  try {
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Connected to database successfully!');
    
    // Test basic query
    const result = await client.query('SELECT version()');
    console.log('📊 PostgreSQL version:', result.rows[0].version);
    
    // Check if our database exists
    const dbCheck = await client.query(`SELECT datname FROM pg_database WHERE datname = '${process.env.DB_NAME}'`);
    if (dbCheck.rows.length > 0) {
      console.log(`✅ Database '${process.env.DB_NAME}' exists`);
    } else {
      console.log(`❌ Database '${process.env.DB_NAME}' not found`);
    }
    
    client.release();
    
  } catch (err) {
    console.error('❌ Database connection failed:');
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    console.error('Full error:', err);
    
    console.log('\n🔧 Troubleshooting:');
    
    if (err.code === 'ENOTFOUND') {
      console.log('❌ DNS resolution failed - check your DB_HOST in .env');
    } else if (err.code === 'ECONNREFUSED') {
      console.log('❌ Connection refused - check security group rules');
    } else if (err.code === 'ETIMEDOUT') {
      console.log('❌ Connection timeout - check security group or RDS status');
    } else if (err.message.includes('password')) {
      console.log('❌ Authentication failed - check username/password');
    }
    
    console.log('\n📝 Current config:');
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]');
  } finally {
    await pool.end();
  }
}

testConnection();