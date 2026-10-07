import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { departments } from '../data/departments';
import { departmentWorkspaceDefinitions } from '../data/departmentWorkspaces';
import { getDepartments } from '../services/domainsApi';

export default function Departments() {
  const [departmentData, setDepartmentData] = useState(departments);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getDepartments()
      .then(({ departments: liveDepartments }) => {
        if (active && liveDepartments?.length) setDepartmentData(liveDepartments);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const workspaceDepartments = departmentData.map((department) => {
    const normalizedCode = department.code?.toLowerCase().replaceAll('_', '-');
    const normalizedName = department.name?.toLowerCase().replaceAll(' / ', '-').replaceAll('/', '-');
    const definition = departmentWorkspaceDefinitions[department.id]
      || departmentWorkspaceDefinitions[normalizedCode]
      || departmentWorkspaceDefinitions[normalizedName];
    return { ...department, definition };
  });

  return (
    <>
      <header className="page-header">
        <div><p className="eyebrow">Department workspace</p><h1>Specialized teams</h1><p>Open a department workspace to access its role-specific tools, workflows, and records.</p></div>
        <Button variant="secondary">Department directory</Button>
      </header>

      {error && <p className="auth-error" role="alert">Unable to load live departments: {error}. Showing the existing department catalog.</p>}
      {loading ? <div className="auth-loading">Loading department catalog…</div> : (
        <section className="department-directory-grid">
          {workspaceDepartments.map((department) => (
            <article className="card department-directory-card" key={department.id}>
              <div className="department-directory-top"><span className="department-directory-icon">{department.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><span className="status active">Active</span></div>
              <h2>{department.name}</h2>
              <p>{department.description || department.definition?.description || 'Department workspace.'}</p>
              <div className="department-directory-meta"><span>{department.members} members</span><strong>{department.lead || 'Unassigned lead'}</strong></div>
              <div className="department-directory-actions"><span>{department.definition?.statuses?.length || 0} workflow states</span><Link to={`/departments/${department.id}`}><Button variant="primary">Open workspace</Button></Link></div>
            </article>
          ))}
        </section>
      )}
    </>
  );
}
