import { promises as fs } from 'fs';
import path from 'path';
import pool from '../config/db.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  try {
    console.log('Setting up the database...');

    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');

    // Execute the schema SQL
    await pool.query(schema);
    
    console.log('Database schema created successfully');

    // Check if gen_random_uuid() function is available
    try {
      await pool.query('SELECT gen_random_uuid()');
    } catch (error) {
      console.log('Adding uuid-ossp extension for UUID generation...');
      await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      console.log('Extension added successfully');
    }

    // Create a default admin user
    const adminExists = await pool.query(
      'SELECT * FROM users WHERE role = $1',
      ['ADMIN']
    );

    if (adminExists.rows.length === 0) {
      console.log('Creating default admin user...');
      await pool.query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)',
        ['admin@eximpro.com', '$2a$10$JYtYw.ZIJzfTmrRQZiTn6.XvGy7K1GpM.mfQnGu7zPPi/8S3nP.jC', 'ADMIN'] // Password: admin123
      );
      console.log('Default admin user created successfully');
    }

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
}

setupDatabase(); 