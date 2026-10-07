import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { hasPermission } from '../data/permissions';
import { getActivities, getDepartments, getNotifications, getProjects, getTasks } from '../services/domainsApi';
import { listUsers } from '../services/usersApi';
import AlertItem from '../components/AlertItem';
import Button from '../components/Button';
import ProjectSummary from '../components/ProjectSummary';
import StatCard from '../components/StatCard';

function formatActivityTime(value) {
  return value ? new Date(value).toLocaleString() : 'Time unavailable';
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ departments: [], projects: [], tasks: [], users: [], notifications: [], activities: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const requests = [
      ['projects', getProjects()],
      ['tasks', getTasks()],
      ['notifications', getNotifications()],
    ];
    if (hasPermission(user?.roleId, 'view', 'users')) requests.push(['users', listUsers()]);
    if (hasPermission(user?.roleId, 'view', 'departments')) requests.push(['departments', getDepartments()]);
    if (hasPermission(user?.roleId, 'view', 'activities')) requests.push(['activities', getActivities()]);

    Promise.allSettled(requests.map(([, promise]) => promise))
      .then((results) => {
        if (!active) return;
        const nextData = { departments: [], projects: [], tasks: [], users: [], notifications: [], activities: [] };
        let fulfilled = 0;
        results.forEach((result, index) => {
          if (result.status !== 'fulfilled') return;
          fulfilled += 1;
          const key = requests[index][0];
          nextData[key] = result.value[key] || [];
        });
        setData(nextData);
        if (!fulfilled) setError('Dashboard data is temporarily unavailable.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.roleId]);

  const openTasks = data.tasks.filter((task) => !['Done', 'Completed'].includes(task.status));
  const completedProjects = data.projects.filter((project) => project.status === 'Completed').length;
  const activeProjects = data.projects.filter((project) => !['Completed', 'Archived'].includes(project.status));
  const departmentSummary = data.departments.map((department) => {
    const departmentId = department.id || department._id;
    const projects = data.projects.filter((project) => (project.department?.id || project.department?.toString()) === departmentId);
    const tasks = data.tasks.filter((task) => (task.department?.id || task.department?.toString()) === departmentId);
    return {
      id: departmentId,
      name: department.name,
      members: department.members?.length,
      lead: department.lead?.name || 'Unassigned lead',
      activeProjects: projects.filter((project) => !['Completed', 'Archived'].includes(project.status)).length,
      workload: tasks.filter((task) => !['Done', 'Completed'].includes(task.status)).length,
    };
  });
  const overviewStats = [
    { label: 'Total members', value: data.users.length || '—', trend: data.users.length ? 'Live user records' : 'Not available for this role' },
    { label: 'Active projects', value: activeProjects.length, trend: 'Live project records' },
    { label: 'Open tasks', value: openTasks.length, trend: 'Live task records' },
    { label: 'Completed projects', value: completedProjects, trend: 'Live project records' },
  ];
  const alerts = data.notifications.slice(0, 4).map((notification) => ({ title: notification.title, detail: notification.message, severity: notification.read ? 'info' : 'warning' }));
  const activity = data.activities.slice(0, 5).map((entry) => ({ author: entry.user?.name || 'Activity', action: entry.action, target: entry.targetType, detail: entry.details, time: formatActivityTime(entry.createdAt) }));
  const projects = activeProjects.slice(0, 4).map((project) => ({
    name: project.name,
    department: project.department?.name || 'Unassigned',
    status: project.status,
    progress: project.progress || 0,
    lead: project.owner?.name || 'Unassigned',
    deadline: project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set',
  }));
  const roleName = user?.roleId?.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'Team Member';

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Organization overview</p>
          <h1>Good morning, {user?.name.split(' ')[0]}.</h1>
          <p>{roleName} workspace · {departmentSummary.length ? `${departmentSummary.length} departments` : 'Department overview unavailable for this role'}.</p>
        </div>
        <Button variant="primary" icon="plus">New project</Button>
      </header>

      {error && <p className="auth-error" role="alert">{error}</p>}

      <section className="stat-grid" aria-label="Team overview">
        {overviewStats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </section>

      <section className="dashboard-grid dashboard-grid-primary">
        <article className="card">
          <div className="card-header"><h2>Department overview</h2><span>Updated just now</span></div>
          <div className="card-body department-grid">
            {loading ? <p className="empty-state">Loading department records…</p> : departmentSummary.map((department) => (
              <div className="department-card" key={department.name}>
                <div className="department-card-top">
                  <span className="avatar small">{department.name.slice(0, 2).toUpperCase()}</span>
                  <span className="status active">{department.members ?? '—'} members</span>
                </div>
                <h3>{department.name}</h3>
                <p>{department.lead} · {department.activeProjects} active projects</p>
                <div className="workload-row"><span>Open tasks</span><strong>{department.workload}</strong></div>
                <div className="workload-track"><span style={{ width: `${Math.min(department.workload * 10, 100)}%` }} /></div>
              </div>
            ))}
          </div>
        </article>

        <article className="card alerts-card">
          <div className="card-header"><h2>Alerts</h2><span>Needs attention</span></div>
          <div className="card-body">
            {alerts.length ? alerts.map((alert, index) => <AlertItem key={`${alert.title}-${index}`} alert={alert} />) : <p className="empty-state">No notifications are available.</p>}
          </div>
        </article>
      </section>

      <section className="section-grid dashboard-grid-secondary">
        <article className="card">
          <div className="card-header"><h2>Active projects</h2><span>{projects.length} shown</span></div>
          <div className="card-body project-grid">
            {projects.length ? projects.map((project) => <ProjectSummary key={project.name} project={project} />) : <p className="empty-state">No active projects are available.</p>}
          </div>
        </article>

        <article className="card">
          <div className="card-header"><h2>Team activity</h2><span>Recent updates</span></div>
          <div className="card-body activity-list">
            {activity.length ? activity.map((item, index) => (
              <div className="activity-item" key={`${item.author}-${item.target}-${index}`}>
                <span className="avatar small">{item.author.split(' ').map((part) => part[0]).join('')}</span>
                <div><p><strong>{item.author}</strong> {item.action} <strong>{item.target}</strong>{item.detail ? ` ${item.detail}` : ''}</p><span>{item.time}</span></div>
              </div>
            )) : <p className="empty-state">Recent activity is unavailable for this role or there are no activity records.</p>}
          </div>
        </article>
      </section>
    </>
  );
}
