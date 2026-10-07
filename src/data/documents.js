export const documentCategories = [
  { name: 'All documents', count: 12 },
  { name: 'Project', count: 4 },
  { name: 'Technical', count: 3 },
  { name: 'Design', count: 2 },
  { name: 'Meeting notes', count: 1 },
  { name: 'Research', count: 2 },
];

export const documents = [
  { id: 'doc-1', title: 'Atlas Customer Portal — Product Requirements', type: 'Product requirements', category: 'Project', department: 'Product / Project Management', owner: 'Alex Kim', status: 'Approved', updated: '18 min ago', shared: true, views: 42, description: 'The product requirements, scope boundaries, and acceptance criteria for the Atlas customer portal release.' },
  { id: 'doc-2', title: 'API Contract — Customer Portal', type: 'API documentation', category: 'Technical', department: 'Web Development', owner: 'Ethan Cole', status: 'Review', updated: '1 hr ago', shared: true, views: 31, description: 'Current endpoint contracts, request schemas, response models, and integration guidance for the portal API.' },
  { id: 'doc-3', title: 'Mobile Onboarding — UX Research', type: 'Design documentation', category: 'Design', department: 'Mobile Development', owner: 'Maya Patel', status: 'Published', updated: '3 hrs ago', shared: true, views: 27, description: 'Research synthesis and journey findings that shape the mobile onboarding experience.' },
  { id: 'doc-4', title: 'Q3 Roadmap Review Notes', type: 'Meeting notes', category: 'Meeting notes', department: 'Product / Project Management', owner: 'Alex Kim', status: 'Draft', updated: 'Yesterday', shared: true, views: 18, description: 'Decision log, open questions, and action items from the quarterly roadmap review.' },
  { id: 'doc-5', title: 'Design System v2 — Token Guidance', type: 'Design documentation', category: 'Design', department: 'UI/UX', owner: 'Nora Wilson', status: 'Published', updated: 'Yesterday', shared: true, views: 56, description: 'Core color, type, spacing, and interaction tokens for the next design system release.' },
  { id: 'doc-6', title: 'Infrastructure Migration Runbook', type: 'Deployment documentation', category: 'Technical', department: 'DevOps / Infrastructure', owner: 'Priya Shah', status: 'Approved', updated: '2 days ago', shared: true, views: 39, description: 'Operational steps for staging validation, rollback, monitoring, and production cutover.' },
  { id: 'doc-7', title: 'Team Guidelines — Delivery Rituals', type: 'Team guidelines', category: 'Project', department: 'Organization', owner: 'Alex Kim', status: 'Published', updated: '3 days ago', shared: true, views: 68, description: 'Shared delivery rituals, planning conventions, review expectations, and escalation guidance.' },
  { id: 'doc-8', title: 'Customer Portal Accessibility Audit', type: 'Technical documentation', category: 'Technical', department: 'QA / Testing', owner: 'Liam Stone', status: 'Review', updated: '4 days ago', shared: false, views: 24, description: 'Accessibility findings, remediation priorities, and verified behavior for the portal release.' },
  { id: 'doc-9', title: 'Developer Experience Assessment', type: 'Research documentation', category: 'Research', department: 'Web Development', owner: 'Ethan Cole', status: 'Completed', updated: '5 days ago', shared: true, views: 33, description: 'Findings from the developer workflow assessment and recommended toolchain improvements.' },
  { id: 'doc-10', title: 'Mobile Release Readiness Checklist', type: 'Project documentation', category: 'Project', department: 'Mobile Development', owner: 'Maya Patel', status: 'Approved', updated: '6 days ago', shared: true, views: 47, description: 'Release checklist covering quality gates, app-store readiness, and stakeholder sign-off.' },
  { id: 'doc-11', title: 'Research Operations Playbook', type: 'Research documentation', category: 'Research', department: 'Product / Project Management', owner: 'Daniel Brooks', status: 'Published', updated: '1 week ago', shared: true, views: 21, description: 'A practical guide for planning, conducting, synthesizing, and sharing product research.' },
  { id: 'doc-12', title: 'Atlas Portal Component Inventory', type: 'Project documentation', category: 'Project', department: 'UI/UX', owner: 'Nora Wilson', status: 'Draft', updated: '1 week ago', shared: false, views: 12, description: 'Inventory of shared portal components, ownership, dependencies, and planned migrations.' },
];

export const documentSections = [
  { title: 'Overview', body: 'The Atlas customer portal is intended to give internal teams a consistent workspace for project activity, account status, and delivery updates. This document defines the product scope, primary users, and release acceptance criteria.' },
  { title: 'Scope', body: 'The initial release includes project navigation, task visibility, team activity, and internal announcements. Reporting, advanced permissions, and notification preferences are planned for later releases.' },
  { title: 'Acceptance criteria', body: 'Users can access their assigned work, view department updates, search by project or task name, and receive role-appropriate notifications. All critical workflows must remain usable on desktop and mobile.' },
];
