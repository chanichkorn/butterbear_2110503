import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import campgroundRoutes from './routes/campgrounds.js';
import favoriteRoutes from './routes/favorites.js';
import bookingRoutes from './routes/bookings.js';
import { notFound, errorHandler } from './middleware/error.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  // Set only when deployed behind exactly one trusted reverse proxy (e.g. Beanstalk).
  if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);
  app.use(helmet());
  app.use(express.json({ limit: '20kb' }));
  app.use('/api', rateLimit({
    windowMs: 10 * 60 * 1000, limit: 300, standardHeaders: 'draft-8', legacyHeaders: false,
  }));

  app.get('/health', (_req, res) => res.json({ success: true }));
  app.get('/', (_req, res) => res.json({ name: 'Butterbear', api: '/api/v1' }));

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/campgrounds', campgroundRoutes);
  app.use('/api/v1/favorites', favoriteRoutes);
  app.use('/api/v1/bookings', bookingRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
