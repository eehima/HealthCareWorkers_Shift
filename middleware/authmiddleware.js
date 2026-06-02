import jwt from 'jsonwebtoken';
import User from '../model/userModel.js';

// Authentication middleware
export const protect = async (req, res, next) => {
    let token;
    console.log(`protect middleware: ${req.method} ${req.originalUrl}`);
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    };
    try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
    };
    req.user = currentUser;
    next();
} catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
}
};

