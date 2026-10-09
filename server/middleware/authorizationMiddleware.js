import mongoose from 'mongoose';
import { roleIds } from '../../src/data/roles.js';
import { canAssignUserDepartment, canManageUserRoleTransition, getAssignableUserRoles, hasPermission as hasSharedPermission } from '../../src/data/permissions.js';

const manageRoles = new Set([
  'super_admin',
  'organization_leader',
  'department_leader',
  'project_manager',
]);

export function requirePermission(scope, action = 'view') {
  return (request, response, next) => {
    const roleId = request.user?.roleId;
    const allowed = roleIds[roleId];
    if (!allowed || !hasPermission(roleId, action, scope)) {
      return response.status(403).json({ error: `You do not have permission to ${action} ${scope}.` });
    }
    next();
  };
}

export function requireUserManagementPermission(request, response, next) {
  if (hasPermission(request.user?.roleId, 'manage', 'users')) return next();

  import('../services/auditService.js').then(({ recordAudit }) => recordAudit({
    actorId: request.user?.id,
    action: 'role_change_denied',
    targetType: 'user',
    targetId: request.params.id,
    result: 'failure',
    details: 'User management permission denied',
    department: request.user?.departmentId,
    ipAddress: request.ip,
    userAgent: request.get('user-agent'),
  })).catch(() => {}).finally(() => {
    response.status(403).json({ error: 'You do not have permission to manage users.' });
  });
}

export function hasPermission(roleId, action, scope) {
  if (scope === 'users') return hasSharedPermission(roleId, action, scope);
  const definitions = {
    departments: { view: ['super_admin', 'organization_leader', 'department_leader'], manage: ['super_admin', 'organization_leader', 'department_leader'] },
    projects: { view: ['super_admin', 'organization_leader', 'department_leader', 'project_manager', 'senior_member', 'member', 'intern', 'contractor'], manage: ['super_admin', 'organization_leader', 'department_leader', 'project_manager'] },
    tasks: { view: ['super_admin', 'organization_leader', 'department_leader', 'project_manager', 'senior_member', 'member', 'intern', 'contractor'], manage: ['super_admin', 'organization_leader', 'department_leader', 'project_manager'] },
    comments: { view: ['super_admin', 'organization_leader', 'department_leader', 'project_manager', 'senior_member', 'member', 'intern', 'contractor'], manage: ['super_admin', 'organization_leader', 'department_leader', 'project_manager', 'senior_member', 'member'] },
    announcements: { view: ['super_admin', 'organization_leader', 'department_leader', 'project_manager', 'senior_member', 'member', 'intern', 'contractor', 'guest'], manage: ['super_admin', 'organization_leader', 'department_leader', 'project_manager'] },
    notifications: { view: ['super_admin', 'organization_leader', 'department_leader', 'project_manager', 'senior_member', 'member', 'intern', 'contractor', 'guest'], manage: ['super_admin', 'organization_leader', 'department_leader', 'project_manager', 'senior_member', 'member'] },
    activities: { view: ['super_admin', 'organization_leader', 'department_leader'], manage: ['super_admin', 'organization_leader'] },
    documents: { view: ['super_admin', 'organization_leader', 'department_leader', 'project_manager', 'senior_member', 'member', 'intern', 'contractor'], manage: ['super_admin', 'organization_leader', 'department_leader', 'project_manager'] },
    knowledge: { view: ['super_admin', 'organization_leader', 'department_leader', 'project_manager', 'senior_member', 'member', 'intern', 'contractor', 'guest'], manage: ['super_admin', 'organization_leader', 'department_leader', 'project_manager'] },
    research: { view: ['super_admin', 'organization_leader', 'department_leader', 'project_manager', 'senior_member', 'member', 'intern', 'contractor'], manage: ['super_admin', 'organization_leader', 'department_leader', 'project_manager'] },
    applications: { view: ['super_admin', 'organization_leader', 'department_leader'], manage: ['super_admin', 'organization_leader', 'department_leader'] },
    meetings: { view: ['super_admin', 'organization_leader', 'department_leader', 'project_manager', 'senior_member', 'member', 'intern', 'contractor'], manage: ['super_admin', 'organization_leader', 'department_leader', 'project_manager'] },
    roles: { view: ['super_admin', 'organization_leader'], manage: ['super_admin'] },
    permissions: { view: ['super_admin', 'organization_leader'], manage: ['super_admin'] },
  };
  return definitions[scope]?.[action]?.includes(roleId) || false;
}

export { canAssignUserDepartment, canManageUserRoleTransition, getAssignableUserRoles };

export function canManageResource(request, document) {
  if (!document) return false;
  if (manageRoles.has(request.user?.roleId)) return true;
  const owner = document.owner || document.author || document.uploadedBy || document.organizer || document.user;
  return owner?.toString() === request.user?.id;
}

export function filterByDepartment(query, request) {
  if (request.user?.roleId === 'super_admin' || request.user?.roleId === 'organization_leader') return query;
  const departmentId = request.user?.departmentId;
  if (!departmentId) return { ...query, department: new mongoose.Types.ObjectId() };
  return { ...query, department: departmentId };
}
