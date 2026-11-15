import { User } from '../models.js';
import { id } from '../validation.js';
import { activeCampground } from '../services/campgrounds.js';

export const getFavorites = async (req, res) => {
  const user = await User.findById(req.user._id).populate({ path: 'favorites', match: { active: true } });
  res.json({ success: true, count: user.favorites.length, data: user.favorites });
};

export const addFavorite = async (req, res) => {
  const campground = await activeCampground(req.params.campgroundId);
  await User.updateOne({ _id: req.user._id }, { $addToSet: { favorites: campground._id } });
  res.json({ success: true, message: 'Campground added to favorites' });
};

export const removeFavorite = async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $pull: { favorites: id(req.params.campgroundId) } });
  res.json({ success: true, message: 'Campground removed from favorites' });
};
