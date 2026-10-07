import { roles } from './roles.js';

export const permissionDefinitions = {
  organization: {
    view: ['organization_leader', 'super_admin'],
    manage: ['super_admin', 'organization_leader'],
  },
  departments: {
    view: ['organization_leader', 'super_admin', 'department_leader'],
    manage: ['organization_leader', 'super_admin', 'department_leader'],
  },
  projects: {
    view: ['organization_leader', 'super_admin', 'department_leader', 'project_manager', 'senior_member', 'member', 'intern', 'contractor'],
    manage: ['organization_leader', 'super_admin', 'department_leader', 'project_manager'],
  },
  tasks: {
    view: ['organization_leader', 'super_admin', 'department_leader', 'project_manager', 'senior_member', 'member', 'intern', 'contractor'],
    manage: ['organization_leader', 'super_admin', 'department_leader', 'project_manager'],
  },
  reports: {
    view: ['organization_leader', 'super_admin', 'department_leader'],
  },
  activities: {
    view: ['organization_leader', 'super_admin', 'department_leader'],
    manage: ['organization_leader', 'super_admin'],
  },
  documents: {
    view: ['organization_leader', 'super_admin', 'department_leader', 'project_manager', 'senior_member', 'member', 'intern', 'contractor'],
    manage: ['organization_leader', 'super_admin', 'department_leader', 'project_manager'],
  },
  settings: {
    view: ['organization_leader', 'super_admin'],
    manage: ['super_admin', 'organization_leader'],
  },
  users: {
    view: ['super_admin', 'organization_leader', 'department_leader'],
    manage: ['super_admin', 'organization_leader', 'department_leader'],
  },
};

const departmentLeaderManagedRoles = ['senior_member', 'member', 'intern', 'contractor', 'guest'];
const organizationLeaderManagedRoles = ['department_leader', 'project_manager', ...departmentLeaderManagedRoles];
const allRoleIds = roles.map(({ id }) => id);

export const roleManagementPolicy = {
  super_admin: { targets: allRoleIds, assignable: allRoleIds },
  organization_leader: { targets: organizationLeaderManagedRoles, assignable: organizationLeaderManagedRoles },
  department_leader: { targets: departmentLeaderManagedRoles, assignable: departmentLeaderManagedRoles },
};

export function canManageUserRoleTransition(actorRoleId, currentRoleId, nextRoleId) {
  const policy = roleManagementPolicy[actorRoleId];
  return Boolean(policy?.targets.includes(currentRoleId) && policy.assignable.includes(nextRoleId));
}

export function getAssignableUserRoles(actorRoleId, currentRoleId) {
  const policy = roleManagementPolicy[actorRoleId];
  return policy?.targets.includes(currentRoleId) ? policy.assignable : [];
}

export function canAssignUserDepartment(actorRoleId, actorDepartmentId, targetDepartmentId) {
  if (actorRoleId === 'super_admin' || actorRoleId === 'organization_leader') return true;
  if (actorRoleId !== 'department_leader' || !actorDepartmentId) return false;
  return !targetDepartmentId || actorDepartmentId.toString() === targetDepartmentId.toString();
}

export function hasPermission(roleId, action, scope) {
  const definition = permissionDefinitions[scope];
  if (!definition || !definition[action]) return false;
  return definition[action].includes(roleId);
}

export function canAccessScope(roleId, scope) {
  return hasPermission(roleId, 'view', scope);
}
