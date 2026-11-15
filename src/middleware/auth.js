import { authenticate } from '../auth.js';

export { admin } from '../auth.js';

export const asyncRoute = (handler) => (req, res, next) => {
  return Promise.resolve(handler(req, res, next)).catch(next);
};

export const auth = asyncRoute(authenticate);
