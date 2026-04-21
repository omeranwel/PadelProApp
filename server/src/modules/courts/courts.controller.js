import * as service from './courts.service.js';

export const getCourts = async (req, res, next) => {
  try {
    const courts = await service.getCourts(req.query);
    res.json(courts);
  } catch (err) {
    next(err);
  }
};

export const getCourtById = async (req, res, next) => {
  try {
    const court = await service.getCourtById(req.params.id);
    if (!court) return res.status(404).json({ error: 'Court not found' });
    res.json(court);
  } catch (err) {
    next(err);
  }
};

export const getAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'Date is required' });
    
    const slots = await service.getAvailability(id, date);
    res.json(slots);
  } catch (err) {
    next(err);
  }
};

export const createCourt = async (req, res, next) => {
  try {
    const result = await service.createCourt(req.user.id, req.body, req.files);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateCourt = async (req, res, next) => {
  try {
    const result = await service.updateCourt(req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteCourt = async (req, res, next) => {
  try {
    await service.deleteCourt(req.params.id);
    res.json({ message: 'Court deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const addReview = async (req, res, next) => {
  try {
    const result = await service.addReview(req.user.id, req.params.id, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};
