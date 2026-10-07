export const roles = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Full organization administration',
  },
  {
    id: 'organization_leader',
    name: 'Organization Leader',
    description: 'Organization-wide management and reporting',
  },
  {
    id: 'department_leader',
    name: 'Department Leader',
    description: 'Department-scoped management',
  },
  {
    id: 'project_manager',
    name: 'Project Manager',
    description: 'Project and task coordination',
  },
  {
    id: 'senior_member',
    name: 'Senior Member',
    description: 'Advanced team contribution access',
  },
  {
    id: 'member',
    name: 'Member',
    description: 'Standard team access',
  },
  {
    id: 'intern',
    name: 'Intern',
    description: 'Limited team access',
  },
  {
    id: 'contractor',
    name: 'Contractor',
    description: 'Assigned project and document access',
  },
  {
    id: 'guest',
    name: 'Guest',
    description: 'Read-only external access',
  },
];

export const roleIds = Object.fromEntries(roles.map((role) => [role.id, role]));
