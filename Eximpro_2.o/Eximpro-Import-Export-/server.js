import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import shipmentRoutes from "./routes/shipmentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import pool from "./config/db.js";

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(cors({ 
  origin: [
    "http://localhost:5173", 
    "http://localhost:3000", 
    "http://localhost:8080"  // Added for the Vite dev server port
  ], 
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Test database connection endpoint
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      success: true, 
      message: "Database connection successful",
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Database connection failed",
      error: error.message 
    });
  }
});
// API routes
// server.js or app.js
console.log("1");
import searchRoutes from './routes/search.js';
app.use('/api/search', searchRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/products", productRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Production mode - serve static files and handle SPA routing
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app build directory
  const frontendBuildPath = path.resolve(__dirname, '../../frontend/frontend/dist');
  app.use(express.static(frontendBuildPath));

  // Handle SPA routing - send all requests to index.html
  app.get('*', (req, res) => {
    // Only handle non-API routes
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    }
  });
}

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
