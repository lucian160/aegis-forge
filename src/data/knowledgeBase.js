export const knowledgeCategories = [
  { name: 'All knowledge', count: 10 },
  { name: 'Engineering', count: 3 },
  { name: 'Product', count: 2 },
  { name: 'Design', count: 2 },
  { name: 'Operations', count: 2 },
  { name: 'Research', count: 1 },
];

export const knowledgeArticles = [
  { id: 'kb-1', title: 'Engineering delivery checklist', category: 'Engineering', department: 'Web Development', owner: 'Ethan Cole', updated: '12 min ago', readTime: '6 min read', featured: true, description: 'The shared checklist for planning, implementation, review, testing, and release readiness.', tags: ['Delivery', 'Engineering'] },
  { id: 'kb-2', title: 'Working with the design system', category: 'Design', department: 'UI/UX', owner: 'Nora Wilson', updated: '1 hr ago', readTime: '8 min read', featured: true, description: 'Guidelines for using tokens, components, accessibility rules, and release conventions.', tags: ['Design system', 'UI'] },
  { id: 'kb-3', title: 'Staging deployment and rollback', category: 'Operations', department: 'DevOps / Infrastructure', owner: 'Priya Shah', updated: '3 hrs ago', readTime: '7 min read', featured: false, description: 'Operational steps for validating changes and safely rolling back staging deployments.', tags: ['Deployment', 'Operations'] },
  { id: 'kb-4', title: 'Customer journey discovery', category: 'Product', department: 'Product / Project Management', owner: 'Daniel Brooks', updated: 'Yesterday', readTime: '5 min read', featured: false, description: 'A practical framework for turning research signals into product opportunities.', tags: ['Research', 'Product'] },
  { id: 'kb-5', title: 'API integration conventions', category: 'Engineering', department: 'Web Development', owner: 'Ethan Cole', updated: 'Yesterday', readTime: '10 min read', featured: false, description: 'Naming, error handling, versioning, and testing conventions for internal APIs.', tags: ['API', 'Engineering'] },
  { id: 'kb-6', title: 'Mobile release quality gates', category: 'Engineering', department: 'Mobile Development', owner: 'Maya Patel', updated: '2 days ago', readTime: '4 min read', featured: false, description: 'Required quality checks before an iOS or Android release can be approved.', tags: ['Mobile', 'QA'] },
  { id: 'kb-7', title: 'Team review etiquette', category: 'Product', department: 'Organization', owner: 'Alex Kim', updated: '3 days ago', readTime: '5 min read', featured: false, description: 'Shared expectations for review comments, ownership, and constructive feedback.', tags: ['Team', 'Review'] },
  { id: 'kb-8', title: 'Research repository navigation', category: 'Research', department: 'Product / Project Management', owner: 'Daniel Brooks', updated: '4 days ago', readTime: '3 min read', featured: false, description: 'How research documents are organized, linked, and kept current.', tags: ['Research', 'Knowledge'] },
  { id: 'kb-9', title: 'Testing strategy for interfaces', category: 'Engineering', department: 'QA / Testing', owner: 'Liam Stone', updated: '5 days ago', readTime: '8 min read', featured: false, description: 'A layered approach to regression, integration, accessibility, and release testing.', tags: ['Testing', 'QA'] },
  { id: 'kb-10', title: 'Design critique format', category: 'Design', department: 'UI/UX', owner: 'Nora Wilson', updated: '1 week ago', readTime: '6 min read', featured: false, description: 'A consistent structure for design critiques and actionable feedback.', tags: ['Design', 'Review'] },
];

export const articleSections = [
  { title: 'Purpose', body: 'This knowledge article is the shared operating guide for the relevant team. It centralizes the current workflow, common decisions, and the information contributors should provide.' },
  { title: 'Core workflow', body: 'Start with the intended outcome, gather the required context, assign an owner, complete the work, and record any follow-up decisions. Review the article before starting a related task to avoid duplicating existing guidance.' },
  { title: 'Owner and review', body: 'The article owner is responsible for keeping the content current. Changes that affect the workflow should be reflected in the article and linked from the related project or task.' },
];
