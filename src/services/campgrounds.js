import { Campground } from '../models.js';
import { ApiError, id } from '../validation.js';

export async function activeCampground(campgroundId) {
  const campground = await Campground.findOne({ _id: id(campgroundId), active: true });
  if (!campground) throw new ApiError(404, 'Campground not found');
  return campground;
}
