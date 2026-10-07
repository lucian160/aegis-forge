import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from './Button';
import DepartmentMetric from './DepartmentMetric';
import { taskStatuses } from '../data/projects';
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

function recordId(value) {
  if (typeof value === 'string') return value;
  return value?.id || value?._id?.toString?.() || '';
}

export default function DepartmentWorkspace() {
  const { departmentId } = useParams();
  const [definition, setDefinition] = useState(null);
  const [department, setDepartment] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setStatusFilter('All');
    setSearch('');

    Promise.all([getDepartments(), getProjects(), getTasks()])
      .then(([departmentResponse, projectResponse, taskResponse]) => {
        if (!active) return;
        const liveDepartment = (departmentResponse.departments || []).find((item) => recordId(item) === departmentId);
        if (!liveDepartment) {
          setDepartment(null);
          setDefinition(null);
          setProjects([]);
          setTasks([]);
          setError('The requested department is not available.');
          return;
        }
        const workspaceDefinition = Object.values(departmentWorkspaceDefinitions)
          .find((item) => item.code === liveDepartment.code);
        if (!workspaceDefinition) {
          setDepartment(liveDepartment);
          setDefinition(null);
          setProjects([]);
          setTasks([]);
          setError('No workflow configuration is available for this department.');
          return;
        }
        const liveDepartmentId = recordId(liveDepartment);
        const liveProjects = (projectResponse.projects || [])
          .filter((project) => recordId(project.department) === liveDepartmentId)
          .map(normalizeProject);
        const liveTasks = (taskResponse.tasks || [])
          .filter((task) => recordId(task.department) === liveDepartmentId)
          .map(normalizeTask);
        setDepartment(liveDepartment);
        setDefinition(workspaceDefinition);
        setProjects(liveProjects);
        setTasks(liveTasks);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message);
          setDepartment(null);
          setDefinition(null);
          setProjects([]);
          setTasks([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [departmentId]);

  const visibleTasks = useMemo(() => tasks.filter((task) => {
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesSearch = !search || `${task.title} ${task.project} ${task.assignee}`.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  }), [search, statusFilter, tasks]);

  const statusOptions = ['All', ...taskStatuses];
  const activeCount = tasks.filter((task) => !['Done', 'Completed'].includes(task.status)).length;
  const completedCount = tasks.filter((task) => ['Done', 'Completed'].includes(task.status)).length;

  if (loading) return <div className="auth-loading">Loading department workspace…</div>;

  if (!definition) {
    return <section className="empty-state"><div><span className="empty-state-icon">D</span><h3>Department workspace unavailable</h3><p>{error || 'No workspace configuration is available for this department.'}</p><Link to="/departments"><Button variant="primary">Back to departments</Button></Link></div></section>;
  }

  const metrics = [
    { label: definition.metrics[0].label, value: projects.length, detail: definition.metrics[0].detail },
    { label: definition.metrics[1].label, value: activeCount, detail: definition.metrics[1].detail },
    { label: definition.metrics[2].label, value: completedCount, detail: definition.metrics[2].detail },
    { label: definition.metrics[3].label, value: tasks.length, detail: definition.metrics[3].detail },
  ];

  return (
    <>
      <header className="page-header department-workspace-header">
        <div><p className="eyebrow">Department workspace</p><h1>{department.name}</h1><p>{department.description || definition.description}</p></div>
        <div className="department-header-actions"><span className="department-code">{definition.code}</span></div>
      </header>

      {error && <p className="auth-error" role="alert">Unable to load live workspace data: {error}. No workspace records are available until the backend responds successfully.</p>}
      <>
          <section className="department-metrics" aria-label={`${definition.name} overview`}>
            {metrics.map((metric) => <DepartmentMetric key={metric.label} {...metric} tone={metric.label.includes('Open') ? 'accent' : 'neutral'} />)}
          </section>

          <section className="department-workspace-grid">
            <article className="card workspace-primary-card">
              <div className="card-header"><div><p className="eyebrow">Delivery</p><h2>Current work</h2></div><span>{projects.length} projects</span></div>
              <div className="card-body department-project-list">
                {projects.length ? projects.map((project) => (
                  <div className="department-project" key={project.id}>
                    <div><strong>{project.name}</strong><span>{project.owner} · {project.status}</span></div>
                    {Number.isFinite(project.progress) && <div className="department-progress"><span>{project.progress}%</span><div className="progress-track"><span style={{ width: `${project.progress}%` }} /></div></div>}
                  </div>
                )) : <p className="empty-state">No projects are available for this department.</p>}
              </div>
            </article>

            <aside className="department-workspace-sidebar">
              <article className="card">
                <div className="card-header"><h2>Department records</h2></div>
                <div className="card-body department-operation-list">
                  <div><span>Department code</span><strong>{department.code}</strong></div>
                  <div><span>Assigned members</span><strong>{Array.isArray(department.members) ? department.members.length : 'Unavailable'}</strong></div>
                  <div><span>Department status</span><strong>{department.status || 'Unavailable'}</strong></div>
                </div>
              </article>
            </aside>
          </section>

          <section className="card department-workflow-card">
            <div className="card-header workspace-card-header"><div><p className="eyebrow">Workflow</p><h2>{definition.name} task board</h2></div><div className="workspace-filters"><label className="search-field"><span className="sr-only">Search tasks</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search work" /></label><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter tasks by status"><option value="All">All statuses</option>{statusOptions.filter((status) => status !== 'All').map((status) => <option key={status}>{status}</option>)}</select></div></div>
            <div className="card-body department-workflow-body">
              <div className="workflow-status-list">
                {taskStatuses.map((status) => { const count = countByStatus(tasks, status); return <div className="workflow-status" key={status}><span>{status}</span><strong>{count}</strong></div>; })}
              </div>
              <div className="workflow-task-list">
                {visibleTasks.length ? visibleTasks.map((task) => <article className="workflow-task" key={task.id}><div><span className={`status ${task.status.toLowerCase().replaceAll(' ', '-')}`}>{task.status}</span><strong>{task.title}</strong><small>{task.project} · {task.assignee}</small></div><div><span className="priority priority-medium">{task.priority}</span><small>{task.dueDate}</small></div></article>) : <div className="empty-state compact"><h3>No matching work</h3><p>Try another status or search term.</p></div>}
              </div>
            </div>
          </section>
      </>
    </>
  );
}
