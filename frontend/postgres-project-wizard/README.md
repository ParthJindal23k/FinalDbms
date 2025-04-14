
# Import Export Management System

A comprehensive system for managing import and export operations, with separate user and company interfaces.

## Project Structure

The project is divided into two main parts:

- **Frontend**: React-based user interface
- **Backend**: Express.js API with PostgreSQL database

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and update with your database credentials:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/import_export_db?schema=public"
   JWT_SECRET="your-secure-jwt-secret"
   ```

4. Run database migrations:
   ```
   npx prisma migrate dev --name init
   ```

5. Start the backend server:
   ```
   npm run dev
   ```
   
   The API server will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

   The application will be available at http://localhost:3000

## Features

- User and Company Authentication
- Product Management
- Shipment Tracking
- Transaction Management
- Customs Documentation

## API Endpoints

- Authentication: `/api/auth/*`
- User Operations: `/api/user/*`
- Products: `/api/products/*`
- Shipments: `/api/shipments/*`
- Transactions: `/api/transactions/*`

## License

This project is licensed under the MIT License - see the LICENSE file for details
