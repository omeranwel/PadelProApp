import * as svc from './admin.service.js';

export const getDashboard = async (req, res, next) => {
  try { res.json(await svc.getDashboardStats()); } catch(e) { next(e); }
};
export const getUsers = async (req, res, next) => {
  try { res.json(await svc.listUsers(req.query)); } catch(e) { next(e); }
};
export const patchUser = async (req, res, next) => {
  try { res.json(await svc.updateUser(req.params.id, req.body)); } catch(e) { next(e); }
};
export const removeUser = async (req, res, next) => {
  try { res.json(await svc.deleteUser(req.params.id)); } catch(e) { next(e); }
};
export const getCourts = async (req, res, next) => {
  try { res.json(await svc.listCourts(req.query)); } catch(e) { next(e); }
};
export const patchCourt = async (req, res, next) => {
  try { res.json(await svc.toggleCourtActive(req.params.id, req.body.isActive)); } catch(e) { next(e); }
};
export const getClubs = async (req, res, next) => {
  try { res.json(await svc.listClubs(req.query)); } catch(e) { next(e); }
};
export const patchClub = async (req, res, next) => {
  try { res.json(await svc.approveClub(req.params.id, req.body.isApproved)); } catch(e) { next(e); }
};
export const getBookings = async (req, res, next) => {
  try { res.json(await svc.listBookings(req.query)); } catch(e) { next(e); }
};
export const getTournaments = async (req, res, next) => {
  try { res.json(await svc.listTournaments()); } catch(e) { next(e); }
};
export const getReports = async (req, res, next) => {
  try { res.json(await svc.getReports()); } catch(e) { next(e); }
};
