import { roles } from './roles';

export const organizationProfile = {
  name: 'AEGIS Forge',
  legalName: 'AEGIS Forge Operations, Inc.',
  industry: 'Internal team operations',
  timezone: 'America/Los_Angeles',
  language: 'English',
  website: 'aegisforge.internal',
};

export const departments = [
  { id: 'product', name: 'Product / Project Management', code: 'PRD', head: 'Alex Kim', members: 14, status: 'Active' },
  { id: 'web', name: 'Web Development', code: 'WEB', head: 'Ethan Cole', members: 18, status: 'Active' },
  { id: 'mobile', name: 'Mobile Development', code: 'MOB', head: 'Maya Patel', members: 7, status: 'Active' },
  { id: 'ui-ux', name: 'UI / UX', code: 'UX', head: 'Nora Wilson', members: 12, status: 'Active' },
  { id: 'qa', name: 'QA / Testing', code: 'QA', head: 'Liam Stone', members: 9, status: 'Active' },
  { id: 'devops', name: 'DevOps / Infrastructure', code: 'DEV', head: 'Priya Shah', members: 6, status: 'Active' },
];

export const members = [
  { id: 'm1', name: 'Alex Kim', email: 'alex@aegisforge.internal', roleId: 'organization_leader', departmentId: 'product', status: 'Active', joined: 'Jan 2024' },
  { id: 'm2', name: 'Ethan Cole', email: 'ethan@aegisforge.internal', roleId: 'senior_member', departmentId: 'web', status: 'Active', joined: 'Mar 2024' },
  { id: 'm3', name: 'Maya Patel', email: 'maya@aegisforge.internal', roleId: 'project_manager', departmentId: 'mobile', status: 'Active', joined: 'May 2024' },
  { id: 'm4', name: 'Nora Wilson', email: 'nora@aegisforge.internal', roleId: 'department_leader', departmentId: 'ui-ux', status: 'Active', joined: 'Jul 2024' },
  { id: 'm5', name: 'Priya Shah', email: 'priya@aegisforge.internal', roleId: 'department_leader', departmentId: 'devops', status: 'Active', joined: 'Sep 2024' },
  { id: 'm6', name: 'Liam Stone', email: 'liam@aegisforge.internal', roleId: 'member', departmentId: 'qa', status: 'Inactive', joined: 'Nov 2024' },
];

export const roleOptions = roles;

export const permissionRows = [
  ['Organization', 'View organization profile', 'Manage organization', 'organization'],
  ['Departments', 'View departments', 'Manage departments', 'departments'],
  ['Projects', 'View projects', 'Manage projects', 'projects'],
  ['Tasks', 'View tasks', 'Manage tasks', 'tasks'],
  ['Reports', 'View reports', 'Manage reports', 'reports'],
  ['Documents', 'View documents', 'Manage documents', 'documents'],
  ['Settings', 'View settings', 'Manage settings', 'settings'],
];
