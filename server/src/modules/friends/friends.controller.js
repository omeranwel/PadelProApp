import prisma from '../../config/db.js';
import { getDbUser } from '../../utils/getDbUser.js';

// POST /api/friends/request
export const sendRequest = async (req, res) => {
  try {
    const sender = await getDbUser(req.user.uid);
    const { targetUserId } = req.body;
    if (!targetUserId) return res.status(400).json({ message: 'targetUserId is required' });
    if (sender.id === targetUserId) return res.status(400).json({ message: "Can't send a request to yourself" });

    const existing = await prisma.friendship.findFirst({
      where: { OR: [{ userId: sender.id, friendId: targetUserId }, { userId: targetUserId, friendId: sender.id }] },
    });
    if (existing) return res.status(409).json({ message: 'Already friends' });

    const existingReq = await prisma.friendRequest.findFirst({
      where: { senderId: sender.id, receiverId: targetUserId },
    });
    if (existingReq && existingReq.status === 'PENDING') return res.status(409).json({ message: 'Request already sent' });

    let request;
    if (existingReq) {
      request = await prisma.friendRequest.update({
        where: { id: existingReq.id },
        data: { status: 'PENDING' },
        include: { sender: { select: { name: true, avatarUrl: true } } },
      });
    } else {
      request = await prisma.friendRequest.create({
        data: { senderId: sender.id, receiverId: targetUserId },
        include: { sender: { select: { name: true, avatarUrl: true } } },
      });
    }

    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: 'friend_request',
        title: 'New Friend Request',
        body: `${sender.name} wants to connect with you on PadelPro`,
        data: { requestId: request.id, senderId: sender.id },
      },
    });

    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/friends/request/:requestId
export const respondRequest = async (req, res) => {
  try {
    const { action } = req.body; // 'accept' | 'decline'
    const currentUser = await getDbUser(req.user.uid);

    const request = await prisma.friendRequest.findUnique({
      where: { id: req.params.requestId },
      include: { sender: { select: { id: true, name: true } } },
    });

    if (!request || request.receiverId !== currentUser.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (action === 'accept') {
      await prisma.$transaction([
        prisma.friendRequest.update({ where: { id: request.id }, data: { status: 'ACCEPTED' } }),
        prisma.friendship.create({ data: { userId: request.senderId, friendId: request.receiverId } }),
        prisma.friendship.create({ data: { userId: request.receiverId, friendId: request.senderId } }),
      ]);

      await prisma.notification.create({
        data: {
          userId: request.senderId,
          type: 'friend_accepted',
          title: 'Friend Request Accepted',
          body: `${currentUser.name} accepted your friend request!`,
          data: { userId: currentUser.id },
        },
      });
    } else {
      await prisma.friendRequest.update({ where: { id: request.id }, data: { status: 'DECLINED' } });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/friends
export const getFriends = async (req, res) => {
  try {
    const currentUser = await getDbUser(req.user.uid);
    const friendships = await prisma.friendship.findMany({
      where: { userId: currentUser.id },
      include: {
        friend: {
          select: {
            id: true, name: true, avatarUrl: true, city: true,
            skillLevel: true, skillRating: true, lastActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ friends: friendships.map(f => f.friend) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/friends/requests
export const getRequests = async (req, res) => {
  try {
    const currentUser = await getDbUser(req.user.uid);
    const requests = await prisma.friendRequest.findMany({
      where: { receiverId: currentUser.id, status: 'PENDING' },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true, skillLevel: true, city: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/friends/:friendId
export const removeFriend = async (req, res) => {
  try {
    const currentUser = await getDbUser(req.user.uid);
    const { friendId } = req.params;
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId: currentUser.id, friendId },
          { userId: friendId, friendId: currentUser.id },
        ],
      },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/friends/request/:requestId — cancel a sent pending request
export const cancelRequest = async (req, res) => {
  try {
    const currentUser = await getDbUser(req.user.uid);
    const request = await prisma.friendRequest.findUnique({ where: { id: req.params.requestId } });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.senderId !== currentUser.id) return res.status(403).json({ message: 'Can only cancel your own requests' });
    if (request.status !== 'PENDING') return res.status(400).json({ message: 'Request is no longer pending' });
    await prisma.friendRequest.delete({ where: { id: request.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/friends/status/:userId — check friendship status with a specific user
export const getFriendStatus = async (req, res) => {
  try {
    const currentUser = await getDbUser(req.user.uid);
    const { userId } = req.params;

    const [friendship, sent, received] = await Promise.all([
      prisma.friendship.findFirst({
        where: { OR: [{ userId: currentUser.id, friendId: userId }, { userId, friendId: currentUser.id }] },
      }),
      prisma.friendRequest.findFirst({ where: { senderId: currentUser.id, receiverId: userId, status: 'PENDING' } }),
      prisma.friendRequest.findFirst({ where: { senderId: userId, receiverId: currentUser.id, status: 'PENDING' } }),
    ]);

    if (friendship) return res.json({ status: 'friends' });
    if (sent)       return res.json({ status: 'request_sent', requestId: sent.id });
    if (received)   return res.json({ status: 'request_received', requestId: received.id });
    res.json({ status: 'none' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
