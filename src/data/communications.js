export const organizationAnnouncements = [
  {
    id: 'org-1',
    title: 'Quarterly roadmap review',
    summary: 'The roadmap review will cover delivery priorities, staffing changes, and the next release checkpoint.',
    author: 'Alex Kim',
    audience: ['organization_leader', 'super_admin', 'department_leader', 'project_manager'],
    category: 'Announcement',
    time: '12 min ago',
  },
  {
    id: 'org-2',
    title: 'Design system freeze',
    summary: 'Please avoid breaking shared tokens until the launch checklist is complete for the portal refresh.',
    author: 'Nora Wilson',
    audience: ['organization_leader', 'super_admin', 'department_leader', 'project_manager', 'senior_member', 'member'],
    category: 'Announcement',
    time: '1 hr ago',
  },
];

export const departmentAnnouncements = [
  {
    id: 'dept-1',
    title: 'Web team review window',
    summary: 'Frontend review requests are queued for 2:00 PM and should be submitted before the intake cutoff.',
    department: 'Web Development',
    audience: ['organization_leader', 'super_admin', 'department_leader', 'project_manager', 'senior_member', 'member'],
    author: 'Ethan Cole',
    time: '35 min ago',
  },
  {
    id: 'dept-2',
    title: 'Mobile QA sign-off',
    summary: 'The release readiness checklist is open for the onboarding flow and requires stakeholder sign-off.',
    department: 'Mobile Development',
    audience: ['organization_leader', 'super_admin', 'department_leader', 'project_manager', 'senior_member'],
    author: 'Maya Patel',
    time: '2 hrs ago',
  },
];

export const notifications = [
  {
    id: 'notif-1',
    title: 'Task assigned: Finalize API contract',
    detail: 'Ethan Cole assigned you to the Atlas API handoff workstream.',
    category: 'Task assigned',
    read: false,
    time: '2 min ago',
    audience: ['organization_leader', 'super_admin', 'project_manager', 'senior_member', 'member'],
  },
  {
    id: 'notif-2',
    title: 'Mention from Alex',
    detail: 'Alex mentioned you in the roadmap review thread and asked for a launch signal.',
    category: 'Mention',
    read: false,
    time: '18 min ago',
    audience: ['organization_leader', 'super_admin', 'department_leader', 'project_manager', 'member'],
  },
  {
    id: 'notif-3',
    title: 'Design review requested',
    detail: 'Nora requested a final pass on the customer portal onboarding screens.',
    category: 'Review request',
    read: true,
    time: '42 min ago',
    audience: ['organization_leader', 'super_admin', 'department_leader', 'project_manager', 'senior_member', 'member'],
  },
  {
    id: 'notif-4',
    title: 'Project update: Infrastructure migration',
    detail: 'The migration is still blocked by the staging rollback window.',
    category: 'Project update',
    read: true,
    time: '1 hr ago',
    audience: ['organization_leader', 'super_admin', 'department_leader', 'project_manager', 'member'],
  },
  {
    id: 'notif-5',
    title: 'Announcement published',
    detail: 'The roadmap review notes have been posted to the organization board.',
    category: 'Announcement',
    read: false,
    time: '3 hrs ago',
    audience: ['organization_leader', 'super_admin', 'department_leader', 'project_manager', 'senior_member', 'member'],
  },
];

export const activityFeed = [
  { id: 'activity-1', actor: 'Maya Patel', action: 'joined project', target: 'Mobile Onboarding', detail: 'Brought in the release QA checklist.', time: '14 min ago' },
  { id: 'activity-2', actor: 'Ethan Cole', action: 'assigned task', target: 'Finalize API contract', detail: 'Assigned to the web release squad.', time: '31 min ago' },
  { id: 'activity-3', actor: 'Nora Wilson', action: 'requested review', target: 'Design System v2', detail: 'Requested a design critique from product and engineering.', time: '53 min ago' },
  { id: 'activity-4', actor: 'Alex Kim', action: 'published announcement', target: 'Quarterly roadmap review', detail: 'Updated the roadmap priorities for Q4.', time: '2 hrs ago' },
  { id: 'activity-5', actor: 'Priya Shah', action: 'completed task', target: 'Staging rollback validation', detail: 'Infrastructure checks passed for the migration branch.', time: '3 hrs ago' },
];

export const inboxMessages = [
  {
    id: 'msg-1',
    from: 'Nora Wilson',
    subject: 'Design review requested',
    preview: 'Please review the onboarding screens before the launch briefing this afternoon.',
    unread: true,
    time: '9:41 AM',
    category: 'Review request',
    audience: ['organization_leader', 'super_admin', 'department_leader', 'project_manager', 'senior_member', 'member'],
  },
  {
    id: 'msg-2',
    from: 'Alex Kim',
    subject: 'Roadmap follow-up',
    preview: 'Could you validate the staffing plan for the Atlas portal milestone?',
    unread: false,
    time: 'Yesterday',
    category: 'Mention',
    audience: ['organization_leader', 'super_admin', 'project_manager'],
  },
  {
    id: 'msg-3',
    from: 'Priya Shah',
    subject: 'Deployment risk update',
    preview: 'We are ready to proceed after the staging check, but we still need the rollback window confirmation.',
    unread: true,
    time: 'Mon',
    category: 'Project update',
    audience: ['organization_leader', 'super_admin', 'department_leader', 'project_manager', 'member'],
  },
];

export function canViewForRole(roleId, audience = []) {
  if (!roleId) return false;
  return audience.includes(roleId) || audience.includes('all');
}
