import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    roleId: { type: String, required: true, enum: ['super_admin', 'organization_leader', 'department_leader', 'project_manager', 'senior_member', 'member', 'intern', 'contractor', 'guest'], default: 'member' },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null, index: true },
    privacyConsent: { type: Boolean, default: false },
    privacyConsentAt: { type: Date },
    privacyPolicyVersion: { type: String, maxlength: 20 },
    isActive: { type: Boolean, default: true, index: true },
    isVerified: { type: Boolean, default: false, index: true },
    refreshTokenHash: { type: String, select: false },
    verificationTokenHash: { type: String, select: false, index: true, sparse: true },
    verificationExpiresAt: { type: Date, select: false },
    passwordResetTokenHash: { type: String, select: false, index: true, sparse: true },
    passwordResetExpiresAt: { type: Date, select: false },
    lastLoginAt: { type: Date },
    invitationTokenHash: { type: String, select: false },
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);
