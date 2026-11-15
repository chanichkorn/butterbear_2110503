import { User, Booking } from '../models.js';
import { bookingOwner } from '../auth.js';
import { ApiError, text, id, bookingDates, pagination } from '../validation.js';
import { activeCampground } from '../services/campgrounds.js';
import { publicBooking, notifyInput } from '../services/bookings.js';

export const getBookings = async (req, res) => {
  const { skip, limit, page } = pagination(req.query);
  const filter = { ...bookingOwner(req), status: 'active' };
  const [data, total] = await Promise.all([
    Booking.find(filter).populate('campground').sort({ checkIn: 1, _id: 1 }).skip(skip).limit(limit),
    Booking.countDocuments(filter),
  ]);
  res.json({ success: true, count: data.length, total, page, data });
};

export const getBookingNotifications = async (req, res) => {
  const booking = await Booking.findOne({ _id: id(req.params.id), ...bookingOwner(req) }).select('+notifications');
  if (!booking) throw new ApiError(404, 'Booking not found');
  const data = booking.notifications.map(job => ({
    id: job._id, type: job.type, revision: job.revision,
    status: job.type === 'reminder' && (job.revision !== booking.revision || booking.status === 'cancelled')
      && job.status === 'pending' ? 'superseded' : job.status,
    scheduledAt: job.scheduledAt, sentAt: job.sentAt, attempts: job.attempts,
    previewUrl: job.previewUrl, lastError: job.lastError,
  }));
  res.json({ success: true, data });
};

export const getBooking = async (req, res) => {
  const data = await Booking.findOne({ _id: id(req.params.id), ...bookingOwner(req), status: 'active' }).populate('campground');
  if (!data) throw new ApiError(404, 'Booking not found');
  res.json({ success: true, data });
};

export const createBooking = async (req, res) => {
  const campground = await activeCampground(req.body.campground);
  const dates = bookingDates(req.body.checkIn, req.body.checkOut, campground.timezone);
  const input = {
    user: req.user._id, campground: campground._id,
    checkIn: req.body.checkIn, checkOut: req.body.checkOut,
    checkInAt: dates.checkInAt,
    specialRequest: text(req.body.specialRequest ?? '', 'specialRequest', 2000, { required: false }),
  };
  // The booking and its email jobs persist together in one atomic document write.
  const data = await Booking.create({
    ...input, notifications: notifyInput(input, campground, dates, 'confirmation', 1, req.user.email),
  });
  res.status(201).json({ success: true, emailStatus: 'queued', data: publicBooking(data) });
};

export const updateBooking = async (req, res) => {
  const filter = { _id: id(req.params.id), ...bookingOwner(req), status: 'active' };
  const current = await Booking.findOne(filter);
  if (!current) throw new ApiError(404, 'Booking not found');
  if (current.checkInAt <= new Date()) throw new ApiError(409, 'Booking has already started');
  const campground = await activeCampground(req.body.campground ?? String(current.campground));
  const dates = bookingDates(req.body.checkIn ?? current.checkIn, req.body.checkOut ?? current.checkOut, campground.timezone);
  const input = {
    campground: campground._id,
    checkIn: req.body.checkIn ?? current.checkIn,
    checkOut: req.body.checkOut ?? current.checkOut,
    checkInAt: dates.checkInAt,
    specialRequest: text(req.body.specialRequest ?? current.specialRequest, 'specialRequest', 2000, { required: false }),
  };
  const owner = await User.findById(current.user);
  const revision = current.revision + 1;
  const data = await Booking.findOneAndUpdate({ ...filter, revision: current.revision }, {
    $set: { ...input, revision },
    $push: { notifications: { $each: notifyInput(input, campground, dates, 'update', revision, owner.email) } },
  }, { new: true, runValidators: true });
  if (!data) throw new ApiError(409, 'Booking changed. Please reload and retry.');
  res.json({ success: true, emailStatus: 'queued', data: publicBooking(data) });
};

export const deleteBooking = async (req, res) => {
  const data = await Booking.findOneAndUpdate({
    _id: id(req.params.id), ...bookingOwner(req), status: 'active',
  }, { $set: { status: 'cancelled' }, $inc: { revision: 1 } }, { new: true });
  if (!data) throw new ApiError(404, 'Booking not found');
  res.json({ success: true, message: 'Booking cancelled' });
};
