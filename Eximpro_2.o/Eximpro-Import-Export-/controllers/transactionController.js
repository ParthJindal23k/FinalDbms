import pool from "../config/db.js";
import { sendPaymentReminder } from "../utils/emailService.js";

// Create a new transaction
export const createTransaction = async (req, res) => {
  const { companyId, invoiceNumber, amount, status, currency } = req.body;

  // Validate request body
  if (!companyId || !invoiceNumber || !amount || !status || !currency) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Fetch logged-in user's email
    const userId = req.user.id;
    const userResult = await pool.query(
      'SELECT email FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const result = await pool.query(
      `INSERT INTO transactions (company_id, invoice_number, amount, status, currency, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [companyId, invoiceNumber, amount, status, currency, userId]
    );

    const transaction = result.rows[0];

    if (status === "Pending") {
      await sendPaymentReminder(userResult.rows[0].email, invoiceNumber, amount);
    }

    res.status(201).json(transaction);
  } catch (error) {
    console.error("Transaction creation error:", error);
    res.status(400).json({ error: "Failed to create transaction", details: error.message });
  }
};

// Get all transactions
export const getTransactions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, c.name as company_name 
      FROM transactions t
      LEFT JOIN companies c ON t.company_id = c.id
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

// Get transaction by ID
export const getTransactionById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT t.*, c.name as company_name 
      FROM transactions t
      LEFT JOIN companies c ON t.company_id = c.id
      WHERE t.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get transaction error:", error);
    res.status(500).json({ error: "Failed to fetch transaction" });
  }
};

// Update transaction
export const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { companyId, invoiceNumber, amount, status, currency } = req.body;
  try {
    const result = await pool.query(`
      UPDATE transactions 
      SET company_id = $1, invoice_number = $2, amount = $3, status = $4, currency = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `, [companyId, invoiceNumber, amount, status, currency, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const transaction = result.rows[0];

    if (status === "Pending") {
      // Get user email to send notification
      const userResult = await pool.query(
        'SELECT email FROM users WHERE id = $1',
        [transaction.user_id]
      );
      
      if (userResult.rows.length > 0) {
        await sendPaymentReminder(userResult.rows[0].email, invoiceNumber, amount);
      }
    }

    res.json(transaction);
  } catch (error) {
    console.error("Update transaction error:", error);
    res.status(400).json({ error: "Failed to update transaction" });
  }
};

// Delete transaction
export const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM transactions WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    
    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Delete transaction error:", error);
    res.status(400).json({ error: "Failed to delete transaction" });
  }
};
