import * as svc from './reviews.service.js';

export const submit = async (req, res, next) => {
  try { res.json(await svc.submitReview(req.user.id, req.body)); } catch(e) { next(e); }
};
export const getForPlayer = async (req, res, next) => {
  try { res.json(await svc.getPlayerReviews(req.params.playerId, req.query)); } catch(e) { next(e); }
};
export const canReview = async (req, res, next) => {
  try { res.json(await svc.checkCanReview(req.user.id, req.params.subjectId, req.query.matchId)); } catch(e) { next(e); }
};
export const getTags = async (req, res, next) => {
  try { res.json(svc.getAvailableTags()); } catch(e) { next(e); }
};
export const getPending = async (req, res, next) => {
  try { res.json(await svc.getMyPendingReviews(req.user.id)); } catch(e) { next(e); }
};
