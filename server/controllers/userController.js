import User from '../models/User.js';
import Department from '../models/Department.js';
import mongoose from 'mongoose';
import { recordAudit } from '../services/auditService.js';
import { roleIds } from '../../src/data/roles.js';
import { canAssignUserDepartment, canManageUserRoleTransition, getAssignableUserRoles } from '../middleware/authorizationMiddleware.js';

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roleId: user.roleId,
    departmentId: user.departmentId,
    isActive: user.isActive,
    isVerified: user.isVerified,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

export async function listUsers(request, response) {
  if (request.user.roleId === 'department_leader' && !request.user.departmentId) return response.json({ users: [] });
  const query = ['super_admin', 'organization_leader'].includes(request.user.roleId) ? {} : { departmentId: request.user.departmentId };
  const users = await User.find(query).sort({ name: 1 }).select('-passwordHash -refreshTokenHash -invitationTokenHash');
  response.json({ users: users.map(sanitizeUser) });
}

export async function getUser(request, response) {
  const user = await User.findById(request.params.id).select('-passwordHash -refreshTokenHash -invitationTokenHash');
  if (!user) return response.status(404).json({ error: 'User not found.' });
  if (request.user.roleId === 'department_leader' && !request.user.departmentId) return response.status(404).json({ error: 'User not found.' });
  if (!['super_admin', 'organization_leader'].includes(request.user.roleId) && user.departmentId?.toString() !== request.user.departmentId?.toString()) {
    return response.status(404).json({ error: 'User not found.' });
  }
  response.json({ user: sanitizeUser(user) });
}

async function recordDeniedRoleChange(request, target, details) {
  await recordAudit({
    actorId: request.user.id,
    action: 'role_change_denied',
    targetType: 'user',
    targetId: target?.id,
    result: 'failure',
    details,
    department: target?.departmentId || request.user.departmentId,
    ipAddress: request.ip,
    userAgent: request.get('user-agent'),
  }).catch(() => {});
}

function forbidden(response, message = 'You do not have permission to manage this user.') {
  return response.status(403).json({ error: message });
}

export async function updateUser(request, response) {
  const body = request.body && typeof request.body === 'object' && !Array.isArray(request.body) ? request.body : {};
  const actor = request.user;
  const actorRole = actor.roleId;
  const hasRoleField = Object.hasOwn(body, 'roleId') || Object.hasOwn(body, 'role');
  const nextRoleId = Object.hasOwn(body, 'roleId') ? body.roleId : body.role;
  const hasDepartmentField = Object.hasOwn(body, 'departmentId');
  const hasAuthChange = hasRoleField || hasDepartmentField || body.isActive !== undefined || body.isVerified !== undefined;
  const user = await User.findById(request.params.id);
  if (!user) return response.status(404).json({ error: 'User not found.' });

  const actorDepartmentId = actor.departmentId?.toString();
  const currentDepartmentId = user.departmentId?.toString();
  if (user.id === actor.id && hasAuthChange) {
    await recordDeniedRoleChange(request, user, 'Self-service authorization change denied');
    return forbidden(response, 'You cannot modify your own authorization state.');
  }

  if (actorRole === 'department_leader' && (!actorDepartmentId || currentDepartmentId !== actorDepartmentId)) {
    await recordDeniedRoleChange(request, user, 'Cross-department user management denied');
    return forbidden(response);
  }

  if (actorRole === 'organization_leader' && user.roleId === 'super_admin') {
    await recordDeniedRoleChange(request, user, 'Organization Leader attempted to change Super Admin');
    return forbidden(response);
  }
  if (actorRole === 'department_leader' && getAssignableUserRoles(actorRole, user.roleId).length === 0) {
    await recordDeniedRoleChange(request, user, 'Department Leader attempted to manage an out-of-scope role');
    return forbidden(response);
  }

  if (hasRoleField && (typeof nextRoleId !== 'string' || !roleIds[nextRoleId])) {
    return response.status(400).json({ error: 'The requested role is invalid.' });
  }
  if (hasRoleField && !canManageUserRoleTransition(actorRole, user.roleId, nextRoleId)) {
    await recordDeniedRoleChange(request, user, `Role transition denied: ${user.roleId} to ${nextRoleId}`);
    return forbidden(response, 'You do not have permission to make this role change.');
  }

  if (body.isActive !== undefined && actorRole !== 'super_admin') return forbidden(response, 'Only Super Admin can change account status.');
  if (body.isVerified !== undefined && actorRole !== 'super_admin') return forbidden(response, 'Only Super Admin can change verification status.');
  if (body.isActive !== undefined && typeof body.isActive !== 'boolean') return response.status(400).json({ error: 'Account status must be a boolean.' });
  if (body.isVerified !== undefined && typeof body.isVerified !== 'boolean') return response.status(400).json({ error: 'Verification status must be a boolean.' });

  let nextDepartmentId = user.departmentId || null;
  if (hasDepartmentField) {
    const rawDepartmentId = body.departmentId;
    if (rawDepartmentId !== null && rawDepartmentId !== '' && (typeof rawDepartmentId !== 'string' || !mongoose.isValidObjectId(rawDepartmentId))) {
      return response.status(400).json({ error: 'Department identifier is invalid.' });
    }
    nextDepartmentId = rawDepartmentId === null || rawDepartmentId === '' ? null : new mongoose.Types.ObjectId(rawDepartmentId);
    if (!canAssignUserDepartment(actorRole, actor.departmentId, nextDepartmentId)) {
      await recordDeniedRoleChange(request, user, 'Department assignment outside authorized scope denied');
      return forbidden(response, 'You do not have permission to assign this department.');
    }
    if (nextDepartmentId && !await Department.exists({ _id: nextDepartmentId })) {
      return response.status(404).json({ error: 'Department not found.' });
    }
  }

  const resolvedRoleId = hasRoleField ? nextRoleId : user.roleId;
  if (resolvedRoleId === 'department_leader' && !nextDepartmentId) {
    return response.status(400).json({ error: 'A department must be assigned before appointing a Department Leader.' });
  }

  const previousRoleId = user.roleId;
  const previousDepartmentId = user.departmentId || null;
  const roleChanged = hasRoleField && resolvedRoleId !== previousRoleId;
  const departmentChanged = hasDepartmentField && currentDepartmentId !== nextDepartmentId?.toString();
  const safeBody = {};
  if (typeof body.name === 'string') safeBody.name = body.name;
  if (hasRoleField) safeBody.roleId = resolvedRoleId;
  if (hasDepartmentField) safeBody.departmentId = nextDepartmentId;
  if (body.isActive !== undefined) safeBody.isActive = body.isActive;
  if (body.isVerified !== undefined) safeBody.isVerified = body.isVerified;
  Object.assign(user, safeBody);
  await user.save();

  if (departmentChanged) {
    if (previousDepartmentId) {
      await Department.updateOne({ _id: previousDepartmentId }, { $pull: { members: user._id } });
      await Department.updateOne({ _id: previousDepartmentId, lead: user._id }, { $unset: { lead: 1 } });
    }
    if (nextDepartmentId) await Department.updateOne({ _id: nextDepartmentId }, { $addToSet: { members: user._id } });
  }
  if (resolvedRoleId === 'department_leader' && nextDepartmentId && (roleChanged || departmentChanged)) {
    await Department.updateOne({ _id: nextDepartmentId }, { $set: { lead: user._id }, $addToSet: { members: user._id } });
  } else if (previousRoleId === 'department_leader' && roleChanged && previousDepartmentId) {
    await Department.updateOne({ _id: previousDepartmentId, lead: user._id }, { $unset: { lead: 1 } });
  }
  if (departmentChanged) {
    const scopeDepartment = nextDepartmentId || previousDepartmentId || actor.departmentId;
    await recordAudit({ actorId: actor.id, action: 'department_changed', targetType: 'user', targetId: user.id, result: 'success', department: scopeDepartment, details: `Department changed from ${previousDepartmentId || 'unassigned'} to ${nextDepartmentId || 'unassigned'}`, ipAddress: request.ip, userAgent: request.get('user-agent') });
  }
  if (roleChanged) {
    await recordAudit({ actorId: actor.id, action: 'role_changed', targetType: 'user', targetId: user.id, result: 'success', department: user.departmentId || previousDepartmentId || actor.departmentId, details: `Role changed from ${previousRoleId} to ${resolvedRoleId}`, ipAddress: request.ip, userAgent: request.get('user-agent') });
  }
  if (!roleChanged && !departmentChanged) {
    await recordAudit({ actorId: actor.id, action: 'user_updated', targetType: 'user', targetId: user.id, department: user.departmentId, details: `Updated user ${user.email}`, ipAddress: request.ip, userAgent: request.get('user-agent') });
  }
  response.json({ user: sanitizeUser(user) });
}
