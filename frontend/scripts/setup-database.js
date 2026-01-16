/**
 * Setup Script for Better Auth / Neon Auth Schema
 *
 * This script creates the required tables in the Neon database
 * for Better Auth to function properly.
 *
 * Usage: node scripts/setup-database.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  console.error('Please add your Neon database connection string to .env');
  process.exit(1);
}

async function setupDatabase() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to Neon database...');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'setup-neon-auth.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing schema setup...');

    // Execute the SQL
    await pool.query(sql);

    console.log('Schema setup completed successfully!');
    console.log('');
    console.log('Created tables:');
    console.log('  - neon_auth.user');
    console.log('  - neon_auth.session');
    console.log('  - neon_auth.account');
    console.log('  - neon_auth.verification');
    console.log('');
    console.log('Better Auth is now ready to use with Neon!');

  } catch (error) {
    console.error('Error setting up database:', error.message);

    if (error.message.includes('already exists')) {
      console.log('');
      console.log('Note: Some tables may already exist. This is normal if you\'re re-running setup.');
    }

    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
