import prisma from '../../config/db.js';
import { getDbUser } from '../../utils/getDbUser.js';

export const applyForClub = async (req, res, next) => {
  try {
    const dbUser = await getDbUser(req.user.uid);
    
    // Check if already applied
    const existing = await prisma.clubApplication.findFirst({
      where: { ownerId: dbUser.id, status: { not: 'REJECTED' } }
    });
    
    if (existing) {
      return res.status(409).json({ 
        message: 'You already have a pending or approved application',
        status: existing.status,
      });
    }

    const {
      clubName, businessType, city, address, numberOfCourts,
      surfaces, facilities, operatingHours, weekdayPrice, weekendPrice,
      minDuration, maxAdvanceDays, cancellationPolicy,
      photos, businessDocument, ownerCnic, ownerPhone,
    } = req.body;

    if (!clubName || !city || !address || !ownerPhone || !ownerCnic) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const application = await prisma.clubApplication.create({
      data: {
        ownerId: dbUser.id,
        clubName, businessType, city, address,
        numberOfCourts: parseInt(numberOfCourts),
        surfaces: surfaces || [],
        facilities: facilities || [],
        operatingHours: operatingHours || {},
        weekdayPrice: parseInt(weekdayPrice),
        weekendPrice: parseInt(weekendPrice),
        minDuration: parseInt(minDuration),
        maxAdvanceDays: parseInt(maxAdvanceDays),
        cancellationPolicy,
        photos: photos || [],
        businessDocument: businessDocument || null,
        ownerCnic,
        ownerPhone,
      },
    });

    res.status(201).json({ success: true, applicationId: application.id });
  } catch (err) {
    console.error('Club application error:', err);
    res.status(500).json({ message: 'Failed to submit application', error: err.message });
  }
};

export const getMyApplication = async (req, res, next) => {
  try {
    const dbUser = await getDbUser(req.user.uid);
    const application = await prisma.clubApplication.findFirst({
      where: { ownerId: dbUser.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getClubOverview = async (req, res, next) => {
  try {
    const dbUser = await getDbUser(req.user.uid);
    const club = await prisma.club.findUnique({ 
      where: { ownerId: dbUser.id },
      include: { courts: true },
    });
    
    if (!club) return res.status(404).json({ message: 'Club not found' });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const courtIds = club.courts.map(c => c.id);

    const [bookingsToday, bookingsTotal, uniquePlayers] = await Promise.all([
      prisma.booking.count({ 
        where: { courtId: { in: courtIds }, createdAt: { gte: todayStart } } 
      }),
      prisma.booking.count({ 
        where: { courtId: { in: courtIds } } 
      }),
      prisma.booking.findMany({
        where: { courtId: { in: courtIds } },
        select: { playerId: true },
        distinct: ['playerId'],
      }),
    ]);

    res.json({
      club,
      stats: {
        courtsCount: club.courts.length,
        bookingsToday,
        bookingsTotal,
        uniquePlayersCount: uniquePlayers.length,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
