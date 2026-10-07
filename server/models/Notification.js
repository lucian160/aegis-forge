import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true, enum: ['task', 'project', 'announcement', 'system', 'meeting'], index: true },
  title: { type: String, required: true, maxlength: 160 },
  message: { type: String, required: true, maxlength: 2000 },
  related: { type: mongoose.Schema.Types.ObjectId },
  read: { type: Boolean, default: false },
  scheduledFor: { type: Date },
}, { timestamps: true });

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
