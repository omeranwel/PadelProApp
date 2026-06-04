import * as service from './matchmaking.service.js';
import prisma from '../../config/db.js';
import { getDbUser } from '../../utils/getDbUser.js';

export const getPlayers = async (req, res, next) => {
  try {
    const { skillLevel, maxDistance, page = 1, limit = 20, nearbyOnly } = req.query;
    const currentUser = await getDbUser(req.user.uid);

    const where = {
      id: { not: currentUser.id },
      profileComplete: true,
      ...(skillLevel && skillLevel !== '' && { skillLevel: { in: skillLevel.split(',') } }),
      ...(currentUser.city && !nearbyOnly && { city: currentUser.city }),
    };

    const [players, total] = await Promise.all([
      prisma.user.findMany({
        where, take: parseInt(limit), skip: (parseInt(page) - 1) * parseInt(limit),
        orderBy: [{ skillRating: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true, name: true, avatarUrl: true, city: true, skillLevel: true, skillRating: true,
          preferredPosition: true, playingStyle: true, dominantHand: true, _count: { select: { matches: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    if (players.length === 0) {
      const fallback = await prisma.user.findMany({
        where: { id: { not: currentUser.id } },
        take: parseInt(limit), orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, avatarUrl: true, city: true, skillLevel: true, skillRating: true },
      });
      return res.json({ players: fallback, total: fallback.length, fallback: true });
    }

    res.json({ players, total });
  } catch (err) {
    console.error('Matchmaking players error:', err);
    res.status(500).json({ message: 'Failed to load players', error: err.message });
  }
};

export const sendRequest = async (req, res, next) => {
  try {
    const { receiverId, message } = req.body;
    const result = await service.sendRequest(req.user.id, receiverId, message);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const getRequests = async (req, res, next) => {
  try {
    const { type } = req.query; // sent | received
    const result = await service.getRequests(req.user.id, type);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const updateRequest = async (req, res, next) => {
  try {
    const { status } = req.body;
    const result = await service.updateRequest(req.params.id, req.user.id, status);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const cancelRequest = async (req, res, next) => {
  try {
    await service.cancelRequest(req.params.id, req.user.id);
    res.json({ message: 'Request cancelled' });
  } catch (err) {
    next(err);
  }
};
