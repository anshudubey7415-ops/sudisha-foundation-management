import express from 'express'; // require ki jagah import
import User from '../models/User.js'; // .js extension zaroori hai
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js'; // .js extension zaroori hai

const router = express.Router();

// 1. GET ALL USERS (Sirf Admin)
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// 2. DELETE USER (Sirf Admin)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "User nahi mila" });
        res.status(200).json({ message: "User successfully delete ho gaya" });
    } catch (err) {
        res.status(500).json({ message: "Delete karne mein error aaya" });
    }
});

// 3. UPDATE USER ROLE (Sirf Admin)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            { role }, 
            { new: true }
        ).select('-password');
        
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: "Update karne mein error aaya" });
    }
});

export default router; // module.exports ki jagah export default