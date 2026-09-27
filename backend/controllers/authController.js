import User from '../models/User.js';
import Otp from '../models/Otp.js';
import Request from '../models/Request.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendOtpEmail } from '../utils/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

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
        res.status(201).json({ message: "User registered successfully", role: assignedRole });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

        // Response mein token ke saath user details clean bhejo
        res.json({ 
            token, 
            user: { 
                name: user.name, 
                email: user.email, 
                role: user.role 
            } 
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * FORGOT PASSWORD
 * - Admin: Generates 6-digit OTP, sends to registered email.
 * - Manager / Intern: Submits a password reset request to Admin.
 */
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !email.trim()) {
            return res.status(400).json({ message: "Email address is required." });
        }

        const cleanEmail = email.trim().toLowerCase();
        const user = await User.findOne({
            email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });

        if (!user) {
            return res.status(404).json({ message: "No registered account found with this email address." });
        }

        const userRole = (user.role || '').toLowerCase();

        // 1. ADMIN FLOW: Send 6-digit OTP to Admin Email
        if (userRole === 'admin') {
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Invalidate any existing OTPs for this email
            await Otp.deleteMany({ email: cleanEmail });

            // Create new OTP valid for 10 minutes
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            await Otp.create({
                email: cleanEmail,
                otp: otpCode,
                expiresAt
            });

            // Dispatch Email
            await sendOtpEmail(user.email, otpCode, user.name || 'Admin');

            return res.status(200).json({
                role: 'admin',
                email: user.email,
                message: "A 6-digit verification code (OTP) has been sent to your registered Admin email.",
                // For development convenience:
                mode: process.env.SMTP_USER ? 'smtp' : 'dev'
            });
        }

        // 2. MANAGER / INTERN / VOLUNTEER FLOW: Forward Request to Admin
        const adminUser = await User.findOne({ role: 'admin' });
        const adminId = adminUser ? adminUser._id : user._id;

        // Check if there is already a pending request
        const existingReq = await Request.findOne({
            targetUserId: user._id,
            changeType: 'password_reset_request',
            status: 'pending'
        });

        if (existingReq) {
            existingReq.reason = `User (${user.name} - ${userRole}) requested password reset again.`;
            existingReq.changes = {
                email: user.email,
                name: user.name,
                role: user.role,
                requestType: 'forgot_password',
                requestedAt: new Date()
            };
            await existingReq.save();
        } else {
            const newRequest = new Request({
                managerId: adminId,
                targetUserId: user._id,
                targetName: user.name,
                targetCollection: 'users',
                changeType: 'password_reset_request',
                changes: {
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    requestType: 'forgot_password',
                    requestedAt: new Date()
                },
                reason: `Forgot password request from ${user.name} (${userRole}). Admin approval & password reset required.`,
                status: 'pending'
            });
            await newRequest.save();
        }

        return res.status(200).json({
            role: userRole,
            email: user.email,
            message: `Password reset request submitted to Admin. Admin will review and send your new credentials to ${user.email}.`
        });

    } catch (err) {
        console.error("Forgot password error:", err);
        res.status(500).json({ message: "Failed to process forgot password request", error: err.message });
    }
};

/**
 * RESET ADMIN PASSWORD WITH OTP
 */
export const verifyOtpAndResetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: "Email, OTP code, and new password are required." });
        }

        if (newPassword.trim().length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters long." });
        }

        const cleanEmail = email.trim().toLowerCase();
        const user = await User.findOne({
            email: { $regex: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });

        if (!user) {
            return res.status(404).json({ message: "User account not found." });
        }

        if ((user.role || '').toLowerCase() !== 'admin') {
            return res.status(403).json({ message: "OTP password reset is only available for Admin accounts." });
        }

        // Verify OTP in DB
        const otpRecord = await Otp.findOne({
            email: cleanEmail,
            otp: otp.trim()
        });

        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid OTP code. Please check and enter the 6-digit code sent to your email." });
        }

        if (new Date() > otpRecord.expiresAt) {
            await Otp.deleteMany({ email: cleanEmail });
            return res.status(400).json({ message: "OTP code has expired. Please request a new code." });
        }

        // Update Admin Password
        const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
        user.password = hashedPassword;
        await user.save();

        // Remove OTP records
        await Otp.deleteMany({ email: cleanEmail });

        res.status(200).json({
            message: "Admin password has been reset successfully! You can now sign in with your new password."
        });

    } catch (err) {
        console.error("OTP Reset password error:", err);
        res.status(500).json({ message: "Failed to reset password", error: err.message });
    }
};