import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Format: postgresql://username:password@host:port/database
const connectionParams = {
  user: 'postgres',
  password: 'mysecretpassword',
  host: 'localhost',
  port: 5432,
  database: 'postgres' // Connect to default database initially
};

// Target database name
const targetDatabase = 'mydb';

async function initializeDatabase() {
  // Connect to default postgres database
  const adminClient = new pg.Client({
    connectionString: `postgresql://${connectionParams.user}:${connectionParams.password}@${connectionParams.host}:${connectionParams.port}/${connectionParams.database}`
  });

  try {
    console.log('Connecting to PostgreSQL default database...');
    await adminClient.connect();
    
    // Check if target database exists
    const dbCheckResult = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [targetDatabase]
    );

    // Create database if it doesn't exist
    if (dbCheckResult.rows.length === 0) {
      console.log(`Creating database "${targetDatabase}"...`);
      await adminClient.query(`CREATE DATABASE ${targetDatabase}`);
      console.log('Database created successfully');
    } else {
      console.log(`Database "${targetDatabase}" already exists`);
    }
    
    // Close admin connection
    await adminClient.end();
    
    // Connect to the target database to create schema
    const appClient = new pg.Client({
      connectionString: `postgresql://${connectionParams.user}:${connectionParams.password}@${connectionParams.host}:${connectionParams.port}/${targetDatabase}`
    });
    
    await appClient.connect();
    console.log(`Connected to database "${targetDatabase}"`);
    
    // Read schema SQL
    try {
      const schemaPath = path.join(__dirname, 'database', 'schema.sql');
      const schemaSQL = await fs.readFile(schemaPath, 'utf8');
      
      console.log('Creating schema...');
      await appClient.query(schemaSQL);
      console.log('Schema created successfully');
      
      // Add extension if needed
      try {
        await appClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        console.log('UUID extension enabled');
      } catch (extErr) {
        console.error('Error creating extension:', extErr.message);
      }
      
    } catch (err) {
      console.error('Error executing schema:', err);
    } finally {
      await appClient.end();
    }
    
    console.log('Database initialization completed');
    
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

// Run the initialization
initializeDatabase(); 