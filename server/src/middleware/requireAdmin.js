import prisma from '../config/db.js';

export const requireAdmin = async (req, res, next) => {
  if (!req.user || !req.user.uid) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const user = await prisma.user.findUnique({ where: { firebaseUid: req.user.uid } });
    if (!user || user.role !== 'APP_ADMIN') return res.status(403).json({ message: 'Admin access required' });
    next();
  } catch (err) {
    res.status(500).json({ message: 'Error checking admin role', error: err.message });
  }
};

export const requireClubOwner = async (req, res, next) => {
  if (!req.user || !req.user.uid) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const user = await prisma.user.findUnique({ where: { firebaseUid: req.user.uid } });
    if (!user || (user.role !== 'CLUB_OWNER' && user.role !== 'CLUB_ADMIN')) {
      return res.status(403).json({ message: 'Club owner access required' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Error checking club owner role', error: err.message });
  }
};
