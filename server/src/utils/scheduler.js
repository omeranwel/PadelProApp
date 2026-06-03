import prisma from '../config/db.js';
import { sendBookingReviewPrompt } from './email.js';
import { io } from '../config/socket.js';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // every hour

const getBookingEndMs = (booking) => {
  const endHour = parseInt(booking.startTime.split(':')[0]) + booking.duration;
  const endTimeStr = `${endHour.toString().padStart(2, '0')}:00`;
  const dt = new Date(`${booking.date}T${endTimeStr}:00`);
  return isNaN(dt.getTime()) ? null : dt.getTime();
};

const runReviewPrompts = async () => {
  try {
    const candidates = await prisma.booking.findMany({
      where: {
        reviewSent: false,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
      include: {
        player: { select: { id: true, name: true, email: true } },
        court: { select: { name: true, address: true, area: true } },
      },
    });

    const now = Date.now();
    const due = candidates.filter((b) => {
      const endMs = getBookingEndMs(b);
      return endMs !== null && now - endMs >= TWENTY_FOUR_HOURS_MS;
    });

    if (due.length === 0) return;

    for (const booking of due) {
      if (!booking.player?.email) continue;
      await sendBookingReviewPrompt(booking.player, booking).catch(() => {});

      // Real-time push notification
      if (io) {
        io.to(`user:${booking.player.id}`).emit('notification:new', {
          type: 'review_prompt',
          title: 'How was your session?',
          message: `Rate your experience at ${booking.court?.name || 'the court'}.`,
          link: '/courts',
        });
      }

      await prisma.booking.update({
        where: { id: booking.id },
        data: { reviewSent: true },
      });
    }

    console.log(`[scheduler] Sent ${due.length} review prompt(s)`);
  } catch (err) {
    console.error('[scheduler] Error running review prompts:', err.message);
  }
};

export const startScheduler = () => {
  runReviewPrompts();
  setInterval(runReviewPrompts, CHECK_INTERVAL_MS);
  console.log('[scheduler] Review prompt scheduler started (runs every hour)');
};
