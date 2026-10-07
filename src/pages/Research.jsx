import { useEffect, useMemo, useState } from 'react';
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import { experiments, researchNotes, researchProjects as demoProjects, researchReferences, researchStatuses } from '../data/research';
import { getResearchProjects } from '../services/domainsApi';

function mapProject(project) {
  return {
    ...project,
    owner: project.owner?.name || project.owner || 'Unknown owner',
    department: project.department?.name || project.department || 'Organization',
    summary: project.description || project.summary || '',
    updated: project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Recently',
    findings: project.entries?.length || project.findings || 0,
    references: project.references?.length || project.references || 0,
    progress: project.progress || 0,
  };
}

export default function Research() {
  const [projects, setProjects] = useState(demoProjects);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All statuses');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getResearchProjects()
      .then((response) => {
        if (active && response.researchProjects?.length) setProjects(response.researchProjects.map(mapProject));
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
    const searchable = `${project.title} ${project.department} ${project.owner} ${project.summary}`.toLowerCase();
    return matchesStatus && searchable.includes(query.toLowerCase());
  }), [projects, query, status]);

  const researchStats = [
    { label: 'Research projects', value: projects.length, trend: 'Across departments' },
    { label: 'Active experiments', value: experiments.filter((experiment) => experiment.status === 'Active' || experiment.status === 'Experimenting').length, trend: 'In progress' },
    { label: 'Findings', value: researchNotes.length, trend: 'Ready for review' },
    { label: 'References', value: researchReferences.length, trend: 'Curated sources' },
  ];

  return (
    <>
      <header className="page-header"><div><p className="eyebrow">R&D workspace</p><h1>Research & Development</h1><p>Explore experiments, findings, references, and research ownership.</p></div><Button variant="primary" icon="plus">New research project</Button></header>
      {error && <p className="auth-error" role="alert">Unable to load research projects: {error}. Showing the existing portfolio.</p>}
      {loading ? <div className="auth-loading">Loading research portfolio…</div> : (
        <>
          <section className="stat-grid" aria-label="R&D summary">{researchStats.map((stat) => <StatCard key={stat.label} {...stat} />)}</section>

          <section className="section-grid"><article className="card"><div className="card-header"><h2>Research projects</h2><span>{filteredProjects.length} matching</span></div><div className="card-body project-list">{filteredProjects.map((project) => <div className="list-row" key={project.id}><span className="content-icon"><span className="file-icon">R&amp;D</span></span><div className="list-main"><strong>{project.title}</strong><span>{project.department} · {project.owner}</span></div><div className="research-progress"><span>{project.progress}%</span><div className="progress-track"><span style={{ width: `${project.progress}%` }} /></div></div><span className={`status ${project.status.toLowerCase()}`}>{project.status}</span></div>)}</div></article><article className="card"><div className="card-header"><h2>Active experiments</h2><span>{experiments.length} total</span></div><div className="card-body list-stack">{experiments.map((experiment) => <div className="list-row" key={experiment.id}><span className="content-icon"><span className="file-icon">EXP</span></span><div className="list-main"><strong>{experiment.name}</strong><span>{experiment.owner} · {experiment.successMetric}</span></div><span className={`status ${experiment.status.toLowerCase()}`}>{experiment.status}</span></div>)}</div></article></section>

          <section className="knowledge-section"><div className="section-heading"><h2>Research portfolio</h2><span>{filteredProjects.length} projects</span></div><div className="filter-bar"><label className="search-box"><span className="sr-only">Search research</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search research projects..." /></label><select className="filter-select" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by research status"><option>All statuses</option>{researchStatuses.map((item) => <option key={item}>{item}</option>)}</select></div><div className="content-grid">{filteredProjects.map((project) => <article className="content-card" key={project.id}><div className="content-card-top"><span className="content-icon"><span className="file-icon">R&amp;D</span></span><span className={`status ${project.status.toLowerCase()}`}>{project.status}</span></div><a href={`/research/${project.id}`} className="content-card-link"><h3>{project.title}</h3><p>{project.summary}</p></a><div className="content-card-meta"><span>{project.category}</span><span>{project.updated}</span></div><div className="content-card-footer"><span className="avatar small">{project.owner.split(' ').map((part) => part[0]).join('')}</span><span>{project.owner}</span><span className="content-stat">{project.findings} findings</span></div></article>)}</div></section>

          <section className="section-grid"><article className="card"><div className="card-header"><h2>Research findings</h2><span>{researchNotes.length} notes</span></div><div className="card-body list-stack">{researchNotes.map((note) => <div className="list-row" key={note.id}><span className="content-icon"><span className="file-icon">NOTE</span></span><div className="list-main"><strong>{note.title}</strong><span>{note.project} · {note.author}</span></div><span className="meta-text">{note.updated}</span></div>)}</div></article><article className="card"><div className="card-header"><h2>References</h2><span>{researchReferences.length} curated</span></div><div className="card-body list-stack">{researchReferences.map((reference) => <div className="list-row" key={reference.id}><span className="content-icon"><span className="file-icon">REF</span></span><div className="list-main"><strong>{reference.title}</strong><span>{reference.source} · {reference.type}</span></div><span className="meta-text">{reference.updated}</span></div>)}</div></article></section>
        </>
      )}
    </>
  );
}
