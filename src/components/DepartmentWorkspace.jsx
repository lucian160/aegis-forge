import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from './Button';
import DepartmentMetric from './DepartmentMetric';
import { useAuth } from '../hooks/useAuth';
import { hasPermission } from '../data/permissions';
import { getDepartments, getProjects, getTasks } from '../services/domainsApi';
import { departmentWorkspaceDefinitions } from '../data/departmentWorkspaces';

function normalizeProject(project) {
  return {
    ...project,
    owner: project.owner?.name || project.owner || 'Unassigned',
    department: project.department?.name || project.department || 'Unknown department',
  };
}

function normalizeTask(task) {
  return {
    ...task,
    project: task.project?.name || task.project || 'Unassigned project',
    assignee: task.assignee?.name || task.assignee || 'Unassigned',
    department: task.department?.name || task.department || 'Unknown department',
    labels: task.labels || [],
    dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date',
  };
}

function countByStatus(items, status) {
  return items.filter((item) => item.status === status).length;
}

function fallbackRecords(definition) {
  const records = {
    'ui-ux': [
      { name: 'Design System v2', status: 'Review', progress: 86, owner: 'Nora Wilson' },
      { name: 'Customer Portal', status: 'In Design', progress: 68, owner: 'Maya Patel' },
      { name: 'Mobile Onboarding', status: 'Draft', progress: 42, owner: 'Owen Reed' },
    ],
    web: [
      { name: 'Authentication API', status: 'Code Review', progress: 78, owner: 'Ethan Cole' },
      { name: 'Dashboard Performance', status: 'QA', progress: 64, owner: 'Maya Patel' },
      { name: 'Release Automation', status: 'Ready for Release', progress: 92, owner: 'Priya Shah' },
    ],
    mobile: [
      { name: 'Offline Sync', status: 'Testing', progress: 71, owner: 'Maya Patel' },
      { name: 'Navigation Refresh', status: 'In Development', progress: 53, owner: 'Owen Reed' },
      { name: 'Release Candidate', status: 'Build Ready', progress: 87, owner: 'Ethan Cole' },
    ],
    hardware: [
      { name: 'Sensor Enclosure', status: 'Testing', progress: 58, owner: 'Owen Reed' },
      { name: 'Power Management', status: 'Prototype', progress: 36, owner: 'Sara Lin' },
      { name: 'Component Validation', status: 'Validated', progress: 100, owner: 'Liam Stone' },
    ],
    qa: [
      { name: 'Authentication Regression', status: 'Passed', progress: 100, owner: 'Liam Stone' },
      { name: 'Mobile Navigation', status: 'Failed', progress: 44, owner: 'Priya Shah' },
      { name: 'Release Readiness', status: 'Testing', progress: 61, owner: 'Ethan Cole' },
    ],
    devops: [
      { name: 'Deployment Workflow', status: 'Healthy', progress: 100, owner: 'Priya Shah' },
      { name: 'Backup Verification', status: 'Maintenance', progress: 72, owner: 'Ethan Cole' },
      { name: 'Incident Response', status: 'Monitoring', progress: 88, owner: 'Maya Patel' },
    ],
    research: [
      { name: 'Research Portfolio', status: 'Findings', progress: 81, owner: 'Sara Lin' },
      { name: 'Prototype Evaluation', status: 'Experimenting', progress: 57, owner: 'Owen Reed' },
      { name: 'Technical Investigation', status: 'Investigating', progress: 39, owner: 'Alex Kim' },
    ],
    product: [
      { name: 'Customer Portal', status: 'In Progress', progress: 68, owner: 'Alex Kim' },
      { name: 'Release Milestone', status: 'Review', progress: 84, owner: 'Nora Wilson' },
      { name: 'Product Roadmap', status: 'Prioritized', progress: 46, owner: 'Elena Rossi' },
    ],
    marketing: [
      { name: 'Product Launch Campaign', status: 'Scheduled', progress: 72, owner: 'Jon Bell' },
      { name: 'Community Announcement', status: 'Review', progress: 55, owner: 'Elena Rossi' },
      { name: 'Brand Resource Library', status: 'Published', progress: 100, owner: 'Nora Wilson' },
    ],
    business: [
      { name: 'Northstar Client Project', status: 'Qualified', progress: 62, owner: 'Elena Rossi' },
      { name: 'Enterprise Proposal', status: 'Negotiation', progress: 47, owner: 'Alex Kim' },
      { name: 'Partner Opportunity', status: 'Lead', progress: 18, owner: 'Jon Bell' },
    ],
  };
  return records[definition.id] || [];
}

export default function DepartmentWorkspace() {
  const { departmentId } = useParams();
  const { user } = useAuth();
  const definition = departmentWorkspaceDefinitions[departmentId];
  const canManage = Boolean(definition && user && hasPermission(user.roleId, 'manage', 'projects'));
  const [department, setDepartment] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!definition) return undefined;
    let active = true;
    setLoading(true);
    setError('');
    setStatusFilter('All');
    setSearch('');

    Promise.all([getDepartments(), getProjects(), getTasks()])
      .then(([departmentResponse, projectResponse, taskResponse]) => {
        if (!active) return;
        const liveDepartment = departmentResponse.departments?.find((item) => item.id === departmentId || item.code.toLowerCase() === definition.code.toLowerCase() || item.name.toLowerCase() === definition.name.toLowerCase());
        const liveProjects = (projectResponse.projects || []).map(normalizeProject).filter((project) => project.department === liveDepartment?.name || !liveDepartment);
        const liveTasks = (taskResponse.tasks || []).map(normalizeTask).filter((task) => task.department === liveDepartment?.name || !liveDepartment);
        setDepartment(liveDepartment || { id: definition.id, name: definition.name, code: definition.code, lead: definition.lead, members: definition.members, description: definition.description });
        setProjects(liveProjects.length ? liveProjects : fallbackRecords(definition));
        setTasks(liveTasks.length ? liveTasks : fallbackRecords(definition).map((project, index) => ({ id: `${definition.id}-task-${index + 1}`, title: `${project.name} work`, project: project.name, assignee: definition.lead, department: definition.name, priority: index === 0 ? 'High' : 'Medium', status: definition.statuses[Math.min(index + 1, definition.statuses.length - 1)], dueDate: 'No due date', labels: [] })));
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message);
          setDepartment({ id: definition.id, name: definition.name, code: definition.code, lead: definition.lead, members: definition.members, description: definition.description });
          setProjects(fallbackRecords(definition));
          setTasks(fallbackRecords(definition).map((project, index) => ({ id: `${definition.id}-task-${index + 1}`, title: `${project.name} work`, project: project.name, assignee: definition.lead, department: definition.name, priority: index === 0 ? 'High' : 'Medium', status: definition.statuses[Math.min(index + 1, definition.statuses.length - 1)], dueDate: 'No due date', labels: [] })));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [definition, departmentId]);

  const visibleTasks = useMemo(() => tasks.filter((task) => {
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesSearch = !search || `${task.title} ${task.project} ${task.assignee}`.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  }), [search, statusFilter, tasks]);

  const statusOptions = useMemo(() => ['All', ...new Set(tasks.map((task) => task.status))], [tasks]);
  const activeCount = tasks.filter((task) => !['Done', 'Released', 'Approved', 'Archived'].includes(task.status)).length;
  const completedCount = tasks.filter((task) => ['Done', 'Released', 'Approved', 'Archived'].includes(task.status)).length;

  if (!definition) {
    return <section className="empty-state"><div><span className="empty-state-icon">D</span><h3>Department workspace not found</h3><p>The requested department is not available.</p><Link to="/departments"><Button variant="primary">Back to departments</Button></Link></div></section>;
  }

  const metrics = [
    { label: definition.metrics[0].label, value: projects.length, detail: definition.metrics[0].detail },
    { label: definition.metrics[1].label, value: countByStatus(tasks, definition.statuses[2]) || tasks.length, detail: definition.metrics[1].detail },
    { label: definition.metrics[2].label, value: activeCount, detail: definition.metrics[2].detail },
    { label: definition.metrics[3].label, value: completedCount, detail: definition.metrics[3].detail },
  ];

  return (
    <>
      <header className="page-header department-workspace-header">
        <div><p className="eyebrow">Department workspace</p><h1>{definition.name}</h1><p>{definition.description}</p></div>
        <div className="department-header-actions"><span className="department-code">{definition.code}</span>{canManage && <Button variant="primary" icon="plus">New work item</Button>}</div>
      </header>

      {error && <p className="auth-error" role="alert">Unable to load live workspace data: {error}. Showing the existing department fallback.</p>}
      {loading ? <div className="auth-loading">Loading {definition.name} workspace…</div> : (
        <>
          <section className="department-metrics" aria-label={`${definition.name} overview`}>
            {metrics.map((metric) => <DepartmentMetric key={metric.label} {...metric} tone={metric.label.includes('Open') ? 'accent' : 'neutral'} />)}
          </section>

          <section className="department-workspace-grid">
            <article className="card workspace-primary-card">
              <div className="card-header"><div><p className="eyebrow">Delivery</p><h2>Current work</h2></div><span>{projects.length} projects</span></div>
              <div className="card-body department-project-list">
                {projects.map((project) => (
                  <div className="department-project" key={project.id}>
                    <div><strong>{project.name}</strong><span>{project.owner} · {project.status}</span></div>
                    <div className="department-progress"><span>{project.progress}%</span><div className="progress-track"><span style={{ width: `${project.progress}%` }} /></div></div>
                  </div>
                ))}
              </div>
            </article>

            <aside className="department-workspace-sidebar">
              <article className="card">
                <div className="card-header"><h2>Department operations</h2></div>
                <div className="card-body department-operation-list">
                  {definition.capabilities.map((capability) => <div key={capability.title}><span>{capability.title}</span><strong>{capability.value}</strong></div>)}
                </div>
              </article>
              <article className="card">
                <div className="card-header"><h2>Team</h2><span>{department.members} members</span></div>
                <div className="card-body department-team-summary"><span className="avatar">{department.lead.split(' ').map((part) => part[0]).join('')}</span><div><strong>{department.lead}</strong><span>Department lead</span></div></div>
              </article>
            </aside>
          </section>

          <section className="card department-workflow-card">
            <div className="card-header workspace-card-header"><div><p className="eyebrow">Workflow</p><h2>{definition.name} task board</h2></div><div className="workspace-filters"><label className="search-field"><span className="sr-only">Search tasks</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search work" /></label><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter tasks by status"><option value="All">All statuses</option>{statusOptions.filter((status) => status !== 'All').map((status) => <option key={status}>{status}</option>)}</select></div></div>
            <div className="card-body department-workflow-body">
              <div className="workflow-status-list">
                {definition.statuses.map((status) => { const count = countByStatus(tasks, status); return <div className="workflow-status" key={status}><span>{status}</span><strong>{count}</strong></div>; })}
              </div>
              <div className="workflow-task-list">
                {visibleTasks.length ? visibleTasks.map((task) => <article className="workflow-task" key={task.id}><div><span className={`status ${task.status.toLowerCase().replaceAll(' ', '-')}`}>{task.status}</span><strong>{task.title}</strong><small>{task.project} · {task.assignee}</small></div><div><span className="priority priority-medium">{task.priority}</span><small>{task.dueDate}</small></div></article>) : <div className="empty-state compact"><h3>No matching work</h3><p>Try another status or search term.</p></div>}
              </div>
            </div>
          </section>

          <section className="card department-resources-card">
            <div className="card-header"><div><p className="eyebrow">Resources</p><h2>Department references</h2></div><span>{definition.resources.length} records</span></div>
            <div className="card-body department-resource-list">{definition.resources.map((resource) => <div key={resource.name}><span className="resource-type">{resource.type}</span><strong>{resource.name}</strong><span className={`status ${resource.status.toLowerCase().replaceAll(' ', '-')}`}>{resource.status}</span></div>)}</div>
          </section>
        </>
      )}
    </>
  );
}
