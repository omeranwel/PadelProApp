import * as service from './players.service.js';

export const getPlayers = async (req,res,next) => {
  try { res.json(await service.getPlayers(req.user.id, req.query)); } catch(err){next(err);}
};
export const getPlayerById = async (req,res,next) => {
  try {
    const p = await service.getPlayerById(req.params.id);
    if (!p) return res.status(404).json({error:'Player not found'});
    res.json(p);
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
    const exclude = excludeIds ? excludeIds.split(',') : [];
    exclude.push(req.user.id); // never suggest self

    const players = await (await import('../../config/db.js')).default.user.findMany({
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
