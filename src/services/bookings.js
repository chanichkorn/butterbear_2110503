import { notificationJobs } from './mail.js';

export function publicBooking(booking) {
  const result = booking.toObject();
  delete result.notifications;
  delete result.__v;
  return result;
}

export function notifyInput(booking, campground, dates, type, revision, recipient) {
  return notificationJobs({
    type, revision, recipient,
    campground, checkIn: booking.checkIn, checkOut: booking.checkOut,
    specialRequest: booking.specialRequest,
    reminderAt: dates.reminderAt,
  });
}
