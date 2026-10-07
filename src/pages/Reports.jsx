import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getReportingData } from '../services/reportsApi';
import { hasPermission } from '../data/permissions';

const periodOptions = [
  { value: 'all', label: 'All time' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'quarter', label: 'This quarter' },
];

const statusColors = ['#8bffb0', '#76a7ff', '#f4c95d', '#ff7b7b', '#b288ff'];

function countBy(items, key) {
  return items.reduce((result, item) => {
    const label = item[key] || 'Unassigned';
    result[label] = (result[label] || 0) + 1;
    return result;
  }, {});
}

function safePercent(numerator, denominator) {
  return denominator ? Math.round((numerator / denominator) * 100) : 0;
}

function inPeriod(value, period) {
  if (!value || period === 'all') return true;
  const date = new Date(value);
  const now = new Date();
  if (Number.isNaN(date.getTime())) return false;
  if (period === 'week') return date >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (period === 'month') return date >= new Date(now.getFullYear(), now.getMonth(), 1);
  if (period === 'quarter') {
    const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    return date >= quarterStart;
  }
  return true;
}

function filterItems(items, period, department, project, status) {
  return items.filter((item) => {
    const itemDate = item.startDate || item.deadline || item.startsAt || item.createdAt;
    return inPeriod(itemDate, period)
      && (!department || item.department?.id === department || item.department === department)
      && (!project || item.project?.id === project || item.project === project)
      && (!status || item.status === status);
  });
}

function metricCard(label, value, detail, tone = 'green') {
  return (
    <article className={`report-metric report-metric-${tone}`} key={label}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function BarChart({ items, labelKey, valueKey, title, limit = 6 }) {
  const entries = Object.entries(items).slice(0, limit);
  if (!entries.length) return <div className="report-empty">No data available for this chart.</div>;
  const max = Math.max(...entries.map(([, value]) => value), 1);
  return (
    <div className="report-bar-chart">
      {entries.map(([label, value], index) => (
        <div className="report-bar-row" key={label}>
          <span>{label}</span>
          <div className="report-bar-track"><i style={{ width: `${(value / max) * 100}%`, background: statusColors[index % statusColors.length] }} /></div>
          <strong>{value}</strong>
        </div>
      ))}
      <h4 className="sr-only">{title}</h4>
    </div>
  );
}

function Section({ title, description, action, children }) {
  return (
    <section className="card report-section">
      <header className="card-header"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</header>
      <div className="card-body">{children}</div>
    </section>
  );
}

export default function Reports() {
  const { user } = useAuth();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('all');
  const [department, setDepartment] = useState('');
  const [project, setProject] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    let active = true;
    getReportingData()
      .then((response) => { if (active) setData(response); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const users = data.users?.users || [];
  const departments = data.departments?.departments || [];
  const projects = data.projects?.projects || [];
  const tasks = data.tasks?.tasks || [];
  const meetings = data.meetings?.meetings || [];
  const applications = data.applications?.applications || [];
  const activities = data.activities?.activities || [];

  const filteredProjects = useMemo(() => filterItems(projects, period, department, project, status), [department, period, project, projects, status]);
  const filteredTasks = useMemo(() => filterItems(tasks, period, department, project, status), [department, period, project, projects, status, tasks]);
  const filteredMeetings = useMemo(() => filterItems(meetings, period, department, project, status), [department, period, project, projects, status, meetings]);
  const filteredApplications = useMemo(() => filterItems(applications, period, department, project, status), [applications, department, period, project, status]);

  const activeMembers = users.filter((member) => member.isActive !== false).length;
  const completedProjects = filteredProjects.filter((item) => item.status === 'Completed').length;
  const completedTasks = filteredTasks.filter((item) => item.status === 'Done' || item.status === 'Completed').length;
  const overdueTasks = filteredTasks.filter((task) => task.status !== 'Done' && task.status !== 'Completed' && task.dueDate && new Date(task.dueDate) < new Date()).length;
  const upcomingMeetings = filteredMeetings.filter((meeting) => meeting.status !== 'Cancelled' && new Date(meeting.startsAt) >= new Date()).length;
  const totalTasks = filteredTasks.length;
  const totalProjects = filteredProjects.length;
  const totalMeetings = filteredMeetings.length;
  const totalApplications = filteredApplications.length;
  const projectCompletion = safePercent(completedProjects, totalProjects);
  const taskCompletion = safePercent(completedTasks, totalTasks);
  const projectStatus = countBy(filteredProjects, 'status');
  const taskStatus = countBy(filteredTasks, 'status');
  const taskPriority = countBy(filteredTasks, 'priority');
  const meetingStatus = countBy(filteredMeetings, 'status');
  const meetingType = countBy(filteredMeetings, 'meetingType');
  const applicationStatus = countBy(filteredApplications, 'status');
  const departmentSummary = departments.map((item) => {
    const departmentTasks = filteredTasks.filter((task) => task.department?.id === item.id || task.department === item.id);
    const departmentProjects = filteredProjects.filter((project) => project.department?.id === item.id || project.department === item.id);
    const departmentMeetings = filteredMeetings.filter((meeting) => meeting.department?.id === item.id || meeting.department === item.id);
    const departmentMembers = users.filter((member) => member.departmentId === item.id).length;
    return { ...item, members: departmentMembers, projects: departmentProjects.length, tasks: departmentTasks.length, completedTasks: departmentTasks.filter((task) => task.status === 'Done' || task.status === 'Completed').length, meetings: departmentMeetings.length, workload: departmentTasks.filter((task) => task.status !== 'Done' && task.status !== 'Completed').length };
  });

  const canViewRecruitment = hasPermission(user?.roleId, 'view', 'reports') && user?.roleId !== 'member';
  const filters = (
    <div className="report-filters">
      <label><span>Period</span><select value={period} onChange={(event) => setPeriod(event.target.value)}>{periodOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      <label><span>Department</span><select value={department} onChange={(event) => setDepartment(event.target.value)}><option value="">All departments</option>{departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label><span>Project</span><select value={project} onChange={(event) => setProject(event.target.value)}><option value="">All projects</option>{filteredProjects.length ? [...new Set(filteredProjects.map((item) => item.id))].map((id) => <option key={id} value={id}>{filteredProjects.find((item) => item.id === id)?.name}</option>) : <option value="">No projects</option>}</select></label>
      <label><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{[...new Set([...projects.map((item) => item.status), ...tasks.map((item) => item.status), ...meetings.map((item) => item.status)])].map((item) => <option key={item}>{item}</option>)}</select></label>
    </div>
  );

  if (loading) return <div className="auth-loading">Loading reporting data…</div>;
  if (error) return <section className="card report-error"><div><h1>Reporting data unavailable</h1><p>{error}</p><small>Other reporting areas may still be available.</small></div></section>;

  return (
    <>
      <header className="page-header report-header"><div><p className="eyebrow">Decision support</p><h1>Reporting & analytics</h1><p>Operational metrics derived from existing organization data.</p></div><span className="report-data-badge">Live API data</span></header>
      {filters}

      <section className="report-summary-grid">
        {metricCard('Members', users.length, `${activeMembers} active`)}
        {metricCard('Departments', departments.length, `${departmentSummary.filter((item) => item.members).length} with members`)}
        {metricCard('Projects', totalProjects, `${projectCompletion}% complete`, 'blue')}
        {metricCard('Open tasks', Math.max(totalTasks - completedTasks, 0), `${overdueTasks} overdue`, 'warning')}
        {metricCard('Meetings', totalMeetings, `${upcomingMeetings} upcoming`, 'purple')}
        {metricCard('Recruitment', canViewRecruitment ? totalApplications : 0, canViewRecruitment ? `${applicationStatus['Pending'] || 0} pending` : 'Permission restricted', 'gray')}
      </section>

      <section className="report-grid">
        <Section title="Organization overview" description="Current operational totals and derived completion rates.">
          <div className="report-overview-grid">
            <div><span>Project completion</span><strong>{projectCompletion}%</strong><div className="report-progress"><i style={{ width: `${projectCompletion}%` }} /></div><small>{completedProjects} of {totalProjects} projects</small></div>
            <div><span>Task completion</span><strong>{taskCompletion}%</strong><div className="report-progress"><i style={{ width: `${taskCompletion}%` }} /></div><small>{completedTasks} of {totalTasks} tasks</small></div>
            <div><span>Active workload</span><strong>{filteredTasks.filter((task) => task.status !== 'Done' && task.status !== 'Completed').length}</strong><small>Open tasks in the selected period</small></div>
            <div><span>Recent activity</span><strong>{activities.length}</strong><small>Records available to your role</small></div>
          </div>
        </Section>

        <Section title="Project performance" description="Projects in the selected period by status.">
          {filteredProjects.length ? <BarChart items={projectStatus} title="Projects by status" /> : <div className="report-empty">No project data available for the selected filters.</div>}
          <div className="report-mini-table"><h3>Project progress</h3>{filteredProjects.slice(0, 5).map((item) => <div key={item.id}><span>{item.name}</span><strong>{item.progress || 0}%</strong><i><b style={{ width: `${item.progress || 0}%` }} /></i></div>)}</div>
        </Section>

        <Section title="Task performance" description="Completion, priority, and workload distribution.">
          <div className="report-two-column"><div><h3>By status</h3>{Object.keys(taskStatus).length ? <BarChart items={taskStatus} title="Tasks by status" /> : <div className="report-empty">No task status data.</div>}</div><div><h3>By priority</h3>{Object.keys(taskPriority).length ? <BarChart items={taskPriority} title="Tasks by priority" /> : <div className="report-empty">No task priority data.</div>}</div></div>
        </Section>

        <Section title="Department performance" description="Operational summary for departments with available data.">
          <div className="report-table-wrap"><table><thead><tr><th>Department</th><th>Members</th><th>Projects</th><th>Open tasks</th><th>Completed</th><th>Meetings</th></tr></thead><tbody>{departmentSummary.length ? departmentSummary.map((item) => <tr key={item.id}><td><strong>{item.name}</strong><small>{item.code}</small></td><td>{item.members}</td><td>{item.projects}</td><td>{item.workload}</td><td>{item.completedTasks}</td><td>{item.meetings}</td></tr>) : <tr><td colSpan="6" className="report-empty">No department data available.</td></tr>}</tbody></table></div>
        </Section>

        <Section title="Meeting statistics" description="Scheduled, completed, cancelled, and type distribution.">
          <div className="report-two-column"><div><h3>By status</h3>{Object.keys(meetingStatus).length ? <BarChart items={meetingStatus} title="Meetings by status" /> : <div className="report-empty">No meeting data available yet.</div>}</div><div><h3>By type</h3>{Object.keys(meetingType).length ? <BarChart items={meetingType} title="Meetings by type" /> : <div className="report-empty">No meeting type data available.</div>}</div></div>
        </Section>

        {canViewRecruitment && <Section title="Recruitment statistics" description="Applications available under the existing recruitment permissions.">
          <div className="report-two-column"><div><h3>By status</h3>{Object.keys(applicationStatus).length ? <BarChart items={applicationStatus} title="Applications by status" /> : <div className="report-empty">No recruitment applications available.</div>}</div><div><h3>Recent applications</h3><div className="report-list">{applications.slice(0, 5).map((item) => <div key={item.id}><span>{item.applicant?.name || item.applicantName || 'Applicant'}</span><strong>{item.role?.title || item.role || 'Role not specified'}</strong><small>{item.status}</small></div>)}</div></div></div>
        </Section>}
      </section>
    </>
  );
}
