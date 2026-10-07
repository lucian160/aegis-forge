import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  content: { type: String, required: true, maxlength: 5000, trim: true },
  audience: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['Draft', 'Scheduled', 'Published', 'Archived'], default: 'Draft', index: true },
  publishedAt: { type: Date },
  expiresAt: { type: Date },
}, { timestamps: true });

announcementSchema.index({ status: 1, publishedAt: -1 });

export default mongoose.model('Announcement', announcementSchema);
