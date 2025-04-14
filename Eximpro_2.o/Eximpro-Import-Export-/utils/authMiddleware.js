import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  console.log("Token from request:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "ThisisaJWTSECRETKEY");

    // Verify if the token exists in sessions table
    const sessionResult = await pool.query(
      'SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ error: "Session expired or invalid." });
    }

    // Attach the decoded user information to the request object
    req.user = { userId: decoded.userId, role: decoded.role };

    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);
    res.status(400).json({ error: "Invalid token." });
  }
};

export default authMiddleware;
