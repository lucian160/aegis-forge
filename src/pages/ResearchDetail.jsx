import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { getResearchProject } from '../services/domainsApi';

export default function ResearchDetail() {
  const { researchId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getResearchProject(researchId)
      .then((response) => {
        if (active) setProject(response.researchProject);
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
  }, [researchId]);

  if (loading) return <div className="auth-loading">Loading research project…</div>;
  if (error) return <section className="empty-state"><div><span className="empty-state-icon">R&amp;D</span><h3>Research project unavailable</h3><p>{error}</p><Link to="/research"><Button variant="primary">Back to R&amp;D</Button></Link></div></section>;
  if (!project) return <section className="empty-state"><div><span className="empty-state-icon">R&amp;D</span><h3>Research project not found</h3><p>The requested project may have moved or no longer exists.</p><Link to="/research"><Button variant="primary">Back to R&amp;D</Button></Link></div></section>;

  const entries = project.entries || [];
  const references = entries.flatMap((entry) => (entry.references || []).map((reference) => ({
    id: `${entry.id}-${reference}`,
    title: reference,
    entryTitle: entry.title,
  })));

  return (
    <>
      <header className="page-header"><div><p className="eyebrow">Research & Development</p><h1>{project.title}</h1><p>{project.description || 'No description is available for this research project.'}</p></div></header>
      <section className="detail-layout">
        <article className="card document-reader">
          <div className="card-header"><h2>Research overview</h2><span>{project.status}</span></div>
          <div className="card-body article-body">
            <section><h3>Project description</h3><p>{project.description || 'No description is available for this research project.'}</p></section>
            <section><h3>Research entries</h3>{entries.length ? entries.map((entry) => <article className="list-row" key={entry.id}><div className="list-main"><strong>{entry.title}</strong><span>{entry.author?.name || 'Unknown author'} · {entry.status}</span><p>{entry.content}</p></div></article>) : <p className="empty-state-copy">No research entries have been recorded for this project.</p>}</section>
            <section><h3>References</h3>{references.length ? <ul>{references.map((reference) => <li key={reference.id}>{reference.title} <span className="meta-text">({reference.entryTitle})</span></li>)}</ul> : <p className="empty-state-copy">No references have been recorded for this project.</p>}</section>
          </div>
        </article>
        <aside className="detail-sidebar">
          <article className="card"><div className="card-header"><h2>Details</h2></div><div className="card-body detail-list"><div><span>Owner</span><strong>{project.owner?.name || 'Unknown owner'}</strong></div><div><span>Department</span><strong>{project.department?.name || 'Unassigned'}</strong></div><div><span>Status</span><strong>{project.status}</strong></div><div><span>Priority</span><strong>{project.priority || 'Unavailable'}</strong></div><div><span>Deadline</span><strong>{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}</strong></div><div><span>Entries</span><strong>{entries.length}</strong></div><div><span>References</span><strong>{references.length}</strong></div></div></article>
        </aside>
      </section>
    </>
  );
}
