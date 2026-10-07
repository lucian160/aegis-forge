import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, maxlength: 5000, default: '' },
  category: { type: String, enum: ['Policy', 'Guide', 'Research', 'Project', 'Meeting'], required: true, index: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', index: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  storageKey: { type: String, required: true, unique: true },
  filename: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['Draft', 'Approved', 'Rejected', 'Archived'], default: 'Draft', index: true },
  tags: [{ type: String, trim: true }],
}, { timestamps: true });

export default mongoose.model('Document', documentSchema);
