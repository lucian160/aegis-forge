import RecruitmentApplication from '../models/RecruitmentApplication.js';
import Department from '../models/Department.js';
import { positions } from '../../src/data/recruitment.js';
import { requirePrivacyConsent } from '../services/privacyConsent.js';

function invalidApplication() {
  return Object.assign(new Error('Please check your application details and try again.'), { status: 400 });
}

export async function submitApplication(request, response) {
  const consent = requirePrivacyConsent(request.body?.privacyConsent);
  const { name, email, phone, portfolio, linkedin, message, positionId } = request.body || {};
  if ([name, email, message, positionId].some((value) => typeof value !== 'string')) throw invalidApplication();

  const normalized = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: typeof phone === 'string' ? phone.trim() : '',
    portfolio: typeof portfolio === 'string' ? portfolio.trim() : '',
    linkedin: typeof linkedin === 'string' ? linkedin.trim() : '',
    message: message.trim(),
  };
  const position = positions.find((item) => item.id === positionId);
  if (!position || !normalized.name || normalized.name.length > 160
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email) || normalized.email.length > 254
    || normalized.phone.length > 30 || normalized.portfolio.length > 500 || normalized.linkedin.length > 500
    || !normalized.message || normalized.message.length > 5000) {
    throw invalidApplication();
  }

  const department = await Department.findOne({ code: position.departmentCode, isActive: true }).select('_id');
  if (!department) {
    throw Object.assign(new Error('Applications for this team are not available right now.'), { status: 503 });
  }

  const application = await RecruitmentApplication.create({
    candidateName: normalized.name,
    candidateEmail: normalized.email,
    candidatePhone: normalized.phone,
    portfolioUrl: normalized.portfolio,
    linkedInUrl: normalized.linkedin,
    position: position.title,
    department: department._id,
    notes: normalized.message,
    status: 'Submitted',
    submittedAt: new Date(),
    ...consent,
  });

  response.status(201).json({ applicationId: application.id, message: 'Your application was submitted successfully.' });
}