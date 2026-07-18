import jwt from 'jsonwebtoken';

// 1. Token Verify karne ke liye
export const verifyToken = (req, res, next) => {
    // Authorization header check karo
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Access Denied: Token missing or invalid format!" });
    }

    // "Bearer <token>" mein se token extract karo
    const token = authHeader.split(" ")[1];
    
    try {
        // Token verify karo
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // User ka data (id, role) req mein set kar do
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token!" });
    }
};

// 2. Admin Check karne ke liye
export const isAdmin = (req, res, next) => {
    // Check karo ki user exist karta hai aur role 'admin' hai (lowercase)
    if (req.user && req.user.role && req.user.role.toLowerCase() === 'admin') {
        next(); // Sab sahi hai, aage badho
    } else {
        res.status(403).json({ message: "Access Denied: Sirf Admin ko access hai!" });
    }
};