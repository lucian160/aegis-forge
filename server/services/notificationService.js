import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendTransactionalEmail } from './emailService.js';

const allowedNotificationTypes = new Set([
  'task',
  'project',
  'announcement',
  'system',
  'meeting',
  'comment',
  'mention',
  'recruitment',
  'review',
  'security',
  'department',
  'role',
  'account',
  'document',
  'research',
  'membership',
]);

const priorityLevels = {
  low: 0,
  normal: 1,
  high: 2,
  critical: 3,
};

const defaultPriorityByType = {
  task: 'high',
  project: 'normal',
  comment: 'normal',
  mention: 'normal',
  announcement: 'high',
  review: 'high',
  meeting: 'high',
  recruitment: 'high',
  membership: 'high',
  document: 'normal',
  research: 'normal',
  security: 'critical',
  system: 'normal',
  department: 'normal',
  role: 'normal',
  account: 'critical',
};

function normalizeNotificationType(type) {
  const normalized = typeof type === 'string' ? type.toLowerCase() : '';
  return allowedNotificationTypes.has(normalized) ? normalized : 'system';
}

function normalizePriority(priority, type) {
  const normalized = typeof priority === 'string' ? priority.toLowerCase() : '';
  if (normalized in priorityLevels) return normalized;
  return defaultPriorityByType[normalizeNotificationType(type)] || 'normal';
}

function canSendAutomaticEmail({ priority, type, explicitEmail, userEmail, forceEmail }) {
  if (forceEmail === true) return true;
  if (forceEmail === false) return false;
  if (explicitEmail && userEmail) return true;
  if (explicitEmail === false) return false;
  if (!userEmail) return false;

  const normalizedType = normalizeNotificationType(type);
  const normalizedPriority = normalizePriority(priority, normalizedType);
  return priorityLevels[normalizedPriority] >= priorityLevels.high
    || ['security', 'meeting', 'recruitment', 'announcement', 'review', 'membership', 'task'].includes(normalizedType);
}

function buildDefaultEmail({ userEmail, title, message, type, priority }) {
  if (!userEmail) return null;

  const subject = String(title || 'AEGIS FORGE notification').slice(0, 120);
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2937;">
      <p style="font-size: 16px; margin: 0 0 12px;"><strong>${String(title || 'AEGIS FORGE notification').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</strong></p>
      <p style="margin: 0;">${String(message || '').replace(/\n/g, '<br />').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
      <p style="margin-top: 16px; font-size: 12px; color: #6b7280;">Type: ${String(type || 'system')} | Priority: ${String(priority || 'normal')}</p>
    </div>
  `;

  return {
    to: userEmail,
    subject,
    html,
    text: String(message || ''),
  };
}

export async function createNotification({
  userId,
  departmentId,
  type,
  title,
  message,
  related,
  metadata = {},
  priority,
  email,
  dedupeKey,
  sendEmail,
}) {
  if (!userId || !title || !message) return null;

  const normalizedType = normalizeNotificationType(type);
  const normalizedPriority = normalizePriority(priority, normalizedType);
  const notificationKey = dedupeKey || (related ? `${normalizedType}:${related.toString()}` : null);

  if (notificationKey) {
    const existingNotification = await Notification.findOne({
      user: userId,
      dedupeKey: notificationKey,
    }).lean();
    if (existingNotification) return existingNotification;
  }

  const user = await User.findById(userId).select('email');
  const resolvedTitle = String(title).slice(0, 160);
  const resolvedMessage = String(message).slice(0, 2000);
  const notification = await Notification.create({
    user: userId,
    department: departmentId || undefined,
    type: normalizedType,
    priority: normalizedPriority,
    title: resolvedTitle,
    message: resolvedMessage,
    related: related || undefined,
    metadata: metadata || {},
    dedupeKey: notificationKey || undefined,
  });

  const explicitEmail = email ?? null;
  const shouldSendEmail = canSendAutomaticEmail({
    priority: normalizedPriority,
    type: normalizedType,
    explicitEmail,
    userEmail: user?.email,
    forceEmail: sendEmail,
  });

  const destinationEmail = explicitEmail || (shouldSendEmail ? buildDefaultEmail({
    userEmail: user?.email,
    title: resolvedTitle,
    message: resolvedMessage,
    type: normalizedType,
    priority: normalizedPriority,
  }) : null);

  if (destinationEmail?.to) {
    try {
      await sendTransactionalEmail({
        to: destinationEmail.to,
        subject: destinationEmail.subject || resolvedTitle,
        html: destinationEmail.html || `<p>${resolvedMessage.replace(/\n/g, '<br />')}</p>`,
        text: destinationEmail.text || resolvedMessage,
        replyTo: destinationEmail.replyTo,
      });
      await Notification.updateOne({ _id: notification._id }, {
        $set: {
          emailSent: true,
          emailSentAt: new Date(),
        },
      });
    } catch (error) {
      console.error('[notifications] Email delivery failed for notification.', {
        notificationId: notification._id.toString(),
        userId: notification.user.toString(),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return notification;
}

export async function createNotificationsForUsers({
  userIds = [],
  departmentId,
  type,
  title,
  message,
  related,
  metadata = {},
  emailByUser = {},
  priority,
  dedupeKey,
}) {
  const userIdList = Array.isArray(userIds) ? userIds : [userIds];
  const uniqueUserIds = [...new Set(userIdList.filter(Boolean))];
  if (!uniqueUserIds.length) return [];

  const created = await Promise.all(uniqueUserIds.map(async (userId) => createNotification({
    userId,
    departmentId,
    type,
    title,
    message,
    related,
    metadata,
    email: emailByUser[userId] || null,
    priority,
    dedupeKey,
  })));

  return created.filter(Boolean);
}

export async function createDepartmentNotifications({
  departmentId,
  type,
  title,
  message,
  related,
  metadata = {},
  emailByUser = {},
  priority,
}) {
  if (!departmentId) return [];

  const users = await User.find({ departmentId, isActive: true }).select('_id email');
  return createNotificationsForUsers({
    userIds: users.map((user) => user._id.toString()),
    departmentId,
    type,
    title,
    message,
    related,
    metadata,
    emailByUser,
    priority,
  });
}

export async function createRoleNotifications({
  roleIds: roleIdList = [],
  type,
  title,
  message,
  related,
  metadata = {},
  emailByUser = {},
  priority,
}) {
  const normalizedRoleIdList = Array.isArray(roleIdList) ? roleIdList : [roleIdList];
  const roleIds = [...new Set(normalizedRoleIdList.filter(Boolean))];
  if (!roleIds.length) return [];

  const users = await User.find({ roleId: { $in: roleIds }, isActive: true }).select('_id email');
  return createNotificationsForUsers({
    userIds: users.map((user) => user._id.toString()),
    type,
    title,
    message,
    related,
    metadata,
    emailByUser,
    priority,
  });
}

export async function notifyUser({ userId, type, title, message, related, metadata = {}, departmentId, priority, email, dedupeKey, sendEmail }) {
  return createNotification({
    userId,
    departmentId,
    type,
    title,
    message,
    related,
    metadata,
    priority,
    email,
    dedupeKey,
    sendEmail,
  });
}

export async function notifyUsers({ userIds, type, title, message, related, metadata = {}, departmentId, priority, emailByUser = {}, dedupeKey }) {
  return createNotificationsForUsers({
    userIds,
    departmentId,
    type,
    title,
    message,
    related,
    metadata,
    emailByUser,
    priority,
    dedupeKey,
  });
}

export async function notifyDepartment({ departmentId, type, title, message, related, metadata = {}, emailByUser = {}, priority }) {
  return createDepartmentNotifications({
    departmentId,
    type,
    title,
    message,
    related,
    metadata,
    emailByUser,
    priority,
  });
}

export async function notifyOrganization({ roleIds, type, title, message, related, metadata = {}, emailByUser = {}, priority }) {
  return createRoleNotifications({
    roleIds,
    type,
    title,
    message,
    related,
    metadata,
    emailByUser,
    priority,
  });
}

export async function notifyTaskAssigned({ userId, taskName, dueDate, projectName, metadata = {} }) {
  return createNotification({
    userId,
    type: 'task',
    priority: 'high',
    title: 'Task assigned',
    message: `${taskName}${projectName ? ` for ${projectName}` : ''}${dueDate ? ` due ${new Date(dueDate).toLocaleDateString()}` : ''}.`,
    metadata,
  });
}

export async function notifyMention({ userId, authorName, context, metadata = {} }) {
  return createNotification({
    userId,
    type: 'mention',
    priority: 'normal',
    title: '@mention',
    message: `${authorName || 'Someone'} mentioned you in ${context || 'a discussion'}.`,
    metadata,
  });
}

export async function notifyProjectStatusChange({ userId, projectName, status, metadata = {} }) {
  return createNotification({
    userId,
    type: 'project',
    priority: 'normal',
    title: 'Project status changed',
    message: `${projectName || 'A project'} is now marked as ${status}.`,
    metadata,
  });
}

export async function notifyDepartmentAnnouncement({ departmentId, title, message, metadata = {} }) {
  return createDepartmentNotifications({
    departmentId,
    type: 'announcement',
    priority: 'high',
    title,
    message,
    metadata,
  });
}

export async function notifyRecruitmentStatus({ userId, status, roleName, metadata = {} }) {
  return createNotification({
    userId,
    type: 'recruitment',
    priority: 'high',
    title: 'Recruitment update',
    message: `Your ${roleName || 'application'} status is now ${status}.`,
    metadata,
  });
}

export async function notifySecurityEvent({ userId, title, message, metadata = {} }) {
  return createNotification({
    userId,
    type: 'security',
    priority: 'critical',
    title: title || 'Security update',
    message,
    metadata,
  });
}
