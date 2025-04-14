import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { sendWelcomeEmail } from "../utils/emailService.js";

// Helper function to generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET || "ThisisaJWTSECRETKEY", { expiresIn: "24h" });
};

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ 
        error: "Email and password are required",
        message: "Both email and password are required for registration" 
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        error: "User with this email already exists",
        message: "This email is already registered. Please use a different email address or log in." 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, role',
      [email, hashedPassword]
    );

    const user = result.rows[0];

    // Send welcome email after successful registration
    try {
      await sendWelcomeEmail(user.id);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Continue with registration even if email fails
    }

    res.status(201).json({ 
      message: "User registered successfully", 
      userId: user.id 
    });
  } catch (error) {
    console.error("Register user error:", error);
    res.status(400).json({ 
      error: "User registration failed",
      message: "Registration failed. Please try again later." 
    });
  }
};

// Register a new company
export const registerCompany = async (req, res) => {
  try {
    const { name, type, email, password, contactDetails } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: "Email and password are required",
        message: "Both email and password are required for registration" 
      });
    }
    
    if (!name) {
      return res.status(400).json({ 
        error: "Company name is required",
        message: "Please provide a company name" 
      });
    }
    
    if (!type) {
      return res.status(400).json({ 
        error: "Company type is required",
        message: "Please specify if your company is an importer, exporter, or both" 
      });
    }
    
    if (!contactDetails) {
      return res.status(400).json({ 
        error: "Contact details are required",
        message: "Please provide contact details for your company" 
      });
    }

    // Check if company already exists
    const existingCompany = await pool.query(
      'SELECT * FROM companies WHERE email = $1',
      [email]
    );

    if (existingCompany.rows.length > 0) {
      return res.status(400).json({ 
        error: "Company with this email already exists",
        message: "This email is already registered. Please use a different email address or log in." 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new company
    const result = await pool.query(
      'INSERT INTO companies (name, type, email, password_hash, contact_details) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email',
      [name, type, email, hashedPassword, contactDetails]
    );

    const company = result.rows[0];

    res.status(201).json({ 
      message: "Company registered successfully", 
      companyId: company.id 
    });
  } catch (error) {
    console.error("Register company error:", error);
    res.status(400).json({ 
      error: "Company registration failed",
      message: "Registration failed. Please try again later." 
    });
  }
};

// Login a user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    console.log("Checking user:", email);
    
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.log("User not found");
      return res.status(404).json({ error: "User not found" });
    }

    const user = userResult.rows[0];

    console.log("Stored hash:", user.password_hash);
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      console.log("Invalid password");
      return res.status(401).json({ error: "Invalid password" });
    }

    console.log("Generating token...");
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || "ThisisaJWTSECRETKEY",
      { expiresIn: "24h" }
    );

    console.log("Token generated:", token);
    
    // Store session
    await pool.query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, new Date(Date.now() + 24 * 60 * 60 * 1000)]
    );

    res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "strict" });

    return res.json({ message: "Logged in successfully", token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Login a company
export const loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const companyResult = await pool.query(
      'SELECT * FROM companies WHERE email = $1',
      [email]
    );

    if (companyResult.rows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    const company = companyResult.rows[0];

    const validPassword = await bcrypt.compare(password, company.password_hash);
    if (!validPassword) return res.status(401).json({ error: "Invalid password" });

    const token = generateToken(company.id, "COMPANY");

    res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "strict", maxAge: 24 * 3600 * 1000 });
    res.json({ message: "Company logged in successfully", token });
  } catch (error) {
    console.error("Login company error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Logout a user
export const logoutUser = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(400).json({ error: "No token provided" });

    // Delete session
    await pool.query(
      'DELETE FROM sessions WHERE token = $1',
      [token]
    );

    res.clearCookie("token", { httpOnly: true, secure: false, sameSite: "strict" });
    res.json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Logout user error:", error);
    res.status(500).json({ error: "Failed to logout" });
  }
};

// Logout a company
export const logoutCompany = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(400).json({ error: "No token provided" });

    // Delete session
    await pool.query(
      'DELETE FROM sessions WHERE token = $1',
      [token]
    );

    res.clearCookie("token", { httpOnly: true, secure: false, sameSite: "strict" });
    res.json({ message: "Company logged out successfully" });
  } catch (error) {
    console.error("Logout company error:", error);
    res.status(500).json({ error: "Failed to logout" });
  }
};
