import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true, maxlength: 100 },
  phone: { type: String, required: true, maxlength: 30 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user', immutable: true },
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Campground' }],
}, { timestamps: true });
userSchema.set('toJSON', { transform: (_doc, result) => {
  delete result.password;
  delete result.__v;
  return result;
} });

export default mongoose.model('User', userSchema);
