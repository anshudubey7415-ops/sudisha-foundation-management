import express from 'express';
import { 
    register, 
    login, 
    forgotPassword, 
    verifyOtpAndResetPassword 
} from '../controllers/authController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Public Authentication
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password-otp', verifyOtpAndResetPassword);

// Register sirf 'admin' ke liye
router.post('/register', verifyToken, isAdmin, register);

export default router;