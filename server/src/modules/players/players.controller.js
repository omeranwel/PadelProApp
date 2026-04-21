import * as service from './players.service.js';

export const getPlayers = async (req, res, next) => {
  try {
    const players = await service.getPlayers(req.user.id, req.query);
    res.json(players);
  } catch (err) {
    next(err);
  }
};

export const getPlayerById = async (req, res, next) => {
  try {
    const player = await service.getPlayerById(req.params.id);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    res.json(player);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const result = await service.updateProfile(req.user.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    const result = await service.uploadAvatar(req.user.id, req.file);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
