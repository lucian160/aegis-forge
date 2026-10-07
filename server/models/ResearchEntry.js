import mongoose from 'mongoose';

const researchEntrySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  content: { type: String, required: true, maxlength: 20000 },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'ResearchProject', required: true, index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['Draft', 'Review', 'Approved', 'Archived'], default: 'Draft', index: true },
  references: [{ type: String, trim: true }],
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
}, { timestamps: true });

export default mongoose.model('ResearchEntry', researchEntrySchema);
