import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Security Update: Role ko validate karo
        // Agar koi 'admin' role try kare bina authorization ke, toh use 'intern' bana do
        const assignedRole = role === 'admin' ? 'intern' : (role || 'intern');

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

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

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