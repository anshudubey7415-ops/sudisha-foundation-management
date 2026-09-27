import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import { sendNewPasswordEmail } from '../utils/emailService.js';

const router = express.Router();

// 1. GET ALL USERS (Admin Only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// GET USER BY EMAIL (Admin Only)
router.get('/by-email/:email', verifyToken, isAdmin, async (req, res) => {
    try {
        const cleanEmail = req.params.email.trim();
        const user = await User.findOne({ 
            email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } 
        }).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: "No user account exists with this email" });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// CHANGE CURRENT USER'S PASSWORD (Any Authenticated Role)
router.put('/profile/change-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!newPassword || newPassword.trim().length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters long." });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!currentPassword) {
            return res.status(400).json({ message: "Current password is required." });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

        user.password = await bcrypt.hash(newPassword.trim(), 10);
        await user.save();
        res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error changing password", error: err.message });
    }
});

// 2. CREATE USER (Admin Only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const validRoles = ['admin', 'manager', 'intern', 'volunteer'];
        const assignedRole = validRoles.includes(role?.toLowerCase()) ? role.toLowerCase() : 'intern';

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: assignedRole
        });

        await newUser.save();
        const saved = await User.findById(newUser._id).select('-password');
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ message: "Failed to create user", error: err.message });
    }
});

// 3. UPDATE USER (Admin Only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { name, email, role, password } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) {
            const validRoles = ['admin', 'manager', 'intern', 'volunteer'];
            if (validRoles.includes(role.toLowerCase())) {
                updateData.role = role.toLowerCase();
            }
        }
        if (password && password.trim().length >= 6) {
            updateData.password = await bcrypt.hash(password.trim(), 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true }
        ).select('-password');
        
        if (!updatedUser) return res.status(404).json({ message: "User not found" });
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: "Error updating user", error: err.message });
    }
});

// 4. DELETE USER (Admin Only - Admins protected)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        
        if ((user.role || '').toLowerCase() === 'admin') {
            return res.status(403).json({ message: "Admin user accounts cannot be deleted!" });
        }

        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting user", error: err.message });
    }
});

// 5. MANUALLY RESET USER PASSWORD (Admin Only)
router.post('/:id/reset-password', verifyToken, isAdmin, async (req, res) => {
    try {
        const { newPassword, sendEmail } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const finalPassword = (newPassword || `Sudisha@${Math.floor(1000 + Math.random() * 9000)}`).trim();
        if (finalPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long." });
        }

        user.password = await bcrypt.hash(finalPassword, 10);
        await user.save();

        if (sendEmail !== false) {
            await sendNewPasswordEmail(user.email, finalPassword, user.name, user.role);
        }

        res.status(200).json({ 
            message: `Password reset successfully for ${user.name}!`,
            newPassword: finalPassword,
            email: user.email 
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to reset password", error: err.message });
    }
});

export default router;