import { ApiError } from '../validation.js';

export const notFound = (_req, _res, next) => {
  next(new ApiError(404, 'Route not found'));
};

export const errorHandler = (error, _req, res, _next) => {
  const status = error.status || (error.code === 11000 ? 409 : error.name === 'ValidationError' ? 400 : 500);
  const message = error.code === 11000 ? 'Email is already registered'
    : status >= 500 ? 'Service temporarily unavailable' : error.message;
  if (status >= 500) console.error('API error:', error.name);
  res.status(status).json({ success: false, message });
};
