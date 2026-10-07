import mongoose from 'mongoose';

const recruitmentApplicationSchema = new mongoose.Schema({
  candidateName: { type: String, required: true, trim: true, maxlength: 160 },
  candidateEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
  candidatePhone: { type: String, maxlength: 30 },
  portfolioUrl: { type: String, maxlength: 500 },
  linkedInUrl: { type: String, maxlength: 500 },
  position: { type: String, required: true, trim: true, maxlength: 160 },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
  resumeKey: { type: String, default: '' },
  privacyConsent: { type: Boolean, required: true },
  privacyConsentAt: { type: Date, required: true },
  privacyPolicyVersion: { type: String, required: true, maxlength: 20 },
  status: { type: String, enum: ['Draft', 'Submitted', 'Under Review', 'Interviewing', 'Accepted', 'Rejected', 'Withdrawn'], default: 'Draft', index: true },
  notes: { type: String, maxlength: 5000, default: '' },
  submittedAt: { type: Date },
}, { timestamps: true });

recruitmentApplicationSchema.index({ department: 1, status: 1, submittedAt: -1 });

export default mongoose.model('RecruitmentApplication', recruitmentApplicationSchema);
