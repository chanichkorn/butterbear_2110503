import express from 'express';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/favorites.js';
import { asyncRoute, auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, asyncRoute(getFavorites));
router.put('/:campgroundId', auth, asyncRoute(addFavorite));
router.delete('/:campgroundId', auth, asyncRoute(removeFavorite));

export default router;
