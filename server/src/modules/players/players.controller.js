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
