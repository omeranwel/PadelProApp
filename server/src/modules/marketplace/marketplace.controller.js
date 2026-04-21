import * as service from './marketplace.service.js';

export const getListings = async (req, res, next) => {
  try {
    const result = await service.getListings(req.user?.id, req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getListingById = async (req, res, next) => {
  try {
    const result = await service.getListingById(req.params.id, req.user?.id);
    if (!result) return res.status(404).json({ error: 'Listing not found' });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const createListing = async (req, res, next) => {
  try {
    const result = await service.createListing(req.user.id, req.body, req.files);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const updateListing = async (req, res, next) => {
  try {
    // Add implementation if needed, but for now we'll stick to core
    res.status(501).json({ error: 'Not implemented' });
  } catch (err) {
    next(err);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    // Add logic to verify ownership
    res.status(501).json({ error: 'Not implemented' });
  } catch (err) {
    next(err);
  }
};

export const toggleSave = async (req, res, next) => {
  try {
    const result = await service.toggleSave(req.user.id, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getSavedListings = async (req, res, next) => {
  try {
    const result = await service.getSavedListings(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const sendOffer = async (req, res, next) => {
  try {
    const { price, message } = req.body;
    const result = await service.sendOffer(req.user.id, req.params.id, price, message);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const incrementView = async (req, res, next) => {
  try {
    await service.incrementView(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
