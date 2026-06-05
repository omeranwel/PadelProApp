import prisma from '../../config/db.js';
import { getDbUser } from '../../utils/getDbUser.js';

// GET /api/clubs/overview  (club owner overview)
export const getClubOverviewFull = async (req, res) => {
  try {
    const dbUser = await getDbUser(req.user.uid);
    const club = await prisma.club.findUnique({
      where: { ownerId: dbUser.id },
      include: { courts: true },
    });
    if (!club) return res.status(404).json({ message: 'Club not found. Your application may still be pending.' });

    const courts = club.courts || [];
    const courtIds = courts.map(c => c.id);

    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const weekStart = new Date(Date.now() - 7*24*60*60*1000);
    const monthStart = new Date(Date.now() - 30*24*60*60*1000);

    // Avoid DB errors when no courts exist yet
    const bookingFilters = courtIds.length > 0
      ? [
          prisma.booking.count({ where: { courtId: { in: courtIds }, createdAt: { gte: todayStart } } }),
          prisma.booking.count({ where: { courtId: { in: courtIds }, createdAt: { gte: weekStart } } }),
          prisma.booking.count({ where: { courtId: { in: courtIds } } }),
          prisma.booking.aggregate({ where: { courtId: { in: courtIds }, status: 'COMPLETED' }, _sum: { totalAmount: true } }),
          prisma.booking.aggregate({ where: { courtId: { in: courtIds }, status: 'COMPLETED', createdAt: { gte: monthStart } }, _sum: { totalAmount: true } }),
          prisma.booking.findMany({ where: { courtId: { in: courtIds } }, select: { playerId: true }, distinct: ['playerId'] }),
          prisma.booking.findMany({
            where: { courtId: { in: courtIds }, status: { not: 'CANCELLED' } },
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
              player: { select: { name: true, phone: true, avatarUrl: true } },
              court: { select: { name: true } },
            },
          }),
        ]
      : [Promise.resolve(0), Promise.resolve(0), Promise.resolve(0),
         Promise.resolve({ _sum: { totalAmount: 0 } }),
         Promise.resolve({ _sum: { totalAmount: 0 } }),
         Promise.resolve([]), Promise.resolve([])];

    const [bookingsToday, bookingsThisWeek, bookingsTotal, revenueTotal, revenueThisMonth, uniquePlayers, upcomingBookings] = await Promise.all(bookingFilters);

    res.json({
      club: { ...club, courts },
      stats: {
        bookingsToday, bookingsThisWeek, bookingsTotal,
        revenueTotal: revenueTotal._sum?.totalAmount || 0,
        revenueThisMonth: revenueThisMonth._sum?.totalAmount || 0,
        uniquePlayersCount: uniquePlayers.length,
        courtsCount: courts.length,
      },
      upcomingBookings,
    });
  } catch (err) {
    console.error('[Club Overview]', err);
    res.status(500).json({ message: err.message });
  }
};

// GET /api/clubs/bookings
export const getClubBookings = async (req, res) => {
  try {
    const dbUser = await getDbUser(req.user.uid);
    const courts = await prisma.court.findMany({ where: { ownerId: dbUser.id }, select: { id: true } });
    const courtIds = courts.map(c => c.id);
    const { page = 1, limit = 20, status = '' } = req.query;
    const where = { courtId: { in: courtIds }, ...(status && { status }) };
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where, skip: (+page-1)*+limit, take: +limit,
        orderBy: { createdAt: 'desc' },
        include: {
          player: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true } },
          court: { select: { name: true } },
        },
      }),
      prisma.booking.count({ where }),
    ]);
    res.json({ bookings, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/clubs/bookings/:id
export const updateClubBooking = async (req, res) => {
  try {
    const dbUser = await getDbUser(req.user.uid);
    const courts = await prisma.court.findMany({ where: { ownerId: dbUser.id }, select: { id: true } });
    const courtIds = courts.map(c => c.id);
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id }, include: { player: true } });
    if (!booking || !courtIds.includes(booking.courtId)) return res.status(403).json({ message: 'Not authorized' });

    const { status, cancelReason } = req.body;
    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status }),
        ...(status === 'CANCELLED' && { cancelReason: cancelReason || 'Cancelled by club', cancelledAt: new Date(), cancelledBy: dbUser.id }),
      },
    });

    if (status === 'CANCELLED' || status === 'CONFIRMED') {
      await prisma.notification.create({
        data: {
          userId: booking.playerId,
          type: `booking_${status.toLowerCase()}`,
          title: status === 'CONFIRMED' ? 'Booking Confirmed!' : 'Booking Cancelled',
          body: status === 'CONFIRMED'
            ? `Your booking has been confirmed.`
            : `Your booking has been cancelled. Reason: ${cancelReason || 'No reason given'}`,
          data: { bookingId: booking.id },
        },
      });
    }

    res.json({ success: true, booking: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/clubs/players  — all unique players who've booked
export const getClubPlayers = async (req, res) => {
  try {
    const dbUser = await getDbUser(req.user.uid);
    const courts = await prisma.court.findMany({ where: { ownerId: dbUser.id }, select: { id: true } });
    const courtIds = courts.map(c => c.id);

    const bookings = await prisma.booking.findMany({
      where: { courtId: { in: courtIds } },
      include: { player: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true, skillLevel: true, city: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const playerMap = {};
    bookings.forEach(b => {
      if (!playerMap[b.playerId]) {
        playerMap[b.playerId] = { ...b.player, visits: 0, totalSpent: 0, lastVisit: null };
      }
      playerMap[b.playerId].visits += 1;
      playerMap[b.playerId].totalSpent += b.totalAmount || 0;
      if (!playerMap[b.playerId].lastVisit || b.date > playerMap[b.playerId].lastVisit) {
        playerMap[b.playerId].lastVisit = b.date;
      }
    });

    res.json({ players: Object.values(playerMap).sort((a, b) => b.visits - a.visits) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
