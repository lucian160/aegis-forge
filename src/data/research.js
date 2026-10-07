export const researchStatuses = ['Proposed', 'Planning', 'Active', 'Experimenting', 'Review', 'Completed', 'Archived'];

export const researchProjects = [
  { id: 'research-1', title: 'Portal onboarding reduction', department: 'Product / Project Management', owner: 'Daniel Brooks', status: 'Active', progress: 68, updated: '12 min ago', category: 'Customer research', findings: 8, references: 4, summary: 'Measure whether a shorter onboarding flow improves activation and reduces abandonment.' },
  { id: 'research-2', title: 'Developer workflow evaluation', department: 'Web Development', owner: 'Ethan Cole', status: 'Experimenting', progress: 44, updated: '1 hr ago', category: 'Internal operations', findings: 5, references: 3, summary: 'Compare the current developer workflow with a smaller set of focused delivery tools.' },
  { id: 'research-3', title: 'Design system adoption study', department: 'UI/UX', owner: 'Nora Wilson', status: 'Review', progress: 82, updated: 'Yesterday', category: 'Design research', findings: 11, references: 6, summary: 'Review adoption patterns, component usage, and contributor confidence across product teams.' },
  { id: 'research-4', title: 'Deployment reliability signals', department: 'DevOps / Infrastructure', owner: 'Priya Shah', status: 'Planning', progress: 26, updated: '2 days ago', category: 'Infrastructure research', findings: 3, references: 2, summary: 'Identify leading indicators for deployment risk before release cutover.' },
  { id: 'research-5', title: 'Mobile onboarding accessibility', department: 'Mobile Development', owner: 'Maya Patel', status: 'Completed', progress: 100, updated: '4 days ago', category: 'Accessibility research', findings: 7, references: 5, summary: 'Validate accessible navigation and assistive-technology behavior for mobile onboarding.' },
  { id: 'research-6', title: 'Team planning time study', department: 'Organization', owner: 'Alex Kim', status: 'Archived', progress: 100, updated: '1 week ago', category: 'Operations research', findings: 6, references: 3, summary: 'Archived analysis of planning cadence and decision-making latency.' },
];

export const experiments = [
  { id: 'experiment-1', name: 'Reduced onboarding steps', project: 'Portal onboarding reduction', owner: 'Daniel Brooks', status: 'Active', hypothesis: 'Fewer mandatory steps will improve first-session completion.', successMetric: 'Increase activation by 8%', start: 'Sep 12', end: 'Sep 26' },
  { id: 'experiment-2', name: 'Component review queue', project: 'Developer workflow evaluation', owner: 'Ethan Cole', status: 'Experimenting', hypothesis: 'A focused review queue will reduce review turnaround time.', successMetric: 'Reduce average review time by 20%', start: 'Sep 16', end: 'Oct 02' },
  { id: 'experiment-3', name: 'Token migration shadow mode', project: 'Design system adoption study', owner: 'Nora Wilson', status: 'Review', hypothesis: 'Shadow usage will reveal adoption friction without affecting production.', successMetric: 'Reach 80% usage confidence', start: 'Sep 18', end: 'Sep 30' },
];

export const researchNotes = [
  { id: 'note-1', title: 'Activation drop-off', project: 'Portal onboarding reduction', author: 'Daniel Brooks', updated: 'Today', type: 'Finding', summary: 'Users with an incomplete profile leave the flow before reaching the first project view.' },
  { id: 'note-2', title: 'Review ownership gaps', project: 'Developer workflow evaluation', author: 'Ethan Cole', updated: 'Yesterday', type: 'Finding', summary: 'Review requests can remain unowned when a change spans multiple teams.' },
  { id: 'note-3', title: 'Adoption signals', project: 'Design system adoption study', author: 'Nora Wilson', updated: '2 days ago', type: 'Finding', summary: 'Product teams use the component library more consistently when examples are linked to active work.' },
];

export const researchReferences = [
  { id: 'ref-1', title: 'Internal product research handbook', source: 'AEGIS Knowledge Base', type: 'Internal guide', updated: 'Aug 28' },
  { id: 'ref-2', title: 'Customer journey mapping', source: 'Research Operations', type: 'Methodology', updated: 'Aug 21' },
  { id: 'ref-3', title: 'Design system adoption report', source: 'UI/UX', type: 'Research report', updated: 'Sep 04' },
];
