import * as service from './bookings.service.js';

export const createBooking = async (req, res, next) => {
  try {
    const result = await service.createBooking(req.user.id, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const getUserBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const result = await service.getUserBookings(req.user.id, status);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const result = await service.getBookingById(req.params.id, req.user.id);
    if (!result) return res.status(404).json({ error: 'Booking not found' });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const result = await service.cancelBooking(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const rescheduleBooking = async (req, res, next) => {
  try {
    const { date, startTime } = req.body;
    const result = await service.rescheduleBooking(req.params.id, req.user.id, { date, startTime });
    res.json(result);
  } catch (err) {
    next(err);
  }
};
