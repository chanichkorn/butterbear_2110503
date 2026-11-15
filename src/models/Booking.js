import mongoose from 'mongoose';

const { Schema } = mongoose;

const notificationSchema = new Schema({
  type: { type: String, enum: ['confirmation', 'update', 'reminder'], required: true },
  revision: { type: Number, required: true },
  recipient: { type: String, required: true },
  snapshot: { type: Schema.Types.Mixed, required: true },
  scheduledAt: { type: Date, required: true },
  nextAttemptAt: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'sent', 'preview', 'failed', 'superseded'],
    default: 'pending',
  },
  attempts: { type: Number, default: 0 },
  claimToken: String,
  leaseUntil: Date,
  sentAt: Date,
  messageId: String,
  previewUrl: String,
  lastError: String,
});

const bookingSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
  campground: { type: Schema.Types.ObjectId, ref: 'Campground', required: true },
  checkIn: { type: String, required: true },
  checkOut: { type: String, required: true },
  checkInAt: { type: Date, required: true },
  specialRequest: { type: String, default: '', maxlength: 2000 },
  revision: { type: Number, default: 1 },
  status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
  notifications: { type: [notificationSchema], default: [], select: false },
}, { timestamps: true });
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ status: 1, 'notifications.nextAttemptAt': 1 });

export default mongoose.model('Booking', bookingSchema);
