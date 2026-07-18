import express from 'express';
import { register, login } from '../controllers/authController.js';
// Yahan dekho, maine isAdmin bhi add kar diya hai
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Login public hai
router.post('/login', login);

// Register sirf 'admin' ke liye
router.post('/register', verifyToken, isAdmin, register);

export default router;