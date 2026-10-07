import { useEffect, useMemo, useState } from 'react';
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import { researchStatuses } from '../data/research';
import { getResearchProjects } from '../services/domainsApi';

function mapProject(project) {
  return {
    ...project,
    ownerName: project.owner?.name || 'Unknown owner',
    departmentName: project.department?.name || 'Unassigned',
    entries: project.entries || [],
  };
}

export default function Research() {
  const [projects, setProjects] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All statuses');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getResearchProjects()
      .then((response) => {
        if (active) setProjects((response.researchProjects || []).map(mapProject));
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

  const filteredProjects = useMemo(() => projects.filter((project) => {
    const matchesStatus = status === 'All statuses' || project.status === status;
    const searchable = `${project.title} ${project.departmentName} ${project.ownerName} ${project.description}`.toLowerCase();
    return matchesStatus && searchable.includes(query.toLowerCase());
  }), [projects, query, status]);

  const entries = projects.flatMap((project) => project.entries.map((entry) => ({
    ...entry,
    projectTitle: project.title,
  })));
  const references = entries.flatMap((entry) => (entry.references || []).map((reference) => ({
    id: `${entry.id}-${reference}`,
    title: reference,
    projectTitle: entry.projectTitle,
  })));
  const researchStats = [
    { label: 'Research projects', value: projects.length, trend: 'Live API records' },
    { label: 'Active projects', value: projects.filter((project) => project.status === 'Active').length, trend: 'Live project status' },
    { label: 'Research entries', value: entries.length, trend: 'Recorded findings' },
    { label: 'References', value: references.length, trend: 'Recorded project references' },
  ];

  return (
    <>
      <header className="page-header"><div><p className="eyebrow">R&D workspace</p><h1>Research & Development</h1><p>Explore research projects, findings, and references recorded in the workspace.</p></div></header>
      {error && <p className="auth-error" role="alert">Unable to load research projects: {error}</p>}
      {loading ? <div className="auth-loading">Loading research portfolio…</div> : (
        <>
          <section className="stat-grid" aria-label="R&D summary">{researchStats.map((stat) => <StatCard key={stat.label} {...stat} />)}</section>

          <section className="knowledge-section">
            <div className="section-heading"><h2>Research portfolio</h2><span>{filteredProjects.length} projects</span></div>
            <div className="filter-bar">
              <label className="search-box"><span className="sr-only">Search research</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search research projects..." /></label>
              <select className="filter-select" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by research status"><option>All statuses</option>{researchStatuses.map((item) => <option key={item}>{item}</option>)}</select>
            </div>
            <div className="content-grid">
              {filteredProjects.map((project) => (
                <article className="content-card" key={project.id}>
                  <div className="content-card-top"><span className="content-icon"><span className="file-icon">R&amp;D</span></span><span className={`status ${project.status.toLowerCase()}`}>{project.status}</span></div>
                  <a href={`/research/${project.id}`} className="content-card-link"><h3>{project.title}</h3><p>{project.description || 'No description is available for this research project.'}</p></a>
                  <div className="content-card-meta"><span>{project.departmentName}</span><span>{project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Date unavailable'}</span></div>
                  <div className="content-card-footer"><span className="avatar small">{project.ownerName.split(' ').map((part) => part[0]).join('')}</span><span>{project.ownerName}</span><span className="content-stat">{project.entries.length} entries</span></div>
                </article>
              ))}
              {filteredProjects.length === 0 && <p className="empty-state">No research projects are available for this view.</p>}
            </div>
          </section>

          <section className="section-grid">
            <article className="card"><div className="card-header"><h2>Research entries</h2><span>{entries.length} records</span></div><div className="card-body list-stack">{entries.map((entry) => <div className="list-row" key={entry.id}><span className="content-icon"><span className="file-icon">NOTE</span></span><div className="list-main"><strong>{entry.title}</strong><span>{entry.projectTitle} · {entry.author?.name || 'Unknown author'}</span></div><span className="meta-text">{entry.status}</span></div>)}{entries.length === 0 && <p className="empty-state">No research entries are available.</p>}</div></article>
            <article className="card"><div className="card-header"><h2>References</h2><span>{references.length} records</span></div><div className="card-body list-stack">{references.map((reference) => <div className="list-row" key={reference.id}><span className="content-icon"><span className="file-icon">REF</span></span><div className="list-main"><strong>{reference.title}</strong><span>{reference.projectTitle}</span></div></div>)}{references.length === 0 && <p className="empty-state">No research references are available.</p>}</div></article>
          </section>
        </>
      )}
    </>
  );
}
