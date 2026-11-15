import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getMe, logout } from '../controllers/auth.js';
import { asyncRoute, auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', asyncRoute(register));
router.post('/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 }), asyncRoute(login));
router.get('/me', auth, getMe);
router.post('/logout', auth, asyncRoute(logout));

export default router;
