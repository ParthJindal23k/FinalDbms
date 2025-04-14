import pool from "../config/db.js";
import bcrypt from "bcryptjs";

export const createCompany = async (req, res) => {
  const { name, type, email, password, contactDetails } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO companies (name, type, email, password_hash, contact_details) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, type, email, hashedPassword, contactDetails]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating company:", error);
    res.status(400).json({ error: "Failed to create company" });
  }
};

export const getCompanies = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, type, email, contact_details FROM companies'
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
};

export const getCompanyById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT * FROM companies WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({ error: "Failed to fetch company" });
  }
};

export const getOne = async (req, res) => {
  try {
    const { user } = req;
    const id = user?.userId;

    if (!id) {
      return res.status(400).json({ error: "User ID is missing from request" });
    }

    const result = await pool.query(
      'SELECT * FROM companies WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({ error: "Failed to fetch company" });
  }
};

export const updateCompany = async (req, res) => {
  const { id } = req.params;
  const { name, type, contactDetails } = req.body;
  try {
    const result = await pool.query(
      'UPDATE companies SET name = $1, type = $2, contact_details = $3 WHERE id = $4 RETURNING *',
      [name, type, contactDetails, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(400).json({ error: "Failed to update company" });
  }
};

export const deleteCompany = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM companies WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }
    
    res.json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(400).json({ error: "Failed to delete company" });
  }
};
