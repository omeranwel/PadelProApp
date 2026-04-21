import * as service from './chat.service.js';

export const getConversations = async (req, res, next) => {
  try {
    const result = await service.getConversations(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await service.getMessages(req.params.id, req.user.id, parseInt(page), parseInt(limit));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const result = await service.sendMessage(req.params.id, req.user.id, content);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const createConversation = async (req, res, next) => {
  try {
    const { participantId } = req.body;
    const result = await service.createConversation(req.user.id, participantId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};
