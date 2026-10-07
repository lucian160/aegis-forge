import mongoose from 'mongoose';
import Activity from '../models/Activity.js';

const allowedActions = new Set([
  'login',
  'login_failed',
  'logout',
  'session_refreshed',
  'session_revoked',
  'password_changed',
  'user_updated',
  'user_disabled',
  'user_enabled',
  'role_changed',
  'department_changed',
  'resource_created',
  'resource_updated',
  'resource_deleted',
  'settings_changed',
  'user_registered',
  'verification_email_requested',
  'email_verified',
  'email_verification_failed',
  'password_reset_requested',
  'password_reset',
  'password_reset_failed',
  'role_change_denied',
]);

function normalizeDepartmentId(value) {
  if (value === null || value === undefined || value === '') return undefined;
  if (value instanceof mongoose.Types.ObjectId) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    if (mongoose.isValidObjectId(trimmed)) return new mongoose.Types.ObjectId(trimmed);
  }
  return undefined;
}

export async function recordAudit({ actorId, action, targetType, targetId, department, result, details, ipAddress, userAgent }) {
  if (!allowedActions.has(action)) throw new Error(`Unsupported audit action: ${action}`);
  let normalizedDepartment = normalizeDepartmentId(department);
  if (department !== undefined && department !== null && department !== '' && !normalizedDepartment) {
    throw Object.assign(new Error('Department identifier is invalid.'), { status: 400 });
  }
  if (actorId) {
    const User = (await import('../models/User.js')).default;
    const actor = await User.findById(actorId).select('departmentId');
    if (department === undefined) {
      normalizedDepartment = normalizeDepartmentId(actor?.departmentId);
    }
  }
  return Activity.create({
    user: actorId,
    department: normalizedDepartment,
    action,
    targetType,
    targetId: targetId || undefined,
    details,
    result,
    ipAddress,
    userAgent,
  });
}

export function auditQueryForUser(user, query = {}) {
  if (user.roleId === 'super_admin' || user.roleId === 'organization_leader') return query;
  const normalizedDepartment = normalizeDepartmentId(user.departmentId);
  if (user.roleId === 'department_leader' && normalizedDepartment) return { ...query, department: normalizedDepartment };
  return null;
}

export async function findAuditEntries(query, limit = 50, user) {
  const authorizedQuery = auditQueryForUser(user, query);
  if (!authorizedQuery) return [];
  return Activity.find(authorizedQuery)
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(Number.parseInt(limit, 10) || 50, 1), 200))
    .populate('user', 'name email roleId');
}
