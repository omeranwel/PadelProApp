import prisma from '../../config/db.js';
import { io } from '../../config/socket.js';
import { getAvailability } from '../courts/courts.service.js';

export const createBooking = async (playerId, data) => {
  const { courtId, date, startTime, duration, paymentMethod } = data;

  // 1. Verify court
  const court = await prisma.court.findUnique({ where: { id: courtId } });
  if (!court || !court.isActive) {
    const err = new Error('Court not found or inactive');
    err.status = 404;
    throw err;
  }

  // 2. Check each slot in range [startTime, startTime + duration)
  const startHour = parseInt(startTime.split(':')[0]);
  const requestedSlots = Array.from({ length: duration }).map((_, i) => {
    return `${(startHour + i).toString().padStart(2, '0')}:00`;
  });

  const existingSlots = await prisma.availability.findMany({
    where: {
      courtId,
      date,
      startTime: { in: requestedSlots },
      isBooked: true
    }
  });

  if (existingSlots.length > 0) {
    const err = new Error('Slot already booked — please choose another time');
    err.status = 409;
    throw err;
  }

  const totalAmount = court.pricePerHour * duration;

  // 3. Create Booking & Update Availability in Transaction
  const booking = await prisma.$transaction(async (tx) => {
    const b = await tx.booking.create({
      data: {
        playerId,
        courtId,
        date,
        startTime,
        duration,
        totalAmount,
        paymentMethod,
        status: 'CONFIRMED'
      },
      include: {
        court: { select: { name: true, area: true } }
      }
    });

    // Upsert availability rows
    await Promise.all(requestedSlots.map(slot => 
      tx.availability.upsert({
        where: { courtId_date_startTime: { courtId, date, startTime: slot } },
        update: { isBooked: true },
        create: { courtId, date, startTime: slot, endTime: `${(parseInt(slot.split(':')[0]) + 1).toString().padStart(2, '0')}:00`, isBooked: true }
      })
    ));

    // Create Notification
    await tx.notification.create({
      data: {
        userId: playerId,
        type: 'booking',
        message: `Booking confirmed at ${b.court.name} on ${date} at ${startTime}`,
        link: '/bookings'
      }
    });

    return b;
  });

  // 4. Emit real-time update
  try {
    const updatedSlots = await getAvailability(courtId, date);
    if (io) {
      io.emit('availability:update', { courtId, date, slots: updatedSlots });
      io.to(`user:${playerId}`).emit('notification:new', { 
        type: 'booking', 
        message: `Booking confirmed at ${booking.court.name}` 
      });
    }
  } catch (ioErr) {
    console.error('Socket notification failed:', ioErr.message);
  }

  return {
    bookingId: booking.id,
    bookingRef: booking.bookingRef,
    courtName: booking.court.name,
    courtArea: booking.court.area,
    date: booking.date,
    startTime: booking.startTime,
    duration: booking.duration,
    totalAmount: booking.totalAmount,
    paymentMethod: booking.paymentMethod,
    status: booking.status,
    createdAt: booking.createdAt
  };
};

export const getUserBookings = async (playerId, statusFilter) => {
  const today = new Date().toISOString().split('T')[0];

  const where = { playerId };

  if (statusFilter === 'upcoming') {
    where.status = 'CONFIRMED';
    where.date = { gte: today };
  } else if (statusFilter === 'past') {
    where.OR = [
      { status: 'COMPLETED' },
      { AND: [{ status: 'CONFIRMED' }, { date: { lt: today } }] }
    ];
  } else if (statusFilter === 'cancelled') {
    where.status = 'CANCELLED';
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      court: { 
        include: { images: { where: { isPrimary: true } } }
      }
    },
    orderBy: { date: 'desc' }
  });

  return bookings.map(b => ({
    id: b.id,
    bookingRef: b.bookingRef,
    courtName: b.court.name,
    courtImage: b.court.images[0]?.url,
    area: b.court.area,
    date: b.date,
    startTime: b.startTime,
    duration: b.duration,
    totalAmount: b.totalAmount,
    status: b.status,
    createdAt: b.createdAt
  }));
};

export const getBookingById = async (id, userId) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      court: {
        include: { images: { orderBy: { isPrimary: 'desc' } } }
      }
    }
  });

  if (!booking || (booking.playerId !== userId)) return null;

  return booking;
};

export const cancelBooking = async (id, userId) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { court: true }
  });

  if (!booking || booking.playerId !== userId) {
    const err = new Error('Booking not found');
    err.status = 404;
    throw err;
  }

  if (booking.status === 'CANCELLED') return booking;

  // Check 2-hour rule
  const bookingDateTime = new Date(`${booking.date}T${booking.startTime}`);
  const now = new Date();
  const diffHours = (bookingDateTime - now) / (1000 * 60 * 60);

  if (diffHours < 2) {
    const err = new Error('Cannot cancel within 2 hours of booking time');
    err.status = 400;
    throw err;
  }

  const startHour = parseInt(booking.startTime.split(':')[0]);
  const requestedSlots = Array.from({ length: booking.duration }).map((_, i) => {
    return `${(startHour + i).toString().padStart(2, '0')}:00`;
  });

  const updated = await prisma.$transaction(async (tx) => {
    const b = await tx.booking.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    await tx.availability.updateMany({
      where: {
        courtId: booking.courtId,
        date: booking.date,
        startTime: { in: requestedSlots }
      },
      data: { isBooked: false }
    });

    return b;
  });

  // Socket notification
  try {
    const updatedSlots = await getAvailability(booking.courtId, booking.date);
    if (io) {
      io.emit('availability:update', { courtId: booking.courtId, date: booking.date, slots: updatedSlots });
    }
  } catch (ioErr) { }

  return updated;
};
