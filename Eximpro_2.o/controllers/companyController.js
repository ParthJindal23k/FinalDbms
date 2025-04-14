import pool from '../config/db.js';

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
    res.status(500).json({ error: "Failed to fetch companies" });
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
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: "Failed to update company" });
  }
};

export const deleteCompany = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM companies WHERE id = $1', [id]);
    res.json({ message: "Company deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete company" });
  }
}; 