import pg from 'pg';

// Match your connection string format
const connectionString = 'postgresql://postgres:mysecretpassword@localhost:5432/mydb';

const client = new pg.Client({
  connectionString: connectionString
});

async function testConnection() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to PostgreSQL!');
    
    const result = await client.query('SELECT NOW()');
    console.log('Current database time:', result.rows[0].now);
    
    await client.end();
    console.log('Connection closed');
  } catch (err) {
    console.error('Connection error:', err);
  }
}

testConnection(); 