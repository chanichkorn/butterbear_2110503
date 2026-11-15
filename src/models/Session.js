import mongoose from 'mongoose';

const { Schema } = mongoose;

const sessionSchema = new Schema({
  _id: String,
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true, expires: 0 },
});

export default mongoose.model('Session', sessionSchema);
