import prisma from '../../config/db.js';

export const getDashboardStats = async () => {
  const [users, courts, bookings, tournaments, clubs, listings] = await Promise.all([
    prisma.user.count(),
    prisma.court.count(),
    prisma.booking.count(),
    prisma.tournament.count(),
    prisma.club.count(),
    prisma.listing.count(),
  ]);
  const recentBookings = await prisma.booking.findMany({
    take: 10, orderBy: { createdAt: 'desc' },
    include: { player: { select: { name: true, email: true } }, court: { select: { name: true, clubName: true } } }
  });
  const recentUsers = await prisma.user.findMany({
    take: 10, orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, isVerified: true, createdAt: true, city: true }
  });
  const revenue = await prisma.booking.aggregate({ _sum: { totalAmount: true }, where: { status: 'COMPLETED' } });
  return { stats: { users, courts, bookings, tournaments, clubs, listings, revenue: revenue._sum.totalAmount || 0 }, recentBookings, recentUsers };
};

export const listUsers = async ({ page = 1, limit = 20, role, search, verified } = {}) => {
  const where = {};
  if (role) where.role = role;
  if (verified !== undefined) where.isVerified = verified === 'true';
  if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }];
  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({ where, skip: (page-1)*limit, take: limit, orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, phone: true, role: true, isVerified: true, skillLevel: true, skillRating: true, city: true, createdAt: true, lastActive: true } })
  ]);
  return { users, total, page, pages: Math.ceil(total/limit) };
};

export const updateUser = async (id, data) => {
  const allowed = ['role', 'isVerified', 'skillLevel', 'skillRating', 'city'];
  const update = {};
  for (const k of allowed) if (data[k] !== undefined) update[k] = data[k];
  return prisma.user.update({ where: { id }, data: update, select: { id: true, name: true, email: true, role: true, isVerified: true } });
};

export const deleteUser = async (id) => {
  await prisma.user.delete({ where: { id } });
  return { deleted: true };
};

export const listCourts = async ({ page = 1, limit = 20, search } = {}) => {
  const where = search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { clubName: { contains: search, mode: 'insensitive' } }] } : {};
  const [total, courts] = await Promise.all([
    prisma.court.count({ where }),
    prisma.court.findMany({ where, skip: (page-1)*limit, take: limit, orderBy: { createdAt: 'desc' },
      include: { owner: { select: { name: true, email: true } }, _count: { select: { bookings: true } } } })
  ]);
  return { courts, total, page, pages: Math.ceil(total/limit) };
};

export const toggleCourtActive = async (id, isActive) => {
  return prisma.court.update({ where: { id }, data: { isActive } });
};

export const listClubs = async ({ page = 1, limit = 20, approved } = {}) => {
  const where = {};
  if (approved !== undefined) where.isApproved = approved === 'true';
  const [total, clubs] = await Promise.all([
    prisma.club.count({ where }),
    prisma.club.findMany({ where, skip: (page-1)*limit, take: limit, orderBy: { createdAt: 'desc' },
      include: { owner: { select: { name: true, email: true, phone: true } } } })
  ]);
  return { clubs, total, page, pages: Math.ceil(total/limit) };
};

export const approveClub = async (id, isApproved) => {
  const club = await prisma.club.update({ where: { id }, data: { isApproved } });
  if (isApproved) {
    await prisma.user.update({ where: { id: club.ownerId }, data: { isVerified: true } });
  }
  return club;
};

export const listBookings = async ({ page = 1, limit = 20, status } = {}) => {
  const where = status ? { status } : {};
  const [total, bookings] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({ where, skip: (page-1)*limit, take: limit, orderBy: { createdAt: 'desc' },
      include: { player: { select: { name: true, email: true } }, court: { select: { name: true, clubName: true } } } })
  ]);
  return { bookings, total, page, pages: Math.ceil(total/limit) };
};

export const listTournaments = async () => {
  return prisma.tournament.findMany({ orderBy: { createdAt: 'desc' },
    include: { organizer: { select: { name: true, email: true } }, court: { select: { name: true, clubName: true } } } });
};

export const getReports = async () => {
  const now = new Date();
  const last30 = new Date(now - 30*24*60*60*1000);
  const [newUsers30, bookings30, revenue30, topCourts] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: last30 } } }),
    prisma.booking.count({ where: { createdAt: { gte: last30 } } }),
    prisma.booking.aggregate({ _sum: { totalAmount: true }, where: { createdAt: { gte: last30 }, status: 'COMPLETED' } }),
    prisma.court.findMany({ take: 5, orderBy: { bookings: { _count: 'desc' } },
      include: { _count: { select: { bookings: true } }, owner: { select: { name: true } } } })
  ]);
  return { newUsers30, bookings30, revenue30: revenue30._sum.totalAmount || 0, topCourts };
};
