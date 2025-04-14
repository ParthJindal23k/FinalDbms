import express from "express";
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    registerCompany, 
    loginCompany, 
    logoutCompany 
  } from "../controllers/authController.js";
  
  
const router = express.Router();

router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.post("/user/logout", logoutUser);


router.post("/company/register", registerCompany);
router.post("/company/login", loginCompany);
router.post("/company/logout", logoutCompany);

// New unified routes for the frontend
router.post("/register", (req, res) => {
  const { accountType } = req.body;
  
  if (accountType === 'user') {
    return registerUser(req, res);
  } else if (accountType === 'company') {
    return registerCompany(req, res);
  } else {
    return res.status(400).json({ error: "Invalid account type" });
  }
});

router.post("/login", (req, res) => {
  const { accountType } = req.body;
  
  if (accountType === 'user') {
    return loginUser(req, res);
  } else if (accountType === 'company') {
    return loginCompany(req, res);
  } else {
    return res.status(400).json({ error: "Invalid account type" });
  }
});

router.post("/logout", (req, res) => {
  // We can use the same logout handler for both user and company
  return logoutUser(req, res);
});

export default router;



