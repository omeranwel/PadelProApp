import * as service from './players.service.js';
import prisma from '../../config/db.js';

export const getPlayers = async (req,res,next) => {
  try { res.json(await service.getPlayers(req.user.id, req.query)); } catch(err){next(err);}
};
export const getPlayerById = async (req,res,next) => {
  try {
    const currentUser = await prisma.user.findUnique({ where: { id: req.user.id } });
    const { id } = req.params;

    const player = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, avatarUrl: true, city: true,
        skillLevel: true, skillRating: true, playingStyle: true,
        preferredPosition: true, dominantHand: true,
        availability: true, createdAt: true, lastActive: true,
        _count: { select: { matches: true } },
      },
    });

    if (!player || player.banned) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Win stats
    const [wins, recentMatches] = await Promise.all([
      prisma.match.count({ where: { winnerId: id, status: 'COMPLETED' } }),
      prisma.match.findMany({
        where: {
          OR: [
            { team1Player1Id: id }, { team1Player2Id: id },
            { team2Player1Id: id }, { team2Player2Id: id },
          ],
          status: 'COMPLETED',
        },
        orderBy: { completedAt: 'desc' },
        take: 10,
        include: {
          team1Player1: { select: { id: true, name: true, avatarUrl: true } },
          team1Player2: { select: { id: true, name: true, avatarUrl: true } },
          team2Player1: { select: { id: true, name: true, avatarUrl: true } },
          team2Player2: { select: { id: true, name: true, avatarUrl: true } },
          booking: { select: { court: { select: { name: true, club: { select: { name: true } } } } } },
        },
      }),
    ]);

    const totalMatches = player._count.matches;
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

    // Friendship status
    const [friendship, sentReq, receivedReq] = await Promise.all([
      prisma.friendship.findFirst({
        where: { OR: [{ userId: currentUser.id, friendId: id }, { userId: id, friendId: currentUser.id }] },
      }),
      prisma.friendRequest.findFirst({
        where: { senderId: currentUser.id, receiverId: id, status: 'PENDING' },
      }),
      prisma.friendRequest.findFirst({
        where: { senderId: id, receiverId: currentUser.id, status: 'PENDING' },
      }),
    ]);

    let friendshipStatus = 'none';
    let friendRequestId = null;
    if (friendship) { friendshipStatus = 'friends'; }
    else if (sentReq) { friendshipStatus = 'request_sent'; friendRequestId = sentReq.id; }
    else if (receivedReq) { friendshipStatus = 'request_received'; friendRequestId = receivedReq.id; }

    res.json({
      player: {
        ...player,
        stats: { totalMatches, wins, winRate, losses: totalMatches - wins },
      },
      recentMatches,
      friendshipStatus,
      friendRequestId,
      isOwnProfile: currentUser.id === id,
    });
  } catch(err){next(err);}
};
export const updateProfile = async (req,res,next) => {
  try { res.json(await service.updateProfile(req.user.id, req.body)); } catch(err){next(err);}
};
export const uploadAvatar = async (req,res,next) => {
  try { res.json(await service.uploadAvatar(req.user.id, req.file)); } catch(err){next(err);}
};
export const getLeaderboard = async (req,res,next) => {
  try { res.json(await service.getLeaderboard(req.query)); } catch(err){next(err);}
};
export const logMatch = async (req,res,next) => {
  try { res.json(await service.logMatch(req.user.id, req.body)); } catch(err){next(err);}
};
export const getMyStats = async (req,res,next) => {
  try { res.json(await service.getMyStats(req.user.id)); } catch(err){next(err);}
};

export const suggestPlayers = async (req, res, next) => {
  try {
    const { query = '', excludeIds = '' } = req.query;
    const exclude = excludeIds ? excludeIds.split(',').filter(Boolean) : [];
    exclude.push(req.user.id); // never suggest self

    const players = await prisma.user.findMany({
      where: {
        role: 'PLAYER',
        matchmakingEnabled: true,
        id: { notIn: exclude },
        name: { contains: query, mode: 'insensitive' },
      },
      select: {
        id: true, name: true, avatarUrl: true,
        skillLevel: true, skillRating: true, city: true,
        preferredPosition: true, playingStyle: true,
      },
      take: 8,
    });
    res.json({ players });
  } catch (err) { next(err); }
};
