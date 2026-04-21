import prisma from '../../config/db.js';
import { io } from '../../config/socket.js';
import { formatDistanceToNow } from 'date-fns';

export const getConversations = async (userId) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { participant1: userId },
        { participant2: userId }
      ]
    },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return await Promise.all(conversations.map(async (c) => {
    const partnerId = c.participant1 === userId ? c.participant2 : c.participant1;
    const partner = await prisma.user.findUnique({
      where: { id: partnerId },
      select: { id: true, name: true, avatarUrl: true, skillLevel: true, updatedAt: true }
    });

    const unreadCount = await prisma.message.count({
      where: {
        conversationId: c.id,
        senderId: partnerId,
        isRead: false
      }
    });

    return {
      id: c.id,
      partner: {
        ...partner,
        lastActive: formatDistanceToNow(new Date(partner.updatedAt), { addSuffix: true })
      },
      lastMessage: c.messages[0] ? {
        content: c.messages[0].content,
        createdAt: c.messages[0].createdAt,
        isRead: c.messages[0].isRead
      } : null,
      unreadCount
    };
  }));
};

export const getMessages = async (conversationId, userId, page = 1, limit = 50) => {
  // Verify participant
  const convo = await prisma.conversation.findUnique({
    where: { id: conversationId }
  });
  if (!convo || (convo.participant1 !== userId && convo.participant2 !== userId)) {
    const err = new Error('Conversation not found');
    err.status = 404;
    throw err;
  }

  // Mark messages as read
  const partnerId = convo.participant1 === userId ? convo.participant2 : convo.participant1;
  await prisma.message.updateMany({
    where: { conversationId, senderId: partnerId, isRead: false },
    data: { isRead: true }
  });

  return await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    skip: (page - 1) * limit,
    take: limit
  });
};

export const sendMessage = async (conversationId, senderId, content) => {
  const message = await prisma.message.create({
    data: { conversationId, senderId, content }
  });

  // Update conversation timestamp
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() }
  });

  // Emit socket
  if (io) {
    io.to(`conversation:${conversationId}`).emit('message:new', message);
  }

  return message;
};

export const createConversation = async (userId, participantId) => {
  let convo = await prisma.conversation.findFirst({
    where: {
      OR: [
        { participant1: userId, participant2: participantId },
        { participant1: participantId, participant2: userId }
      ]
    }
  });

  if (!convo) {
    convo = await prisma.conversation.create({
      data: {
        participant1: userId,
        participant2: participantId
      }
    });
  }

  const partner = await prisma.user.findUnique({
    where: { id: participantId },
    select: { id: true, name: true, avatarUrl: true, skillLevel: true }
  });

  return { id: convo.id, partner };
};
