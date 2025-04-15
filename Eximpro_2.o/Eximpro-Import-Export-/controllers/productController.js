// src/controllers/productController.js

import pool from "../config/db.js";
import { sendLowStockAlert } from "../utils/emailService.js";

// Create a new product
// Create a new product
// Create a new product
export const createProduct = async (req, res) => {
  try {

    let companyId = req.user?.userId; 
    console.log("Company ID:", companyId);
    console.log("Received create product request:", req.body);
    let { name, stock, hsCode, unitCost } = req.body;

    // Validate required fields
    if (!name || !hsCode || !companyId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    stock = parseInt(stock);
    unitCost = parseFloat(unitCost);
    // Do not parse companyId as integer; keep it as UUID string

    if (isNaN(stock) || isNaN(unitCost)) {
      return res.status(400).json({ error: "Stock and unit cost must be valid numbers" });
    }

    // Check if hsCode exists in product_categories
    const productCategoryResult = await pool.query(
      "SELECT * FROM product_categories WHERE hs_code = $1",
      [hsCode]
    );

    if (productCategoryResult.rows.length === 0) {
      console.log(`HS Code ${hsCode} not found in product_categories. Inserting default category.`);
      await pool.query(
        "INSERT INTO product_categories (hs_code, category) VALUES ($1, $2)",
        [hsCode, "default category"]
      );
    }

    // Insert new product with UUID companyId
    const result = await pool.query(
      `INSERT INTO products (name, stock, hs_code, unit_cost, company_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, stock, hsCode, unitCost, companyId] // companyId as UUID string
    );

    const newProduct = result.rows[0];

    // Send low stock alert if stock < 10
    if (newProduct.stock < 10) {
      const companyEmailResult = await pool.query(
        "SELECT email FROM companies WHERE id = $1",
        [companyId]
      );

      if (companyEmailResult.rows.length > 0) {
        await sendLowStockAlert(
          companyEmailResult.rows[0].email,
          newProduct.name,
          newProduct.stock
        );
      }
    }

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      error: "Failed to create product",
      details: error.message, // Include detailed error for debugging
    });
  }
};


// Get all products
export const getProducts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  let { name, stock, hsCode, unitCost } = req.body;

  try {
    const userId = req.user?.userId;

    const userResult = await pool.query(
      "SELECT email FROM companies WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found yoyoyoyoyo" });
    }

    stock = parseInt(stock);
    unitCost = parseFloat(unitCost);

    if (isNaN(stock) || isNaN(unitCost)) {
      return res.status(400).json({ error: "Stock and unit cost must be valid numbers" });
    }

    const result = await pool.query(
      `UPDATE products
       SET name = $1, stock = $2, hs_code = $3, unit_cost = $4, updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [name, stock, hsCode, unitCost, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const updatedProduct = result.rows[0];

    // Send low stock alert if stock < 10
    if (updatedProduct.stock < 10) {
      await sendLowStockAlert(
        userResult.rows[0].email,
        updatedProduct.name,
        updatedProduct.stock
      );
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(400).json({ error: "Failed to update product" });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(400).json({ error: "Failed to delete product" });
  }
};
