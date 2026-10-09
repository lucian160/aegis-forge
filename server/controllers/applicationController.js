import RecruitmentApplication from '../models/RecruitmentApplication.js';
import Department from '../models/Department.js';
import User from '../models/User.js';
import { positions } from '../../src/data/recruitment.js';
import { requirePrivacyConsent } from '../services/privacyConsent.js';
import { createNotificationsForUsers } from '../services/notificationService.js';

function invalidApplication() {
  return Object.assign(new Error('Please check your application details and try again.'), { status: 400 });
}

export async function submitApplication(request, response) {
  const consent = requirePrivacyConsent(request.body?.privacyConsent);
  const { name, email, phone, portfolio, linkedin, message, positionId, applicationType, departmentCode } = request.body || {};
  const isTalentNetwork = applicationType === 'talent';
  if ([name, email, message].some((value) => typeof value !== 'string')
    || (isTalentNetwork ? (typeof departmentCode !== 'string' || positionId !== undefined) : typeof positionId !== 'string')
    || (applicationType !== undefined && applicationType !== 'talent' && applicationType !== 'position')) {
    throw invalidApplication();
  }

  const normalized = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: typeof phone === 'string' ? phone.trim() : '',
    portfolio: typeof portfolio === 'string' ? portfolio.trim() : '',
    linkedin: typeof linkedin === 'string' ? linkedin.trim() : '',
    message: message.trim(),
  };
  const position = isTalentNetwork ? null : positions.find((item) => item.id === positionId);
  if ((!isTalentNetwork && !position) || !normalized.name || normalized.name.length > 160
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email) || normalized.email.length > 254
    || normalized.phone.length > 30 || normalized.portfolio.length > 500 || normalized.linkedin.length > 500
    || !normalized.message || normalized.message.length > 5000) {
    throw invalidApplication();
  }

  const department = await Department.findOne({
    code: isTalentNetwork ? departmentCode.trim().toUpperCase() : position.departmentCode,
    isActive: true,
  }).select('_id');
  if (!department) {
    if (isTalentNetwork) throw invalidApplication();
    throw Object.assign(new Error('Applications for this team are not available right now.'), { status: 503 });
  }

  const application = await RecruitmentApplication.create({
    candidateName: normalized.name,
    candidateEmail: normalized.email,
    candidatePhone: normalized.phone,
    portfolioUrl: normalized.portfolio,
    linkedInUrl: normalized.linkedin,
    position: position?.title || 'Talent Network',
    department: department._id,
    notes: normalized.message,
    status: 'Submitted',
    submittedAt: new Date(),
    ...consent,
  });

  const staffRecipients = await User.find({
    isActive: true,
    $or: [
      { roleId: 'super_admin' },
      { roleId: 'organization_leader' },
      { roleId: 'department_leader', departmentId: department._id },
    ],
  }).select('_id email');

  await createNotificationsForUsers({
    userIds: staffRecipients.map((user) => user._id.toString()),
    departmentId: department._id.toString(),
    type: 'recruitment',
    title: 'Recruitment application received',
    message: `${normalized.name} submitted a ${position?.title || 'talent network'} application for ${department.code}.`,
    related: application._id,
    emailByUser: Object.fromEntries(staffRecipients.filter((user) => user.email).map((user) => [user._id.toString(), {
      to: user.email,
      subject: 'AEGIS FORGE recruitment application received',
      text: `${normalized.name} submitted a ${position?.title || 'talent network'} application for ${department.code}.`,
    }])),
  });

  response.status(201).json({ applicationId: application.id, message: 'Your application was submitted successfully.' });
}