import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, maxlength: 5000, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['Planning', 'Active', 'On Hold', 'Blocked', 'Review', 'Completed', 'Archived'], default: 'Planning', index: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium', index: true },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  startDate: { type: Date },
  deadline: { type: Date },
  tags: [{ type: String, trim: true }],
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

projectSchema.index({ owner: 1, status: 1 });

export default mongoose.model('Project', projectSchema);
