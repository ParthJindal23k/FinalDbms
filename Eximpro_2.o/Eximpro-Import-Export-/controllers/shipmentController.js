import pool from "../config/db.js";
import { sendShipmentDelayNotification } from "../utils/emailService.js";

export const createShipment = async (req, res) => {
  const { productId, quantity, originPort, destinationPort, status, estimatedDelivery, companyId } = req.body;

  if (!productId || !destinationPort || !companyId) {
    return res.status(400).json({ error: "Missing required fields: productId, destinationPort, or companyId" });
  }

  try {
    console.log("User from request:", req.user);

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized: User ID not found in request" });
    }

    const userId = req.user.userId;

    // Check if user exists
    const userResult = await pool.query(
      'SELECT email FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create shipment
    const shipmentResult = await pool.query(
      `INSERT INTO shipments (product_id, quantity, origin_port, destination_port, status, estimated_delivery, user_id, company_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        productId, 
        quantity, 
        originPort, 
        destinationPort, 
        status, 
        estimatedDelivery ? new Date(estimatedDelivery) : null, 
        userId, 
        companyId
      ]
    );

    const shipment = shipmentResult.rows[0];

    // Update product stock
    await pool.query(
      'UPDATE products SET stock = stock - $1 WHERE id = $2',
      [quantity, productId]
    );

    if (status === "Delayed") {
      await sendShipmentDelayNotification(userResult.rows[0].email, shipment.id, status);
    }

    res.status(201).json(shipment);
  } catch (error) {
    console.error("Create Shipment Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

export const getShipments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.*, 
        p.name as product_name, 
        p.unit_cost as product_unit_cost,
        c.duty_paid as customs_duty_paid,
        c.tariff_percent as customs_tariff_percent,
        c.compliance_status as customs_compliance_status,
        u.email as user_email,
        co.name as company_name
      FROM shipments s
      LEFT JOIN products p ON s.product_id = p.id
      LEFT JOIN customs c ON s.id = c.shipment_id
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN companies co ON s.company_id = co.id
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error("Get Shipments Error:", error);
    res.status(500).json({ error: "Failed to fetch shipments" });
  }
};

export const getShipmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        s.*, 
        p.name as product_name, 
        p.unit_cost as product_unit_cost,
        c.duty_paid as customs_duty_paid,
        c.tariff_percent as customs_tariff_percent,
        c.compliance_status as customs_compliance_status
      FROM shipments s
      LEFT JOIN products p ON s.product_id = p.id
      LEFT JOIN customs c ON s.id = c.shipment_id
      WHERE s.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get Shipment By ID Error:", error);
    res.status(500).json({ error: "Failed to fetch shipment" });
  }
};

export const updateShipment = async (req, res) => {
  const { id } = req.params;
  const { productId, quantity, originPort, destinationPort, status, estimatedDelivery } = req.body;
  try {
    const result = await pool.query(`
      UPDATE shipments 
      SET 
        product_id = $1, 
        quantity = $2, 
        origin_port = $3, 
        destination_port = $4, 
        status = $5, 
        estimated_delivery = $6
      WHERE id = $7
      RETURNING *
    `, [productId, quantity, originPort, destinationPort, status, estimatedDelivery ? new Date(estimatedDelivery) : null, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    const shipment = result.rows[0];

    if (status === "Delayed") {
      // Get user email to send notification
      const userResult = await pool.query(
        'SELECT email FROM users WHERE id = $1',
        [shipment.user_id]
      );
      
      if (userResult.rows.length > 0) {
        await sendShipmentDelayNotification(userResult.rows[0].email, shipment.id, status);
      }
    }

    res.json(shipment);
  } catch (error) {
    console.error("Update Shipment Error:", error);
    res.status(400).json({ error: "Failed to update shipment" });
  }
};

export const deleteShipment = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM shipments WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Shipment not found" });
    }
    
    res.json({ message: "Shipment deleted successfully" });
  } catch (error) {
    console.error("Delete Shipment Error:", error);
    res.status(400).json({ error: "Failed to delete shipment" });
  }
};

export const createCustoms = async (req, res) => {
  const { shipmentId, dutyPaid, tariffPercent, complianceStatus } = req.body;

  if (!shipmentId || dutyPaid == null || tariffPercent == null || !complianceStatus) {
    return res.status(400).json({ error: "Missing required customs fields" });
  }

  try {
    // Check if shipment exists
    const shipmentResult = await pool.query(
      'SELECT * FROM shipments WHERE id = $1',
      [shipmentId]
    );

    if (shipmentResult.rows.length === 0) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    // Create customs record
    const customsResult = await pool.query(
      `INSERT INTO customs (shipment_id, duty_paid, tariff_percent, compliance_status) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [shipmentId, dutyPaid, tariffPercent, complianceStatus]
    );

    res.status(201).json(customsResult.rows[0]);
  } catch (error) {
    console.error("Customs Creation Error:", error);
    res.status(400).json({
      error: "Failed to create customs details",
      details: error.message,
    });
  }
};

export const getProductRequests = async (req, res) => {
  const companyId = req.query.companyId;
  
  if (!companyId) {
    return res.status(400).json({ error: "Company ID is required" });
  }

  try {
    const result = await pool.query(`
      SELECT 
        s.id,
        p.name as product_name,
        s.quantity,
        u.email as user_email,
        s.created_at as request_date,
        s.status
      FROM shipments s
      JOIN products p ON s.product_id = p.id
      JOIN users u ON s.user_id = u.id
      WHERE s.company_id = $1 AND s.status = 'pending'
      ORDER BY s.created_at DESC
    `, [companyId]);

    res.json(result.rows);
  } catch (error) {
    console.error("Get Product Requests Error:", error);
    res.status(500).json({ error: "Failed to fetch product requests" });
  }
};   

