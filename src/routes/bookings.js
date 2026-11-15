import express from 'express';
import { getBookings, getBookingNotifications, getBooking, createBooking, updateBooking, deleteBooking } from '../controllers/bookings.js';
import { asyncRoute, auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, asyncRoute(getBookings));
router.get('/:id/notifications', auth, asyncRoute(getBookingNotifications));
router.get('/:id', auth, asyncRoute(getBooking));
router.post('/', auth, asyncRoute(createBooking));
router.patch('/:id', auth, asyncRoute(updateBooking));
router.delete('/:id', auth, asyncRoute(deleteBooking));

export default router;
