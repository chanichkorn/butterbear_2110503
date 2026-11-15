import express from 'express';
import { getCampgrounds, getCampgroundWeather, getCampground, createCampground, updateCampground, deleteCampground } from '../controllers/campgrounds.js';
import { asyncRoute, auth, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', asyncRoute(getCampgrounds));
router.get('/:id/weather', asyncRoute(getCampgroundWeather));
router.get('/:id', asyncRoute(getCampground));
router.post('/', auth, admin, asyncRoute(createCampground));
router.put('/:id', auth, admin, asyncRoute(updateCampground));
router.delete('/:id', auth, admin, asyncRoute(deleteCampground));

export default router;
