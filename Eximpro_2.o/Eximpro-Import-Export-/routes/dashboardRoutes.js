import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// User Dashboard Endpoints
router.get("/user-stats", async (req, res) => {
  try {
    // Mock data for now - would be replaced with actual database queries
    const stats = {
      totalTransactions: 12,
      transactionValue: 15000,
      activeShipments: 3,
      pendingCustoms: 1
    };
    
    res.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
});

router.get("/user-shipments", async (req, res) => {
  try {
    // Mock data for now - would be replaced with actual database queries
    const shipments = [
      {
        id: "shp-1001",
        originCountry: "USA",
        destinationCountry: "India",
        status: "in-transit",
        departureDate: "2023-11-15",
        arrivalDate: "2023-12-05",
        product: "Electronics",
        company: "TechImports Inc."
      },
      {
        id: "shp-1002",
        originCountry: "China",
        destinationCountry: "USA",
        status: "customs-clearance",
        departureDate: "2023-11-20",
        arrivalDate: "2023-12-10",
        product: "Textiles",
        company: "FabricWorld Co."
      }
    ];
    
    res.json(shipments);
  } catch (error) {
    console.error("Error fetching user shipments:", error);
    res.status(500).json({ error: "Failed to fetch user shipments" });
  }
});

router.get("/user-transactions", async (req, res) => {
  try {
    // Mock data for now - would be replaced with actual database queries
    const transactions = [
      {
        id: "trx-2001",
        date: "2023-11-10",
        type: "import",
        amount: 5000,
        status: "completed",
        counterparty: "Global Suppliers Ltd."
      },
      {
        id: "trx-2002",
        date: "2023-11-18",
        type: "export",
        amount: 7500,
        status: "processing",
        counterparty: "European Retailers GmbH"
      },
      {
        id: "trx-2003",
        date: "2023-10-25",
        type: "import",
        amount: 2500,
        status: "completed",
        counterparty: "Asian Manufacturing Co."
      }
    ];
    
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    res.status(500).json({ error: "Failed to fetch user transactions" });
  }
});

// Company Dashboard Endpoints
router.get("/company-stats", async (req, res) => {
  try {
    // Mock data for now - would be replaced with actual database queries
    const stats = {
      totalTransactions: 45,
      transactionValue: 120000,
      activeShipments: 8,
      pendingCustoms: 2
    };
    
    res.json(stats);
  } catch (error) {
    console.error("Error fetching company stats:", error);
    res.status(500).json({ error: "Failed to fetch company stats" });
  }
});

router.get("/company-shipments", async (req, res) => {
  try {
    // Mock data for now - would be replaced with actual database queries
    const shipments = [
      {
        id: "shp-3001",
        originCountry: "Japan",
        destinationCountry: "USA",
        status: "delivered",
        departureDate: "2023-10-20",
        arrivalDate: "2023-11-15",
        product: "Automotive Parts",
        customer: "CarTech Industries"
      },
      {
        id: "shp-3002",
        originCountry: "USA",
        destinationCountry: "Germany",
        status: "in-transit",
        departureDate: "2023-11-05",
        arrivalDate: "2023-11-25",
        product: "Medical Supplies",
        customer: "EuroHealth GmbH"
      },
      {
        id: "shp-3003",
        originCountry: "China",
        destinationCountry: "USA",
        status: "customs-clearance",
        departureDate: "2023-11-10",
        arrivalDate: "2023-12-01",
        product: "Electronics",
        customer: "TechRetail Inc."
      }
    ];
    
    res.json(shipments);
  } catch (error) {
    console.error("Error fetching company shipments:", error);
    res.status(500).json({ error: "Failed to fetch company shipments" });
  }
});

router.get("/company-transactions", async (req, res) => {
  try {
    // Mock data for now - would be replaced with actual database queries
    const transactions = [
      {
        id: "trx-4001",
        date: "2023-11-15",
        type: "export",
        amount: 18500,
        status: "completed",
        customer: "InternationalBuyers Ltd."
      },
      {
        id: "trx-4002",
        date: "2023-11-10",
        type: "import",
        amount: 12000,
        status: "completed",
        supplier: "Global Materials Inc."
      },
      {
        id: "trx-4003",
        date: "2023-11-20",
        type: "export",
        amount: 9500,
        status: "processing",
        customer: "Pacific Traders Co."
      },
      {
        id: "trx-4004",
        date: "2023-11-05",
        type: "import",
        amount: 7800,
        status: "completed",
        supplier: "EastAsian Suppliers"
      }
    ];
    
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching company transactions:", error);
    res.status(500).json({ error: "Failed to fetch company transactions" });
  }
});

router.get("/company-products", async (req, res) => {
  try {
    // Mock data for now - would be replaced with actual database queries
    const products = [
      {
        id: "prod-5001",
        name: "Smartphone X1",
        category: "Electronics",
        sku: "EL-SP-001",
        price: 499.99,
        stock: 150,
        status: "active"
      },
      {
        id: "prod-5002",
        name: "Cotton T-Shirts",
        category: "Apparel",
        sku: "AP-TS-002",
        price: 19.99,
        stock: 500,
        status: "active"
      },
      {
        id: "prod-5003",
        name: "Leather Wallet",
        category: "Accessories",
        sku: "AC-WL-003",
        price: 39.99,
        stock: 200,
        status: "active"
      },
      {
        id: "prod-5004",
        name: "Wireless Earbuds",
        category: "Electronics",
        sku: "EL-WE-004",
        price: 129.99,
        stock: 75,
        status: "low-stock"
      },
      {
        id: "prod-5005",
        name: "Bamboo Cutting Board",
        category: "Kitchen",
        sku: "KT-CB-005",
        price: 24.99,
        stock: 0,
        status: "out-of-stock"
      }
    ];
    
    res.json(products);
  } catch (error) {
    console.error("Error fetching company products:", error);
    res.status(500).json({ error: "Failed to fetch company products" });
  }
});

// User profile endpoint
router.get("/user/profile", async (req, res) => {
  try {
    // Mock data for now - would be replaced with actual database queries
    const profile = {
      id: 1,
      email: "user@example.com",
      name: "John Doe",
      role: "user"
    };
    
    res.json(profile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

export default router; 