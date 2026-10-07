import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { departmentWorkspaceDefinitions } from '../data/departmentWorkspaces';
import { getDepartments } from '../services/domainsApi';

export default function Departments() {
  const [departmentData, setDepartmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getDepartments()
      .then(({ departments: liveDepartments }) => {
        if (active) setDepartmentData(liveDepartments || []);
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
    const definition = Object.values(departmentWorkspaceDefinitions)
      .find((item) => item.code === department.code);
    return { ...department, definition };
  });

  return (
    <>
      <header className="page-header">
        <div><p className="eyebrow">Department workspace</p><h1>Specialized teams</h1><p>Open a department workspace to access its role-specific tools, workflows, and records.</p></div>
      </header>

      {error && <p className="auth-error" role="alert">Unable to load departments: {error}</p>}
      {loading ? <div className="auth-loading">Loading department catalog…</div> : (
        <section className="department-directory-grid">
          {workspaceDepartments.length ? workspaceDepartments.map((department) => (
            <article className="card department-directory-card" key={department.id || department._id}>
              <div className="department-directory-top"><span className="department-directory-icon">{department.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><span className={`status ${(department.status || 'unknown').toLowerCase()}`}>{department.status || 'Unavailable'}</span></div>
              <h2>{department.name}</h2>
              <p>{department.description || department.definition?.description || 'No description is available.'}</p>
              <div className="department-directory-meta"><span>{Array.isArray(department.members) ? `${department.members.length} members` : 'Member count unavailable'}</span><strong>{department.lead?.name || (department.lead ? 'Lead assigned' : 'Unassigned lead')}</strong></div>
              <div className="department-directory-actions"><Link to={`/departments/${department.id || department._id}`}><Button variant="primary">Open workspace</Button></Link></div>
            </article>
          )) : <p className="empty-state">{error ? 'Department records are unavailable.' : 'No department records are available.'}</p>}
        </section>
      )}
    </>
  );
}
