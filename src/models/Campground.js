import mongoose from 'mongoose';

const { Schema } = mongoose;

const campgroundSchema = new Schema({
  name: { type: String, required: true, maxlength: 150 },
  address: { type: String, required: true, maxlength: 500 },
  phone: { type: String, required: true, maxlength: 30 },
  latitude: { type: Number, required: true, min: -90, max: 90 },
  longitude: { type: Number, required: true, min: -180, max: 180 },
  timezone: { type: String, default: 'Asia/Bangkok' },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Campground', campgroundSchema);
