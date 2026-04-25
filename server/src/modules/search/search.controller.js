import * as searchService from './search.service.js';

export const globalSearch = async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query) return res.json({ players: [], courts: [], posts: [] });
    const results = await searchService.searchAll(query);
    res.json(results);
  } catch (err) {
    next(err);
  }
};
