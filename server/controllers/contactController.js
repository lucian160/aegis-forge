import ContactMessage from '../models/ContactMessage.js';
import Department from '../models/Department.js';
import { config } from '../config/env.js';
import { contactNotificationTemplate } from '../services/emailTemplates.js';
import { sendTransactionalEmail } from '../services/emailService.js';
import { requirePrivacyConsent } from '../services/privacyConsent.js';
import { contactDepartmentPreferences, contactEnquiryTypes } from '../../shared/contactOptions.js';

function invalidContactRequest() {
  return Object.assign(new Error('Please check the contact form and try again.'), { status: 400 });
}

export async function submitContact(request, response) {
  const consent = requirePrivacyConsent(request.body?.privacyConsent);
  const {
    name, email, subject, departmentCode, message,
    organization = '', enquiryType = '', preferredDepartment = '', budgetTimeline = '',
  } = request.body || {};
  if ([name, email, subject, departmentCode, message].some((value) => typeof value !== 'string')) throw invalidContactRequest();
  if ([organization, enquiryType, preferredDepartment, budgetTimeline].some((value) => typeof value !== 'string')) throw invalidContactRequest();

  const normalized = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject.trim(),
    departmentCode: departmentCode.trim().toUpperCase(),
    message: message.trim(),
    organization: organization.trim(),
    enquiryType: enquiryType.trim(),
    preferredDepartment: preferredDepartment.trim(),
    budgetTimeline: budgetTimeline.trim(),
  };
  if (
    !normalized.name || normalized.name.length > 100 || /[\r\n]/.test(normalized.name)
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email) || normalized.email.length > 254
    || !normalized.subject || normalized.subject.length > 160 || /[\r\n]/.test(normalized.subject)
    || !normalized.message || normalized.message.length > 5000
    || normalized.organization.length > 150 || /[\r\n]/.test(normalized.organization)
    || (normalized.enquiryType && !contactEnquiryTypes.includes(normalized.enquiryType))
    || (normalized.enquiryType && normalized.subject !== normalized.enquiryType)
    || normalized.preferredDepartment.length > 80
    || (normalized.preferredDepartment && !contactDepartmentPreferences.includes(normalized.preferredDepartment))
    || normalized.budgetTimeline.length > 200 || /[\r\n]/.test(normalized.budgetTimeline)
  ) throw invalidContactRequest();

  const isGeneralInquiry = normalized.departmentCode === 'GENERAL';
  const department = isGeneralInquiry
    ? null
    : await Department.findOne({ code: normalized.departmentCode, isActive: true }).select('name code');
  if (!isGeneralInquiry && !department) throw invalidContactRequest();

  const recipient = isGeneralInquiry
    ? config.contactRecipients.general
    : config.contactRecipients[department.code];

  const contact = await ContactMessage.create({
    name: normalized.name,
    email: normalized.email,
    subject: normalized.subject,
    organization: normalized.organization,
    enquiryType: normalized.enquiryType,
    preferredDepartment: normalized.preferredDepartment,
    budgetTimeline: normalized.budgetTimeline,
    department: department?._id || null,
    isGeneralInquiry,
    message: normalized.message,
    ...consent,
    deliveryStatus: 'pending',
  });

  if (!recipient) {
    await ContactMessage.updateOne({ _id: contact._id }, { $set: { deliveryStatus: 'failed' } });
    throw Object.assign(new Error('Email recipient is not configured.'), {
      status: 503,
      publicCode: 'EMAIL_DELIVERY_UNAVAILABLE',
      publicMessage: isGeneralInquiry
        ? 'The general contact inbox is not available right now. Please try again later.'
        : 'The selected team cannot receive messages right now. Please try again later.',
    });
  }

  const template = contactNotificationTemplate({
    name: normalized.name,
    email: normalized.email,
    subject: normalized.subject,
    department: department?.name || 'General inquiry',
    organization: normalized.organization,
    enquiryType: normalized.enquiryType,
    preferredDepartment: normalized.preferredDepartment,
    budgetTimeline: normalized.budgetTimeline,
    message: normalized.message,
  });

  try {
    await sendTransactionalEmail({
      to: recipient,
      replyTo: normalized.email,
      subject: `[AEGIS FORGE] ${normalized.subject}`,
      ...template,
    });
    await ContactMessage.updateOne({ _id: contact._id }, { $set: { deliveryStatus: 'sent' } });
  } catch {
    await ContactMessage.updateOne({ _id: contact._id }, { $set: { deliveryStatus: 'failed' } });
    throw Object.assign(new Error('We could not deliver your message right now. Please try again later.'), {
      status: 503,
      publicCode: 'EMAIL_DELIVERY_UNAVAILABLE',
      publicMessage: 'We could not deliver your message right now. Please try again later.',
    });
  }

  response.status(201).json({
    message: isGeneralInquiry
      ? 'Your enquiry was sent to the general contact inbox.'
      : 'Your message was sent to the selected team.',
  });
}