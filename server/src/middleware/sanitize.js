import sanitizeHtml from 'sanitize-html';

const ALLOWED = { allowedTags: [], allowedAttributes: {} }; // strip all HTML

export const sanitizeBody = (fields) => (req, res, next) => {
  fields.forEach(field => {
    if (req.body[field] && typeof req.body[field] === 'string') {
      req.body[field] = sanitizeHtml(req.body[field], ALLOWED).trim();
    }
  });
  next();
};
