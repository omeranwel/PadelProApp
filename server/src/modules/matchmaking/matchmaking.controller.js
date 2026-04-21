import * as service from './matchmaking.service.js';

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
