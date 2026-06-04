import prisma from '../../config/db.js';

export const getOverview = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    
    const [
      totalUsers, newUsersToday, newUsersThisWeek,
      totalCourts, totalMatches, matchesToday,
      totalBookings, bookingsToday, pendingClubs, totalPosts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.court.count().catch(() => 0),
      prisma.match.count().catch(() => 0),
      prisma.match.count({ where: { createdAt: { gte: todayStart } } }).catch(() => 0),
      prisma.booking.count().catch(() => 0),
      prisma.booking.count({ where: { createdAt: { gte: todayStart } } }).catch(() => 0),
      prisma.clubApplication.count({ where: { status: 'PENDING' } }).catch(() => 0),
      prisma.post.count().catch(() => 0),
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    });

    const usersByDay = {};
    recentUsers.forEach(u => {
      const day = u.createdAt.toISOString().split('T')[0];
      usersByDay[day] = (usersByDay[day] || 0) + 1;
    });

    res.json({
      stats: { totalUsers, newUsersToday, newUsersThisWeek, totalCourts, totalMatches, matchesToday, totalBookings, bookingsToday, pendingClubs, totalPosts },
      charts: { userSignups: usersByDay },
    });
  } catch (err) {
    console.error('Admin overview error:', err);
    res.status(500).json({ message: 'Failed to load dashboard', error: err.message });
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', role = '', city = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      AND: [
        search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] } : {},
        role ? { role } : {},
        city ? { city: { contains: city, mode: 'insensitive' } } : {},
      ]
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, city: true, role: true, skillLevel: true, createdAt: true, avatarUrl: true, _count: { select: { matches: true } } },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load users', error: err.message });
  }
};

export const patchUser = async (req, res, next) => {
  try {
    const { role } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { ...(role !== undefined && { role }) },
    });
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
};

export const getClubs = async (req, res, next) => {
  try {
    const { status = 'PENDING' } = req.query;
    const clubs = await prisma.clubApplication.findMany({
      where: { status },
      include: { owner: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ clubs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load clubs', error: err.message });
  }
};

export const patchClub = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const application = await prisma.clubApplication.update({
      where: { id: req.params.id },
      data: { status, rejectionReason: reason || null, reviewedAt: new Date() },
      include: { owner: true },
    });

    if (status === 'APPROVED') {
      await prisma.user.update({ where: { id: application.ownerId }, data: { role: 'CLUB_OWNER' } });
      await prisma.club.create({
        data: {
          name: application.clubName, city: application.city, address: application.address,
          ownerId: application.ownerId, totalCourts: application.numberOfCourts, status: 'ACTIVE',
        },
      });
    }
    res.json({ success: true, application });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update club application', error: err.message });
  }
};

export const getCourts = async (req, res, next) => {
  try {
    const courts = await prisma.court.findMany({
      include: { owner: { select: { name: true, city: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ courts });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load courts', error: err.message });
  }
};

export const getBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        skip, take: parseInt(limit), orderBy: { createdAt: 'desc' },
        include: { player: { select: { name: true, email: true } }, court: { select: { name: true } } },
      }),
      prisma.booking.count(),
    ]);
    res.json({ bookings, total });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load bookings', error: err.message });
  }
};
