import { publicDepartments } from './publicDepartments.js';

const descriptions = {
  'ui-ux': 'Design systems, research, product experiences, reviews, and delivery quality.',
  web: 'Frontend, backend, API work, code reviews, releases, and deployments.',
  mobile: 'Android, iOS, cross-platform products, builds, testing, and releases.',
  hardware: 'Components, prototypes, experiments, equipment, and physical validation.',
  qa: 'Test cases, bugs, regression testing, test runs, severity, and release readiness.',
  devops: 'Services, deployments, infrastructure, incidents, monitoring, backups, and environments.',
  research: 'Research projects, experiments, findings, investigations, notes, and references.',
  product: 'Roadmaps, requirements, prioritization, delivery, and stakeholder alignment.',
  marketing: 'Content, campaigns, publishing, community, and brand coordination.',
  business: 'Leads, clients, partnerships, proposals, and account relationships.',
};

export const departmentWorkspaceDefinitions = Object.fromEntries(
  publicDepartments.map((department) => [
    department.id,
    {
      ...department,
      name: department.id === 'qa' ? 'QA / Testing' : department.name,
      description: descriptions[department.id],
      metrics: [
        { key: 'projects', label: 'Projects', detail: 'Projects available to your account' },
        { key: 'openTasks', label: 'Open tasks', detail: 'Tasks not yet completed' },
        { key: 'completedTasks', label: 'Completed tasks', detail: 'Tasks marked complete' },
        { key: 'totalTasks', label: 'Total tasks', detail: 'Tasks available to your account' },
      ],
    },
  ]),
);
