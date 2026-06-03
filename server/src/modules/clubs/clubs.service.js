import prisma from '../../config/db.js';

export const getMyClub = async (ownerId) => {
  const club = await prisma.club.findUnique({ where: { ownerId }, include: { owner: { select: { name: true, email: true } } } });
  if (!club) { const err = new Error('Club not found'); err.status = 404; throw err; }
  const courts = await prisma.court.findMany({ where: { ownerId }, include: { _count: { select: { bookings: true } }, images: true } });
  return { ...club, courts };
};

export const createOrUpdateClub = async (ownerId, data) => {
  const existing = await prisma.club.findUnique({ where: { ownerId } });
  const clubData = {
    name: data.name, description: data.description, address: data.address || '',
    area: data.area || '', city: data.city || 'Karachi', contactPhone: data.contactPhone,
    contactEmail: data.contactEmail, website: data.website, logo: data.logo,
    coverImage: data.coverImage, amenities: data.amenities || [], operatingHours: data.operatingHours || {}
  };
  if (existing) return prisma.club.update({ where: { ownerId }, data: clubData });
  return prisma.club.create({ data: { ...clubData, ownerId } });
};

export const getClubStats = async (ownerId) => {
  const club = await prisma.club.findUnique({ where: { ownerId } });
  const courts = await prisma.court.findMany({ where: { ownerId } });
  const courtIds = courts.map(c => c.id);
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const last30 = new Date(now - 30*24*60*60*1000);

  const [totalBookings, todayBookings, pendingBookings, recentBookings, revenue] = await Promise.all([
    prisma.booking.count({ where: { courtId: { in: courtIds } } }),
    prisma.booking.count({ where: { courtId: { in: courtIds }, date: today } }),
    prisma.booking.count({ where: { courtId: { in: courtIds }, status: 'CONFIRMED' } }),
    prisma.booking.findMany({ where: { courtId: { in: courtIds }, createdAt: { gte: last30 } },
      orderBy: { createdAt: 'desc' }, take: 20,
      include: { player: { select: { name: true, email: true, phone: true } }, court: { select: { name: true } } } }),
    prisma.booking.aggregate({ _sum: { totalAmount: true }, where: { courtId: { in: courtIds }, status: 'COMPLETED' } })
  ]);

  const dailyRevenue = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i*24*60*60*1000).toISOString().split('T')[0];
    const r = await prisma.booking.aggregate({ _sum: { totalAmount: true }, where: { courtId: { in: courtIds }, date: d, status: 'COMPLETED' } });
    dailyRevenue.push({ date: d, revenue: r._sum.totalAmount || 0 });
  }

  return { club, courts: courts.length, totalBookings, todayBookings, pendingBookings, recentBookings, totalRevenue: revenue._sum.totalAmount || 0, dailyRevenue };
};

export const getClubBookings = async (ownerId, { page = 1, limit = 20, status, date } = {}) => {
  const courts = await prisma.court.findMany({ where: { ownerId }, select: { id: true } });
  const courtIds = courts.map(c => c.id);
  const where = { courtId: { in: courtIds } };
  if (status) where.status = status;
  if (date) where.date = date;
  const [total, bookings] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({ where, skip: (page-1)*limit, take: limit, orderBy: { createdAt: 'desc' },
      include: { player: { select: { name: true, email: true, phone: true, avatarUrl: true } }, court: { select: { name: true } } } })
  ]);
  return { bookings, total, page, pages: Math.ceil(total/limit) };
};

export const updateBookingStatus = async (bookingId, ownerId, status) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { court: true } });
  if (!booking || booking.court.ownerId !== ownerId) { const err = new Error('Not authorized'); err.status = 403; throw err; }
  return prisma.booking.update({ where: { id: bookingId }, data: { status } });
};

export const getCourtSlots = async (courtId, date) => {
  return prisma.availability.findMany({ where: { courtId, date }, orderBy: { startTime: 'asc' } });
};

export const bulkCreateSlots = async (courtId, ownerId, slots) => {
  const court = await prisma.court.findUnique({ where: { id: courtId } });
  if (!court || court.ownerId !== ownerId) { const err = new Error('Not authorized'); err.status = 403; throw err; }
  const created = [];
  for (const slot of slots) {
    try {
      const s = await prisma.availability.upsert({
        where: { courtId_date_startTime: { courtId, date: slot.date, startTime: slot.startTime } },
        update: { endTime: slot.endTime, isBooked: slot.isBooked || false },
        create: { courtId, date: slot.date, startTime: slot.startTime, endTime: slot.endTime, isBooked: false }
      });
      created.push(s);
    } catch {}
  }
  return created;
};

export const getClubTournaments = async (ownerId) => {
  const courts = await prisma.court.findMany({ where: { ownerId }, select: { id: true } });
  const courtIds = courts.map(c => c.id);
  return prisma.tournament.findMany({
    where: { OR: [{ organizerId: ownerId }, { courtId: { in: courtIds } }] },
    orderBy: { createdAt: 'desc' },
    include: { court: { select: { name: true } } }
  });
};

export const getAllClubs = async () => {
  return prisma.club.findMany({ where: { isApproved: true, isActive: true }, orderBy: { name: 'asc' },
    include: { owner: { select: { name: true } } } });
};
