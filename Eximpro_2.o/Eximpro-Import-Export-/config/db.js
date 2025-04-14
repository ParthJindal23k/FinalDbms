import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Format: postgresql://username:password@host:port/database
const connectionString = 'postgresql://postgres:porush123@localhost:5432/eximpro';

const pool = new Pool({
  connectionString: connectionString
});

export default pool;
