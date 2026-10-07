import mongoose from 'mongoose';

const researchProjectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, maxlength: 5000, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', index: true },
  status: { type: String, enum: ['Planning', 'Active', 'Paused', 'Completed', 'Archived'], default: 'Planning', index: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  deadline: { type: Date },
  tags: [{ type: String, trim: true }],
  entries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ResearchEntry' }],
}, { timestamps: true });

export default mongoose.model('ResearchProject', researchProjectSchema);
