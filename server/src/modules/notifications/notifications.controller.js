import * as service from './notifications.service.js';

export const getNotifications = async (req, res, next) => {
  try {
    const result = await service.getNotifications(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    await service.markAllRead(req.user.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const markOneRead = async (req, res, next) => {
  try {
    await service.markOneRead(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    await service.deleteNotification(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
