import * as svc from './clubs.service.js';

export const getMyClub = async (req, res, next) => {
  try { res.json(await svc.getMyClub(req.user.id)); } catch(e) { next(e); }
};
export const upsertClub = async (req, res, next) => {
  try { res.json(await svc.createOrUpdateClub(req.user.id, req.body)); } catch(e) { next(e); }
};
export const getStats = async (req, res, next) => {
  try { res.json(await svc.getClubStats(req.user.id)); } catch(e) { next(e); }
};
export const getBookings = async (req, res, next) => {
  try { res.json(await svc.getClubBookings(req.user.id, req.query)); } catch(e) { next(e); }
};
export const patchBooking = async (req, res, next) => {
  try { res.json(await svc.updateBookingStatus(req.params.id, req.user.id, req.body.status)); } catch(e) { next(e); }
};
export const getSlots = async (req, res, next) => {
  try { res.json(await svc.getCourtSlots(req.params.courtId, req.query.date)); } catch(e) { next(e); }
};
export const createSlots = async (req, res, next) => {
  try { res.json(await svc.bulkCreateSlots(req.params.courtId, req.user.id, req.body.slots)); } catch(e) { next(e); }
};
export const getTournaments = async (req, res, next) => {
  try { res.json(await svc.getClubTournaments(req.user.id)); } catch(e) { next(e); }
};
export const getAllClubs = async (req, res, next) => {
  try { res.json(await svc.getAllClubs()); } catch(e) { next(e); }
};
