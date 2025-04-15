import express from "express";
import pool from "../config/db.js"; // Make sure this exports a configured pg Pool instance

const router = express.Router();

// Helper: get logged-in user ID (replace with your auth logic)
const getUserIdFromReq = (req) => {
  return req.user?.id || "mock-user-id"; // replace this with real auth
};

// User Dashboard Endpoints

router.get("/user-stats", async (req, res) => {
  const userId = getUserIdFromReq(req);
  try {
    const totalTx = await pool.query(
      "SELECT COUNT(*) FROM transaction WHERE userId = $1",
      [userId]
    );
    const valueTx = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) FROM transaction WHERE userId = $1",
      [userId]
    );
    const activeShipments = await pool.query(
      "SELECT COUNT(*) FROM shipment WHERE userId = $1 AND status != 'delivered'",
      [userId]
    );
    const pendingCustoms = await pool.query(
      `SELECT COUNT(*) FROM customs c 
       JOIN shipment s ON s.id = c.shipmentId 
       WHERE s.userId = $1 AND c.complianceStatus != 'cleared'`,
      [userId]
    );

    res.json({
      totalTransactions: Number(totalTx.rows[0].count),
      transactionValue: Number(valueTx.rows[0].coalesce),
      activeShipments: Number(activeShipments.rows[0].count),
      pendingCustoms: Number(pendingCustoms.rows[0].count),
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
});

router.get("/user-shipments", async (req, res) => {
  const userId = getUserIdFromReq(req);
  try {
    const result = await pool.query(
      `SELECT s.id, s.originPort, s.destinationPort, s.status, 
              s.estimatedDelivery, p.name AS product, c.name AS company
       FROM shipment s
       JOIN product p ON s.productId = p.id
       JOIN company c ON s.companyId = c.id
       WHERE s.userId = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching user shipments:", error);
    res.status(500).json({ error: "Failed to fetch user shipments" });
  }
});

router.get("/user-transactions", async (req, res) => {
  const userId = getUserIdFromReq(req);
  try {
    const result = await pool.query(
      `SELECT t.id, t.createdAt as date, t.amount, t.status, t.currency, c.name as counterparty 
       FROM transaction t
       JOIN company c ON t.companyId = c.id
       WHERE t.userId = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    res.status(500).json({ error: "Failed to fetch user transactions" });
  }
});

// Company Dashboard Endpoints
router.get("/company-stats", async (req, res) => {
  const companyId = req.query.companyId;
  try {
    const totalTx = await pool.query(
      "SELECT COUNT(*) FROM transaction WHERE companyId = $1",
      [companyId]
    );
    const valueTx = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) FROM transaction WHERE companyId = $1",
      [companyId]
    );
    const activeShipments = await pool.query(
      "SELECT COUNT(*) FROM shipment WHERE companyId = $1 AND status != 'delivered'",
      [companyId]
    );
    const pendingCustoms = await pool.query(
      `SELECT COUNT(*) FROM customs c 
       JOIN shipment s ON s.id = c.shipmentId 
       WHERE s.companyId = $1 AND c.complianceStatus != 'cleared'`,
      [companyId]
    );

    res.json({
      totalTransactions: Number(totalTx.rows[0].count),
      transactionValue: Number(valueTx.rows[0].coalesce),
      activeShipments: Number(activeShipments.rows[0].count),
      pendingCustoms: Number(pendingCustoms.rows[0].count),
    });
  } catch (error) {
    console.error("Error fetching company stats:", error);
    res.status(500).json({ error: "Failed to fetch company stats" });
  }
});

router.get("/company-shipments", async (req, res) => {
  const companyId = req.query.companyId;
  try {
    const result = await pool.query(
      `SELECT s.id, s.originPort, s.destinationPort, s.status, s.estimatedDelivery, 
              p.name AS product, u.email AS customer
       FROM shipment s
       JOIN product p ON s.productId = p.id
       JOIN "user" u ON s.userId = u.id
       WHERE s.companyId = $1`,
      [companyId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching company shipments:", error);
    res.status(500).json({ error: "Failed to fetch company shipments" });
  }
});

router.get("/company-transactions", async (req, res) => {
  const companyId = req.query.companyId;
  try {
    const result = await pool.query(
      `SELECT t.id, t.createdAt as date, t.amount, t.status, t.currency, u.email as user 
       FROM transaction t
       JOIN "user" u ON t.userId = u.id
       WHERE t.companyId = $1`,
      [companyId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching company transactions:", error);
    res.status(500).json({ error: "Failed to fetch company transactions" });
  }
});

router.get("/company-products", async (req, res) => {
  const companyId = req.query.companyId;
  try {
    const result = await pool.query(
      `SELECT p.id, p.name, pc.category, p.stock, p.unitCost
       FROM product p
       JOIN productcategory pc ON p.hsCode = pc.hsCode
       WHERE p.companyId = $1`,
      [companyId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching company products:", error);
    res.status(500).json({ error: "Failed to fetch company products" });
  }
});

// User Profile
router.get("/user/profile", async (req, res) => {
  const userId = getUserIdFromReq(req);
  try {
    const result = await pool.query(
      "SELECT id, email, role FROM \"user\" WHERE id = $1",
      [userId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

export default router;
