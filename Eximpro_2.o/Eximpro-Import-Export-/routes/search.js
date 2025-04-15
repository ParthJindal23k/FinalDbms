// routes/search.js
import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.get('/products', async (req, res) => {
  const { q } = req.query;
  try {
    const query = `
      SELECT p.id, p.name, p.unitCost, c.name AS companyName
      FROM Product p
      JOIN Company c ON p.companyId = c.id
      WHERE LOWER(p.name) LIKE LOWER($1)
    `;
    const values = [`%${q}%`];
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
