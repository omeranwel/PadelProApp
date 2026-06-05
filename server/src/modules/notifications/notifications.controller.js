import * as service from './notifications.service.js';
import { logger } from '../../lib/logger.js';

export const getNotifications = async (req, res, next) => {
  logger.info({ user: req.user?.uid, query: req.query }, 'Notifications fetch request');
  try {
    const result = await service.getNotifications(req.user.id);
    res.json(result);
  } catch (err) {
    logger.error({ err: err.message, stack: err.stack, user: req.user?.uid }, 'Notifications fetch failed');
    next(err);
  }
};

export const markAllRead = async (req, res, next) => {
  logger.info({ user: req.user?.uid }, 'Notifications markAllRead request');
  try {
    await service.markAllRead(req.user.id);
    res.json({ success: true });
  } catch (err) {
    logger.error({ err: err.message, stack: err.stack, user: req.user?.uid }, 'Notifications markAllRead failed');
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
