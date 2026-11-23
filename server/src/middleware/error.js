import ApiError from '../utils/ApiError.js';

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${req.method} ${req.originalUrl}] ${status} — ${message}`);
    if (err.stack) console.error(err.stack);
  }
  res.status(status).json({ success: false, data: null, message });
};