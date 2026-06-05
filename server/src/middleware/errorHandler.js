export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error in request', {
    method: req.method,
    url: req.originalUrl,
    status: err.status || 500,
    message: err.message,
    stack: err.stack,
    details: err.details,
  });
  
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  
  res.status(status).json({ 
    error: message,
    requiresVerification: err.requiresVerification || false,
    email: err.email || undefined,
    stack: err.stack,
    details: err.details,
  });
};
