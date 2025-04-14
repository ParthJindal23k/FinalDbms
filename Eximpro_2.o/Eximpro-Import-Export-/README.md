# Eximpro - Import Export Management System

A full-stack application for managing import and export operations, including products, shipments, customs, and transactions.

## Database Setup with PostgreSQL and pgAdmin4

This application now uses raw PostgreSQL instead of Prisma ORM. Follow these steps to set up your database:

### Prerequisites

1. Install PostgreSQL and pgAdmin4:
   - Download from [PostgreSQL official website](https://www.postgresql.org/download/)
   - This will also install pgAdmin4

2. During installation:
   - Set a password for the postgres user (remember this password)
   - The default port is 5432
   - Select your locale

### Database Setup

1. **Using pgAdmin4:**
   - Open pgAdmin4
   - Connect to the PostgreSQL server (right-click on Servers > Register > Server)
   - Create a new database named "eximpro" (right-click on Databases > Create > Database)

2. **Using the Setup Script:**
   - Update the `.env` file with your database credentials
   - Run the database setup script:
   ```bash
   node database/setup.js
   ```

3. **Manual Setup:**
   - In pgAdmin4, right-click on the "eximpro" database
   - Select "Query Tool"
   - Copy and paste the contents of `database/schema.sql`
   - Execute the script

### Configuration

Update the `.env` file with your PostgreSQL credentials:

```
PORT=5001
DB_USER=postgres        # Your PostgreSQL username
DB_HOST=localhost       # Your PostgreSQL host
DB_NAME=eximpro         # Database name
DB_PASSWORD=your_password # Your PostgreSQL password
DB_PORT=5432            # PostgreSQL port
NODE_ENV=development
JWT_SECRET=ThisisaJWTSECRETKEY
```

## Running the Application

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Test the database connection:
- Visit `http://localhost:5001/api/test-db` in your browser

## Working with PostgreSQL and pgAdmin4

### Basic pgAdmin4 Operations

1. **Viewing Table Structure:**
   - In pgAdmin4, expand your database > Schemas > public > Tables
   - Right-click on any table and select "Properties" to view its structure

2. **Viewing Data:**
   - Right-click on a table and select "View/Edit Data" > "All Rows"

3. **Running Queries:**
   - Right-click on the database and select "Query Tool"
   - Write and execute SQL queries

### Useful SQL Queries

Here are some useful SQL queries for managing your data:

```sql
-- List all users
SELECT * FROM users;

-- List all companies
SELECT * FROM companies;

-- List products with company info
SELECT p.*, c.name as company_name 
FROM products p
JOIN companies c ON p.company_id = c.id;

-- List shipments with product and company info
SELECT s.*, p.name as product_name, c.name as company_name
FROM shipments s
JOIN products p ON s.product_id = p.id
JOIN companies c ON s.company_id = c.id;

-- List transactions with company info
SELECT t.*, c.name as company_name
FROM transactions t
JOIN companies c ON t.company_id = c.id;
```

### Backing Up Your Database

To create a backup of your database using pgAdmin4:

1. Right-click on your database
2. Select "Backup..."
3. Configure backup settings and click "Backup"

### Restoring Your Database

To restore a database backup using pgAdmin4:

1. Right-click on your database
2. Select "Restore..."
3. Configure restore settings and click "Restore"

## API Endpoints

- Auth: `/api/auth`
- Companies: `/api/companies`
- Products: `/api/products`
- Shipments: `/api/shipments`
- Transactions: `/api/transactions`

## Default Admin User

- Email: admin@eximpro.com
- Password: admin123 