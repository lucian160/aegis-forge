import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
  subject: { type: String, required: true, trim: true, maxlength: 160 },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null, index: true },
  isGeneralInquiry: { type: Boolean, default: false },
  message: { type: String, required: true, trim: true, maxlength: 5000 },
  privacyConsent: { type: Boolean, required: true },
  privacyConsentAt: { type: Date, required: true },
  privacyPolicyVersion: { type: String, required: true, maxlength: 20 },
  deliveryStatus: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending', index: true },
}, { timestamps: true });

export default mongoose.model('ContactMessage', contactMessageSchema);