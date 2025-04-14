import pool from "../config/db.js";
import { sendLowStockAlert } from "../utils/emailService.js";

// Create a new product
export const createProduct = async (req, res) => {
  const { name, stock, hsCode, unitCost, companyId } = req.body;

  try {
    // Check if the hsCode exists in the ProductCategory table
    let productCategoryResult = await pool.query(
      'SELECT * FROM product_categories WHERE hs_code = $1',
      [hsCode]
    );

    // If hsCode does not exist, create a new ProductCategory
    if (productCategoryResult.rows.length === 0) {
      await pool.query(
        'INSERT INTO product_categories (hs_code, category) VALUES ($1, $2)',
        [hsCode, "default category"]
      );
      console.log(`Created new ProductCategory with hsCode: ${hsCode}`);
    }

    // Create the product after validating or adding the hsCode
    const productResult = await pool.query(
      'INSERT INTO products (name, stock, hs_code, unit_cost, company_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, stock, hsCode, unitCost, companyId]
    );

    res.status(201).json(productResult.rows[0]);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({ error: "Failed to create product", details: error.message });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const productsResult = await pool.query('SELECT * FROM products');
    res.json(productsResult.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const productResult = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(productResult.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, stock, hsCode, unitCost } = req.body;
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

    const productResult = await pool.query(
      'UPDATE products SET name = $1, stock = $2, hs_code = $3, unit_cost = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [name, stock, hsCode, unitCost, id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const product = productResult.rows[0];

    if (product.stock < 10) {
      await sendLowStockAlert(userResult.rows[0].email, product.name, product.stock);
    }

    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(400).json({ error: "Failed to update product" });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(400).json({ error: "Failed to delete product" });
  }
};
