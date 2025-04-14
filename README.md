# Import-Export Management System

A comprehensive platform for managing import-export operations with a React frontend and Node.js Express backend.

## Project Structure

```
project/
├── Eximpro_2.o/           # Backend code
│   ├── Eximpro-Import-Export-/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── config/
│   │   └── server.js
│   ├── database/
│   └── package.json
│
└── frontend/              # Frontend code
    └── frontend/
        ├── src/
        ├── public/
        ├── index.html
        ├── vite.config.js
        └── package.json
```

## Setup & Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Eximpro_2.o
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables by creating a `.env` file with the following:
   ```
   PORT=5001
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=your_db_name
   JWT_SECRET=your_secret_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Connection Between Frontend and Backend

The frontend and backend are connected in the following ways:

1. **API Calls**: The frontend makes API calls to the backend using Axios
   - Centralized API service in `frontend/frontend/src/services/api.js` provides a consistent interface
   - Axios instance is configured with proper defaults for all API calls

2. **Proxy Configuration**: The Vite development server proxies API requests to the backend
   - Configuration in `frontend/frontend/vite.config.js`
   - All `/api/*` requests are forwarded to `http://localhost:5001`

3. **CORS Configuration**: The backend allows requests from the frontend origins
   - Configuration in `Eximpro_2.o/Eximpro-Import-Export-/server.js`
   - Allowed origins: `http://localhost:5173` and `http://localhost:3000`

## Using the API Service

The API service uses Axios for all HTTP requests and provides the following methods:

```javascript
// Simple GET request
import { get } from '../services/api';
const data = await get('/endpoint');

// POST request with data
import { post } from '../services/api';
const result = await post('/endpoint', { key: 'value' });

// PUT request to update a resource
import { put } from '../services/api';
const updated = await put('/endpoint/123', { key: 'updated value' });

// DELETE request
import { del } from '../services/api';
const result = await del('/endpoint/123');

// Access the Axios instance directly for advanced use cases
import apiService from '../services/api';
const response = await apiService.axiosInstance.post('/endpoint', data, {
  headers: { 'Custom-Header': 'value' }
});
```

The API service handles error responses and automatically parses JSON responses. For more examples, see the `AxiosExamples.jsx` component.

## Development Workflow

1. Run both the frontend and backend development servers
2. The frontend API service will handle requests to the backend
3. API requests are automatically proxied to the backend

## Production Deployment

1. Build the frontend:
   ```bash
   cd frontend/frontend
   npm run build
   ```

2. The backend is configured to serve the frontend static files in production mode
3. Run the backend in production mode:
   ```bash
   cd Eximpro_2.o
   NODE_ENV=production npm start
   ```
   
4. Or use the deploy script from the backend directory:
   ```bash
   npm run deploy
   ```

## API Routes

- `/api/auth/*` - Authentication routes
- `/api/companies/*` - Company management
- `/api/products/*` - Product management 
- `/api/shipments/*` - Shipment management
- `/api/transactions/*` - Transaction management

## Connection Test

A connection test component is available at the homepage to verify the frontend is properly connected to the backend. 