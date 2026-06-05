import prisma from '../../config/db.js';

export const getOverview = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers, newToday, newThisWeek,
      totalMatches, matchesToday,
      totalBookings, bookingsToday,
      totalRevenue, revenueToday,
      pendingClubApps, totalCourts,
      totalPosts, bannedUsers,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'PLAYER' } }).catch(() => 0),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }).catch(() => 0),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }).catch(() => 0),
      prisma.match.count().catch(() => 0),
      prisma.match.count({ where: { createdAt: { gte: todayStart } } }).catch(() => 0),
      prisma.booking.count().catch(() => 0),
      prisma.booking.count({ where: { createdAt: { gte: todayStart } } }).catch(() => 0),
      prisma.booking.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { totalAmount: true },
      }).catch(() => ({ _sum: { totalAmount: 0 } })),
      prisma.booking.aggregate({
        where: { status: 'COMPLETED', createdAt: { gte: todayStart } },
        _sum: { totalAmount: true },
      }).catch(() => ({ _sum: { totalAmount: 0 } })),
      prisma.clubApplication.count({ where: { status: 'PENDING' } }).catch(() => 0),
      prisma.court.count({ where: { isActive: true } }).catch(() => 0),
      prisma.post.count().catch(() => 0),
      prisma.user.count({ where: { banned: true } }).catch(() => 0),
    ]);

    const recentUsers = await prisma.user.findMany({
      where: { createdAt: { gte: monthAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const recentBookings = await prisma.booking.findMany({
      where: { createdAt: { gte: monthAgo } },
      select: { createdAt: true, totalAmount: true, status: true },
    });

    function groupByDay(records) {
      const map = {};
      records.forEach(r => {
        const day = r.createdAt.toISOString().split('T')[0];
        map[day] = (map[day] || 0) + 1;
      });
      return map;
    }

    res.json({
      stats: {
        totalUsers, newToday, newThisWeek,
        totalMatches, matchesToday,
        totalBookings, bookingsToday,
        totalRevenue: totalRevenue?._sum?.totalAmount || 0,
        revenueToday: revenueToday?._sum?.totalAmount || 0,
        pendingClubApps,
        totalCourts, totalPosts, bannedUsers,
      },
      charts: {
        usersByDay: groupByDay(recentUsers),
        bookingsByDay: groupByDay(recentBookings),
      },
    });
  } catch (err) {
    console.error('[Admin Overview]', err);
    res.status(500).json({ message: err.message });
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', role = '', city = '', banned = '' } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ]
      }),
      ...(role && { role }),
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(banned === 'true' && { banned: true }),
      ...(banned === 'false' && { banned: false }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip: +skip, take: +limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, firebaseUid: true, name: true, email: true,
          avatarUrl: true, city: true, role: true, skillLevel: true,
          skillRating: true, banned: true, profileComplete: true,
          emailVerified: true, createdAt: true, lastActive: true,
          _count: { select: { player1Matches: true, player2Matches: true, bookings: true, posts: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    
    // Calculate total matches for each user
    const usersWithMatches = users.map(u => ({
      ...u,
      _count: {
        ...u._count,
        matches: u._count.player1Matches + u._count.player2Matches
      }
    }));

    res.json({ users: usersWithMatches, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load users', error: err.message });
  }
};

export const patchUser = async (req, res, next) => {
  try {
    const { role, banned, skillLevel, skillRating } = req.body;

    const dbAdmin = await prisma.user.findUnique({ where: { firebaseUid: req.user.uid } });
    if (dbAdmin.id === req.params.id && role && role !== 'APP_ADMIN') {
      return res.status(400).json({ message: 'Cannot change your own admin role' });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(role !== undefined && { role }),
        ...(banned !== undefined && { banned }),
        ...(skillLevel !== undefined && { skillLevel }),
        ...(skillRating !== undefined && { skillRating: parseFloat(skillRating) }),
      },
    });

    if (banned !== undefined) {
      await prisma.notification.create({
        data: {
          userId: req.params.id,
          type: banned ? 'account_banned' : 'account_unbanned',
          title: banned ? 'Account Suspended' : 'Account Reinstated',
          body: banned
            ? 'Your account has been suspended. Contact support for details.'
            : 'Your account suspension has been lifted. Welcome back!',
        },
      });
    }

    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dbAdmin = await prisma.user.findUnique({ where: { firebaseUid: req.user.uid } });
    if (dbAdmin.id === id) return res.status(400).json({ message: 'Cannot delete your own account' });

    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};

export const getBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status = '', courtId = '', dateFrom = '', dateTo = '' } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(courtId && { courtId }),
      ...(dateFrom || dateTo) && {
        date: {
          ...(dateFrom && { gte: dateFrom }), // Assuming date is string in schema or adjust if DateTime
          ...(dateTo && { lte: dateTo }),
        }
      },
    };

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where, skip: +skip, take: +limit,
        orderBy: { date: 'desc' },
        include: {
          player: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
          court: { select: { id: true, name: true, clubName: true, city: true } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({ bookings, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load bookings', error: err.message });
  }
};

export const patchBooking = async (req, res, next) => {
  try {
    const { status, startTime, endTime, date, notes, cancelReason } = req.body;
    const dbAdmin = await prisma.user.findUnique({ where: { firebaseUid: req.user.uid } });

    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { player: true, court: true },
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    let newDate = booking.date;
    if (date) newDate = date;

    let newDuration = booking.duration;
    if (startTime && endTime) {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      newDuration = (eh * 60 + em) - (sh * 60 + sm);
      if (newDuration <= 0) return res.status(400).json({ message: 'End time must be after start time' });
    }

    const pricePerHour = booking.court.pricePerHour;
    const newPrice = Math.round((newDuration / 60) * pricePerHour);

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(date && { date: newDate }),
        ...(notes && { notes }),
        ...(status === 'CANCELLED' && {
          cancelReason: cancelReason || 'Cancelled by admin',
          cancelledAt: new Date(),
          cancelledBy: dbAdmin.id,
        }),
        duration: newDuration,
        totalAmount: newPrice,
      },
      include: { player: true, court: true },
    });

    const isCancel = status === 'CANCELLED';
    const isReschedule = date || startTime || endTime;

    if (isCancel || isReschedule) {
      await prisma.notification.create({
        data: {
          userId: booking.playerId,
          type: isCancel ? 'booking_cancelled' : 'booking_rescheduled',
          title: isCancel ? 'Booking Cancelled' : 'Booking Rescheduled',
          body: isCancel
            ? \`Your booking at \${booking.court.clubName} on \${booking.date} has been cancelled. Reason: \${cancelReason || 'No reason given'}\`
            : \`Your booking at \${booking.court.clubName} has been rescheduled to \${updated.date} \${updated.startTime}\`,
          data: { bookingId: booking.id },
        },
      });
    }

    res.json({ success: true, booking: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update booking', error: err.message });
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

    const application = await prisma.clubApplication.findUnique({
      where: { id: req.params.id },
      include: { owner: true },
    });
    if (!application) return res.status(404).json({ message: 'Application not found' });

    const updated = await prisma.clubApplication.update({
      where: { id: req.params.id },
      data: { status, rejectionReason: reason || null, reviewedAt: new Date() },
    });

    if (status === 'APPROVED') {
      await prisma.user.update({
        where: { id: application.ownerId },
        data: { role: 'CLUB_OWNER' },
      });

      const newClub = await prisma.club.create({
        data: {
          name: application.clubName,
          city: application.city,
          address: application.address,
          area: 'Central', // dummy
          ownerId: application.ownerId,
          contactPhone: application.ownerPhone,
          operatingHours: application.operatingHours,
          isActive: true,
          isApproved: true,
          totalCourts: application.numberOfCourts
        },
      });

      for (let i = 1; i <= application.numberOfCourts; i++) {
        await prisma.court.create({
          data: {
            name: \`Court \${i}\`,
            clubName: application.clubName,
            address: application.address,
            area: 'Central',
            city: application.city,
            lat: 0, lng: 0,
            surface: application.surfaces?.[0] || 'Unknown',
            pricePerHour: application.weekdayPrice || 1000,
            isActive: true,
            ownerId: application.ownerId
          },
        });
      }
    }

    await prisma.notification.create({
      data: {
        userId: application.ownerId,
        type: status === 'APPROVED' ? 'club_approved' : 'club_rejected',
        title: status === 'APPROVED' ? '🎉 Club Application Approved!' : 'Club Application Update',
        body: status === 'APPROVED'
          ? \`Congratulations! \${application.clubName} has been approved. You can now manage your club from the Club Dashboard.\`
          : \`Your application for \${application.clubName} was not approved. Reason: \${reason || 'See support for details.'}\`,
      },
    });

    res.json({ success: true, application: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update club', error: err.message });
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
