const { Pool } = require('pg');
require('dotenv').config();

async function diagnoseConnection() {
  console.log('🔍 Diagnosing AWS RDS connection...\n');
  
  console.log('📋 Current Configuration:');
  console.log(`DB_HOST: ${process.env.DB_HOST}`);
  console.log(`DB_PORT: ${process.env.DB_PORT}`);
  console.log(`DB_NAME: ${process.env.DB_NAME}`);
  console.log(`DB_USER: ${process.env.DB_USER}`);
  console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]'}\n`);

  // Test 1: Connection with SSL required
  console.log('🧪 Test 1: Connection with SSL required...');
  const poolSSL = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { 
      rejectUnauthorized: false,
      sslmode: 'require'
    },
  });

  try {
    const client = await poolSSL.connect();
    console.log('✅ SSL connection successful!');
    const result = await client.query('SELECT version()');
    console.log(`📊 PostgreSQL version: ${result.rows[0].version.substring(0, 50)}...`);
    client.release();
    await poolSSL.end();
    
    console.log('\n🎉 Connection fixed! Restart your server and try again.');
    process.exit(0);
  } catch (error) {
    console.log('❌ SSL connection failed:', error.message);
    await poolSSL.end();
  }

  // Test 2: Connection without SSL
  console.log('\n🧪 Test 2: Connection without SSL...');
  const poolNoSSL = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: false,
  });

  try {
    const client = await poolNoSSL.connect();
    console.log('✅ Non-SSL connection successful!');
    client.release();
    await poolNoSSL.end();
  } catch (error) {
    console.log('❌ Non-SSL connection failed:', error.message);
    await poolNoSSL.end();
  }

  console.log('\n🔧 Troubleshooting Steps:');
  console.log('1. Check AWS RDS Security Group allows your IP (50.159.55.30)');
  console.log('2. Verify RDS instance is publicly accessible');
  console.log('3. Check RDS parameter group for pg_hba.conf settings');
  console.log('4. Ensure RDS instance is in "available" state');
  
  console.log('\n📱 Quick AWS Console Checks:');
  console.log('- RDS Console → Your DB → Connectivity & security');
  console.log('- Public access: Should be "Yes"');
  console.log('- VPC security groups: Should allow port 5432');
}

diagnoseConnection();