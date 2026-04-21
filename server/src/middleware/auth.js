import { verifyAccessToken } from '../utils/jwt.js';

export const verifyToken = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = verifyAccessToken(auth.split(' ')[1]);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Insufficient permissions' });
  next();
};
