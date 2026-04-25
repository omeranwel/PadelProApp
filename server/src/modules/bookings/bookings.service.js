import prisma from '../../config/db.js';
import { io } from '../../config/socket.js';
import { getAvailability } from '../courts/courts.service.js';
import { sendBookingConfirmation, sendRescheduleConfirmation } from '../../utils/email.js';

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

  // 5. Send Email (Async)
  const user = await prisma.user.findUnique({ where: { id: playerId }, select: { name: true, email: true } });
  if (user && user.email) {
    sendBookingConfirmation(user, booking).catch(err => console.error('Email confirmation failed:', err.message));
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

export const rescheduleBooking = async (id, userId, { date, startTime }) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { court: true }
  });

  if (!booking || booking.playerId !== userId) {
    const err = new Error('Booking not found'); err.status = 404; throw err;
  }

  // Check 24-hour rule for rescheduling (as per user instruction for "corporate policies")
  // The front-end note says 24h for free cancellation, let's apply same for rescheduling
  const bookingDateTime = new Date(`${booking.date}T${booking.startTime}`);
  const now = new Date();
  const diffHours = (bookingDateTime - now) / (1000 * 60 * 60);

  if (diffHours < 24) {
    const err = new Error('Rescheduling is only allowed up to 24 hours before the booking');
    err.status = 400;
    throw err;
  }

  // Check new slot availability
  const startHour = parseInt(startTime.split(':')[0]);
  const duration = booking.duration;
  const requestedSlots = Array.from({ length: duration }).map((_, i) => {
    return `${(startHour + i).toString().padStart(2, '0')}:00`;
  });

  const existingSlots = await prisma.availability.findMany({
    where: {
      courtId: booking.courtId,
      date,
      startTime: { in: requestedSlots },
      isBooked: true
    }
  });

  if (existingSlots.length > 0) {
    throw new Error('Requested time slot is already booked');
  }

  // Calculate old slots to free them
  const oldStartHour = parseInt(booking.startTime.split(':')[0]);
  const oldSlots = Array.from({ length: booking.duration }).map((_, i) => {
    return `${(oldStartHour + i).toString().padStart(2, '0')}:00`;
  });

  const updatedResult = await prisma.$transaction(async (tx) => {
    // 1. Free old slots
    await tx.availability.updateMany({
      where: { courtId: booking.courtId, date: booking.date, startTime: { in: oldSlots } },
      data: { isBooked: false }
    });

    // 2. Book new slots
    await Promise.all(requestedSlots.map(slot => 
      tx.availability.upsert({
        where: { courtId_date_startTime: { courtId: booking.courtId, date, startTime: slot } },
        update: { isBooked: true },
        create: { courtId: booking.courtId, date, startTime: slot, endTime: `${(parseInt(slot.split(':')[0]) + 1).toString().padStart(2, '0')}:00`, isBooked: true }
      })
    ));

    // 3. Update booking
    const updated = await tx.booking.update({
      where: { id },
      data: { date, startTime }
    });

    // 4. Notification
    await tx.notification.create({
      data: {
        userId,
        type: 'booking',
        message: `Your booking for ${booking.court.name} has been rescheduled to ${date} at ${startTime}`,
        link: '/bookings'
      }
    });

    return updated;
  });

  // 5. Send Email
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
  if (user && user.email) {
    sendRescheduleConfirmation(user, { ...updatedResult, courtName: booking.court.name }).catch(err => console.error('Email reschedule failed:', err.message));
  }

  return updatedResult;
};
