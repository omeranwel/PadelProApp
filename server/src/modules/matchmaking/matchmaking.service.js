import prisma from '../../config/db.js';
import { io } from '../../config/socket.js';

export const sendRequest = async (senderId, receiverId, message) => {
  const request = await prisma.matchRequest.create({
    data: {
      senderId,
      receiverId,
      message,
      status: 'pending'
    },
    include: {
      sender: { select: { name: true, avatarUrl: true } }
    }
  });

  // Build and save notification
  const notification = await prisma.notification.create({
    data: {
      userId: receiverId,
      type: 'match_request',
      message: `${request.sender.name} sent you a match request`,
      link: '/matches?tab=requests'
    }
  });

  // Real-time emit
  if (io) {
    io.to(`user:${receiverId}`).emit('notification:new', {
      id: notification.id,
      type: 'match_request',
      message: notification.message,
      time: 'just now',
      read: false,
      link: notification.link
    });
  }

  return request;
};

export const getRequests = async (userId, type) => {
  const where = type === 'sent' 
    ? { senderId: userId } 
    : { receiverId: userId };

  return await prisma.matchRequest.findMany({
    where,
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true, skillLevel: true } },
      receiver: { select: { id: true, name: true, avatarUrl: true, skillLevel: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const updateRequest = async (id, userId, status) => {
  const request = await prisma.matchRequest.findUnique({
    where: { id },
    include: { sender: true }
  });

  if (!request || request.receiverId !== userId) {
    const err = new Error('Request not found');
    err.status = 404;
    throw err;
  }

  const updated = await prisma.matchRequest.update({
    where: { id },
    data: { status }
  });

  if (status === 'accepted') {
    // 1. Create or find conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { participant1: request.senderId, participant2: request.receiverId },
          { participant1: request.receiverId, participant2: request.senderId }
        ]
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participant1: request.senderId,
          participant2: request.receiverId
        }
      });
    }

    // 2. Notify sender
    const notification = await prisma.notification.create({
      data: {
        userId: request.senderId,
        type: 'match_request',
        message: `Your match request to was accepted!`,
        link: `/chat?id=${conversation.id}`
      }
    });

    if (io) {
      io.to(`user:${request.senderId}`).emit('match:accepted', {
        conversationId: conversation.id,
        partnerName: 'Your partner'
      });
      io.to(`user:${request.senderId}`).emit('notification:new', {
        type: 'match_request',
        message: notification.message
      });
    }

    return { ...updated, conversationId: conversation.id };
  }

  return updated;
};

export const cancelRequest = async (id, userId) => {
  const request = await prisma.matchRequest.findUnique({ where: { id } });
  if (!request || request.senderId !== userId) {
    const err = new Error('Request not found');
    err.status = 404;
    throw err;
  }

  return await prisma.matchRequest.delete({ where: { id } });
};
