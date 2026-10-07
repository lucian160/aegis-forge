export const departments = [
  { id: 'ui-ux', name: 'UI/UX', lead: 'Nora Wilson', members: 12, description: 'Design systems, research, and product experiences.' },
  { id: 'web', name: 'Web Development', lead: 'Ethan Cole', members: 18, description: 'Frontend, backend, APIs, and web platforms.' },
  { id: 'mobile', name: 'Mobile Development', lead: 'Maya Patel', members: 7, description: 'Android, iOS, and cross-platform products.' },
  { id: 'hardware', name: 'Hardware', lead: 'Owen Reed', members: 5, description: 'Electronics, prototyping, and testing.' },
  { id: 'qa', name: 'QA / Testing', lead: 'Liam Stone', members: 9, description: 'Manual, automated, and release validation.' },
  { id: 'devops', name: 'DevOps / Infrastructure', lead: 'Priya Shah', members: 6, description: 'Cloud, deployment, monitoring, and operations.' },
  { id: 'research', name: 'Research & Development', lead: 'Sara Lin', members: 8, description: 'Technical research, experiments, and prototypes.' },
  { id: 'product', name: 'Product / Project Management', lead: 'Alex Kim', members: 10, description: 'Roadmaps, requirements, and delivery coordination.' },
  { id: 'marketing', name: 'Marketing / Social Media', lead: 'Jon Bell', members: 6, description: 'Content, campaigns, community, and campaigns.' },
  { id: 'business', name: 'Business / Client Relations', lead: 'Elena Rossi', members: 4, description: 'Leads, clients, partnerships, and proposals.' },
];

export const departmentWorkspaces = {
  'ui-ux': {
    activeDesigns: 6,
    pendingReviews: 4,
    openTasks: 12,
    upcomingDeadlines: 3,
    designSystemUpdates: 2,
    feedback: 8,
    projects: [
      { name: 'Design System v2', progress: 86, status: 'Review' },
      { name: 'Customer Portal', progress: 68, status: 'Active' },
      { name: 'Mobile Onboarding', progress: 42, status: 'Active' },
    ],
  },
  web: {
    activeProjects: 9,
    assignedIssues: 18,
    pullRequests: 12,
    deploymentStatus: 'Healthy',
    bugs: 5,
    release: 'v2.4.0',
  },
  hardware: {
    activeProjects: 2,
    components: 14,
    prototypes: 5,
    testingStatus: 'In progress',
    experiments: 3,
  },
};
