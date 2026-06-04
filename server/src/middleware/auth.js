import admin from 'firebase-admin';

// Initialize only once
if (!admin.apps.length && process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (err) {
    console.error('Failed to initialize Firebase Admin:', err);
  }
}

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // { uid, email, name, picture, ... }
    next();
  } catch (err) {
    console.error('Token verification failed:', err.code, err.message);
    
    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (err.code === 'auth/argument-error') {
      return res.status(401).json({ message: 'Invalid token format' });
    }
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireRole = (...roles) => async (req, res, next) => {
  if (!req.user || !req.user.uid) return res.status(401).json({ message: 'Unauthorized' });
  try {
    // Assuming you have imported prisma in the calling file, or you can import it here
    const prisma = (await import('../config/db.js')).default;
    const user = await prisma.user.findUnique({ where: { firebaseUid: req.user.uid } });
    if (!user) return res.status(401).json({ message: 'User not found in db' });
    if (!roles.includes(user.role)) return res.status(403).json({ message: 'Insufficient permissions' });
    next();
  } catch (err) {
    res.status(500).json({ message: 'Role check failed', error: err.message });
  }
};
