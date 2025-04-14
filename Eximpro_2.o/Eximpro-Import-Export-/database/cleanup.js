import pool from '../config/db.js';

async function cleanupDatabase() {
  try {
    console.log('Starting database cleanup...');

    // Disable foreign key constraints temporarily
    await pool.query('SET session_replication_role = replica;');

    // Clear all tables
    console.log('Clearing tables...');
    await pool.query('TRUNCATE customs, shipments, products, product_categories, transactions, sessions, companies, users RESTART IDENTITY CASCADE;');

    // Re-enable foreign key constraints
    await pool.query('SET session_replication_role = DEFAULT;');

    console.log('Database cleanup completed successfully');
  } catch (error) {
    console.error('Error cleaning up database:', error);
    process.exit(1);
  } finally {
    // Close the pool
    await pool.end();
  }
}

export default cleanupDatabase;

// Check if script is run directly
if (process.argv[1].endsWith('cleanup.js')) {
  // Ask for confirmation
  console.log('WARNING: This will delete ALL data from the database!');
  console.log('Are you sure you want to continue? (yes/no)');
  
  process.stdin.once('data', async (data) => {
    const answer = data.toString().trim().toLowerCase();
    
    if (answer === 'yes' || answer === 'y') {
      await cleanupDatabase();
      process.exit(0);
    } else {
      console.log('Database cleanup cancelled');
      process.exit(0);
    }
  });
} 