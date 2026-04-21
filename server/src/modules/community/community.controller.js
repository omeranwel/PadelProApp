import * as service from './community.service.js';

export const getPosts = async (req, res, next) => {
  try {
    const { tab } = req.query;
    const result = await service.getPosts(tab);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const result = await service.createPost(req.user.id, req.body, req.file);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'like' or 'unlike'
    const result = await service.toggleLike(id, action !== 'unlike');
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getReplies = async (req, res, next) => {
  try {
    const result = await service.getReplies(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const createReply = async (req, res, next) => {
  try {
    const { content } = req.body;
    const result = await service.createReply(req.user.id, req.params.id, content);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};
