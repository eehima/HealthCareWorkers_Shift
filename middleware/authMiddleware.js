import jwt from 'jsonwebtoken';
import User from '../model/userModel.js';

const skipAuth = process.env.SKIP_AUTH === 'true';

export const protect = (req, res, next) => {
  try {
    if (skipAuth) {
      req.user = {
        id: process.env.SKIP_AUTH_USER_ID || 'skip-auth-user',
        _id: process.env.SKIP_AUTH_USER_ID || 'skip-auth-user',
        role: process.env.SKIP_AUTH_ROLE || 'admin'
      };
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided. Please log in.' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // normalize user id into both `id` and `_id` for compatibility
    const userId = decoded.id || decoded._id || decoded.userId || null;
    req.user = {
      ...decoded,
      id: userId,
      _id: userId
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token. Please log in again.' });
  }
};

// Role-based access control middleware
export const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (skipAuth) {
        req.user = req.user || {};
        req.user.role = process.env.SKIP_AUTH_ROLE || 'admin';
        return next();
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated. Please log in.' });
      }

      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: 'You do not have permission to access this resource.' });
      }

      req.user.role = user.role;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
};