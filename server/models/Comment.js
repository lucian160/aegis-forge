import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true, maxlength: 5000, trim: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', index: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

commentSchema.index({ task: 1, createdAt: -1 });

export default mongoose.model('Comment', commentSchema);
