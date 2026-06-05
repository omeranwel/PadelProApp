import prisma from '../../config/db.js';
import { formatDistanceToNow } from 'date-fns';

export const getNotifications = async (userId) => {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications: notifications.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title || n.type,
      message: n.body || n.message || '',
      time: formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }),
      read: n.isRead,
      link: n.link,
      data: n.data,
    })),
    unreadCount,
  };
};

export const markAllRead = async (userId) => {
  return await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true }
  });
};

export const markOneRead = async (id, userId) => {
  return await prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true }
  });
};

export const deleteNotification = async (id, userId) => {
  return await prisma.notification.deleteMany({
    where: { id, userId }
  });
};
