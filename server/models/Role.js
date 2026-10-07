import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  code: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, maxlength: 500, default: '' },
  permissions: [{ type: String, trim: true }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Role', roleSchema);
