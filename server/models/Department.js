import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, maxlength: 1000, default: '' },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['Active', 'Paused', 'Archived'], default: 'Active' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Department', departmentSchema);
