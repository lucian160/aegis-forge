import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, maxlength: 5000, default: '' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium', index: true },
  status: { type: String, enum: ['Backlog', 'Todo', 'In Progress', 'Review', 'Blocked', 'Done'], default: 'Todo', index: true },
  dueDate: { type: Date },
  labels: [{ type: String, trim: true }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
}, { timestamps: true });

taskSchema.index({ assignee: 1, status: 1 });

export default mongoose.model('Task', taskSchema);
