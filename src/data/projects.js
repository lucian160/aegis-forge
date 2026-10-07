export const projectStatuses = ['Planning', 'Active', 'On Hold', 'Blocked', 'Review', 'Completed', 'Archived'];
export const projectPriorities = ['Low', 'Medium', 'High', 'Critical'];
export const taskStatuses = ['Backlog', 'Todo', 'In Progress', 'Review', 'Blocked', 'Done'];

export const projects = [
  {
    id: 'project-atlas',
    name: 'Atlas Customer Portal',
    description: 'Customer-facing portal for account management and support workflows.',
    owner: 'Ethan Cole',
    department: 'Web Development',
    members: ['Ethan Cole', 'Maya Patel', 'Sarah Chen'],
    status: 'Active',
    priority: 'High',
    startDate: '2026-07-15',
    deadline: '2026-09-18',
    progress: 72,
  },
  {
    id: 'project-mobile',
    name: 'Mobile Onboarding',
    description: 'A streamlined onboarding flow for new mobile application users.',
    owner: 'Maya Patel',
    department: 'Mobile Development',
    members: ['Maya Patel', 'Daniel Brooks', 'Priya Shah'],
    status: 'Active',
    priority: 'Critical',
    startDate: '2026-08-01',
    deadline: '2026-09-24',
    progress: 48,
  },
  {
    id: 'project-design',
    name: 'Design System v2',
    description: 'A consolidated design language for product teams and platform experiences.',
    owner: 'Nora Wilson',
    department: 'UI/UX',
    members: ['Nora Wilson', 'Sarah Chen', 'Jon Bell'],
    status: 'Review',
    priority: 'High',
    startDate: '2026-06-10',
    deadline: '2026-09-12',
    progress: 86,
  },
  {
    id: 'project-infra',
    name: 'Infrastructure Migration',
    description: 'Migration of production infrastructure to the new cloud platform.',
    owner: 'Priya Shah',
    department: 'DevOps / Infrastructure',
    members: ['Priya Shah', 'Liam Stone', 'Owen Reed'],
    status: 'Blocked',
    priority: 'Critical',
    startDate: '2026-07-01',
    deadline: '2026-10-03',
    progress: 54,
  },
];

export const tasks = [
  { id: 'task-1', title: 'Finalize API contract', project: 'Atlas Customer Portal', assignee: 'Ethan Cole', department: 'Web Development', priority: 'High', status: 'In Progress', dueDate: '2026-09-10', labels: ['API', 'Backend'] },
  { id: 'task-2', title: 'Review onboarding wireframes', project: 'Mobile Onboarding', assignee: 'Maya Patel', department: 'Mobile Development', priority: 'Medium', status: 'Review', dueDate: '2026-09-14', labels: ['UX', 'Mobile'] },
  { id: 'task-3', title: 'Add component accessibility', project: 'Design System v2', assignee: 'Sarah Chen', department: 'UI/UX', priority: 'High', status: 'Todo', dueDate: '2026-09-16', labels: ['Design', 'A11y'] },
  { id: 'task-4', title: 'Validate staging deployment', project: 'Infrastructure Migration', assignee: 'Priya Shah', department: 'DevOps / Infrastructure', priority: 'Critical', status: 'Blocked', dueDate: '2026-09-20', labels: ['Deployment', 'Infra'] },
  { id: 'task-5', title: 'Prepare release notes', project: 'Atlas Customer Portal', assignee: 'Daniel Brooks', department: 'Product / Project Management', priority: 'Low', status: 'Done', dueDate: '2026-09-05', labels: ['Release'] },
  { id: 'task-6', title: 'Run regression suite', project: 'Mobile Onboarding', assignee: 'Liam Stone', department: 'QA / Testing', priority: 'High', status: 'In Progress', dueDate: '2026-09-18', labels: ['QA', 'Mobile'] },
];
