import { DateTime } from 'luxon';
import { Campground, Booking } from '../models.js';
import { ApiError, campgroundInput, pagination } from '../validation.js';
import { activeCampground } from '../services/campgrounds.js';
import { getWeather } from '../services/weather.js';

export const getCampgrounds = async (req, res) => {
  const { skip, limit, page } = pagination(req.query);
  const [data, total] = await Promise.all([
    Campground.find({ active: true }).sort({ name: 1, _id: 1 }).skip(skip).limit(limit),
    Campground.countDocuments({ active: true }),
  ]);
  res.json({ success: true, count: data.length, total, page, data });
};

export const getCampgroundWeather = async (req, res) => {
  const campground = await activeCampground(req.params.id);
  const date = req.query.date ?? DateTime.now().setZone(campground.timezone).toISODate();
  res.json({ success: true, data: await getWeather(campground, date) });
};

export const getCampground = async (req, res) => {
  res.json({ success: true, data: await activeCampground(req.params.id) });
};

export const createCampground = async (req, res) => {
  const data = await Campground.create(campgroundInput(req.body));
  res.status(201).json({ success: true, data });
};

export const updateCampground = async (req, res) => {
  const current = await activeCampground(req.params.id);
  const data = await Campground.findOneAndUpdate({ _id: current._id, active: true },
    { $set: campgroundInput(req.body) }, { new: true, runValidators: true });
  if (!data) throw new ApiError(409, 'Campground changed. Please retry.');
  res.json({ success: true, data });
};

export const deleteCampground = async (req, res) => {
  const campground = await activeCampground(req.params.id);
  if (await Booking.exists({ campground: campground._id, status: 'active', checkInAt: { $gt: new Date() } })) {
    throw new ApiError(409, 'Campground has upcoming bookings');
  }
  await Campground.updateOne({ _id: campground._id }, { $set: { active: false } });
  res.json({ success: true });
};
