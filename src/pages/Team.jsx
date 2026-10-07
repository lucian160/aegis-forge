import { useEffect, useMemo, useState } from 'react';
import MemberCard from '../components/MemberCard';
import StatCard from '../components/StatCard';
import { getDepartments } from '../services/domainsApi';
import { listUsers } from '../services/usersApi';

function mapUserToMember(user, departmentsById) {
  const initials = user.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  return {
    id: user.id,
    name: user.name,
    roleId: user.roleId,
    role: user.roleId.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
    department: departmentsById.get(user.departmentId) || 'Unassigned',
    location: 'Location unavailable',
    availability: user.isActive ? 'Available' : 'Inactive',
    skills: [],
    projects: [],
    initials,
  };
}

export default function Team() {
  const [members, setMembers] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([listUsers(), getDepartments()])
      .then(([{ users }, { departments }]) => {
        if (!active) return;
        const departmentsById = new Map((departments || []).map((department) => [department.id || department._id, department.name]));
        setDepartmentList(departments || []);
        setMembers((users || []).map((user) => mapUserToMember(user, departmentsById)));
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const teamMetrics = [
    { label: 'Visible members', value: members.length, trend: 'From authorized user records' },
    { label: 'Active accounts', value: members.filter((member) => member.availability === 'Available').length, trend: 'Account status' },
    { label: 'Departments', value: departmentList.length, trend: 'Visible department records' },
    { label: 'Department leaders', value: members.filter((member) => member.roleId === 'department_leader').length, trend: 'Current role assignments' },
  ];
  const departmentSnapshot = departmentList.map((department) => ({
    id: department.id || department._id,
    name: department.name,
    members: members.filter((member) => member.department === department.name).length,
  }));

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">People workspace</p>
          <h1>Team directory</h1>
          <p>Track team capacity, department health, and staffing across the organization.</p>
        </div>
      </header>

      {error && <p className="auth-error" role="alert">Unable to load the live team directory: {error}</p>}
      {loading ? <div className="auth-loading">Loading team directory…</div> : (
        <>
          <section className="stat-grid" aria-label="Team health metrics">
            {teamMetrics.map((stat) => <StatCard key={stat.label} {...stat} />)}
          </section>

      <section className="section-grid team-grid">
        <article className="card">
          <div className="card-header"><h2>Department health</h2><span>Live snapshot</span></div>
          <div className="card-body team-table">
            {departmentSnapshot.length ? departmentSnapshot.map((department) => (
              <div key={department.id} className="team-row">
                <span>{department.name}</span>
                <strong>{department.members} members</strong>
                <span className="meta-text">Directory records</span>
              </div>
            )) : <p className="empty-state">No department records are available.</p>}
          </div>
        </article>

        <article className="card">
          <div className="card-header"><h2>Resourcing</h2><span>Priority coverage</span></div>
          <div className="card-body resource-list">
            <div><span>Visible user records</span><strong>{members.length}</strong></div>
            <div><span>Active accounts</span><strong>{members.filter((member) => member.availability === 'Available').length}</strong></div>
            <div><span>Unassigned users</span><strong>{members.filter((member) => member.department === 'Unassigned').length}</strong></div>
            <div><span>Department records</span><strong>{departmentList.length}</strong></div>
          </div>
        </article>
      </section>

        <section className="team-directory-section">
          <div className="section-heading"><h2>Team members</h2><span>{members.length} people</span></div>
          <div className="team-grid-large">
            {members.length ? members.map((member) => <MemberCard key={member.id} member={member} />) : <p className="empty-state">No users are available to this account.</p>}
          </div>
        </section>
        </>
      )}
    </>
  );
}
