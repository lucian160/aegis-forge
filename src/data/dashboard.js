export const departmentSummary = [
  { name: 'UI/UX', members: 12, activeProjects: 6, lead: 'Nora Wilson', workload: 78 },
  { name: 'Web', members: 18, activeProjects: 9, lead: 'Ethan Cole', workload: 91 },
  { name: 'Mobile', members: 7, activeProjects: 3, lead: 'Maya Patel', workload: 64 },
  { name: 'Hardware', members: 5, activeProjects: 2, lead: 'Owen Reed', workload: 52 },
  { name: 'QA', members: 9, activeProjects: 4, lead: 'Liam Stone', workload: 72 },
  { name: 'DevOps', members: 6, activeProjects: 1, lead: 'Priya Shah', workload: 61 },
  { name: 'R&D', members: 8, activeProjects: 5, lead: 'Sara Lin', workload: 84 },
  { name: 'Product', members: 10, activeProjects: 7, lead: 'Alex Kim', workload: 86 },
  { name: 'Marketing', members: 6, activeProjects: 3, lead: 'Jon Bell', workload: 69 },
  { name: 'Business', members: 4, activeProjects: 2, lead: 'Elena Rossi', workload: 58 },
];

export const projects = [
  { name: 'Atlas Customer Portal', department: 'Web', progress: 72, deadline: 'Sep 18', status: 'Active', lead: 'Ethan Cole' },
  { name: 'Mobile Onboarding', department: 'Mobile', progress: 48, deadline: 'Sep 24', status: 'Active', lead: 'Maya Patel' },
  { name: 'Design System v2', department: 'UI/UX', progress: 86, deadline: 'Sep 12', status: 'Review', lead: 'Nora Wilson' },
  { name: 'Infrastructure Migration', department: 'DevOps', progress: 54, deadline: 'Oct 03', status: 'Blocked', lead: 'Priya Shah' },
];

export const alerts = [
  { title: 'API migration', detail: 'Three tasks are blocked', severity: 'warning' },
  { title: 'Review queue', detail: '7 items awaiting review', severity: 'info' },
  { title: 'Release readiness', detail: 'Mobile release is at risk', severity: 'danger' },
];

export const activity = [
  { author: 'Sarah Chen', action: 'completed', target: 'Landing Page UI', time: '12 min ago' },
  { author: 'Daniel Brooks', action: 'moved', target: 'API Integration', detail: 'to Review', time: '38 min ago' },
  { author: 'Maya Patel', action: 'joined', target: 'Web Development', time: '1 hr ago' },
  { author: 'Alex Kim', action: 'published', target: 'Product roadmap update', time: '2 hrs ago' },
];
