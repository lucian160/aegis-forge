import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', index: true },
  action: { type: String, required: true, maxlength: 120 },
  targetType: { type: String, required: true, maxlength: 80 },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: String, maxlength: 2000, default: '' },
  result: { type: String, enum: ['success', 'failure'], default: 'success' },
  ipAddress: { type: String, maxlength: 45 },
  userAgent: { type: String, maxlength: 500 },
}, { timestamps: { createdAt: true, updatedAt: false } });

activitySchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
activitySchema.index({ action: 1, createdAt: 1 });
activitySchema.index({ department: 1, createdAt: -1 });

export default mongoose.model('Activity', activitySchema);
