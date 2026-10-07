import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  code: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, maxlength: 500, default: '' },
  resource: { type: String, required: true, trim: true },
  action: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Permission', permissionSchema);
