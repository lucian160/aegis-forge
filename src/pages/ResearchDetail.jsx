import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { experiments, researchNotes, researchProjects as demoProjects } from '../data/research';
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
  if (error) return <section className="empty-state"><div><span className="empty-state-icon">R&amp;D</span><h3>Research project unavailable</h3><p>{error}. The existing research portfolio remains available.</p><Link to="/research"><Button variant="primary">Back to R&amp;D</Button></Link></div></section>;

  const resolvedProject = project || demoProjects.find((item) => item.id === researchId);
  if (!resolvedProject) {
    return <section className="empty-state"><div><span className="empty-state-icon">R&amp;D</span><h3>Research project not found</h3><p>The requested project may have moved or no longer exists.</p><Link to="/research"><Button variant="primary">Back to R&amp;D</Button></Link></div></section>;
  }

  const projectNotes = researchNotes.filter((note) => note.project === resolvedProject.title);
  const projectExperiment = experiments.find((experiment) => experiment.project === resolvedProject.title);

  return (
    <>
      <header className="page-header"><div><p className="eyebrow">Research & Development</p><h1>{resolvedProject.title}</h1><p>{resolvedProject.summary}</p></div><Button variant="primary">Edit project</Button></header>
      <section className="detail-layout"><article className="card document-reader"><div className="card-header"><h2>Research overview</h2><span>{resolvedProject.status}</span></div><div className="card-body article-body"><section><h3>Objective</h3><p>{resolvedProject.summary}</p></section><section><h3>Current progress</h3><p>This project is {resolvedProject.progress}% complete and is owned by {resolvedProject.owner} in {resolvedProject.department}.</p><div className="progress-track"><span style={{ width: `${resolvedProject.progress}%` }} /></div></section><section><h3>Key findings</h3><p>{resolvedProject.findings} findings have been recorded for this research effort. The latest findings are maintained in the project notes below.</p></section></div></article><aside className="detail-sidebar"><article className="card"><div className="card-header"><h2>Details</h2></div><div className="card-body detail-list"><div><span>Owner</span><strong>{resolvedProject.owner}</strong></div><div><span>Department</span><strong>{resolvedProject.department}</strong></div><div><span>Category</span><strong>{resolvedProject.category}</strong></div><div><span>Updated</span><strong>{resolvedProject.updated}</strong></div><div><span>Findings</span><strong>{resolvedProject.findings}</strong></div><div><span>References</span><strong>{resolvedProject.references}</strong></div></div></article><article className="card"><div className="card-header"><h2>Experiment</h2></div><div className="card-body detail-list">{projectExperiment ? <><div><span>Name</span><strong>{projectExperiment.name}</strong></div><div><span>Success metric</span><strong>{projectExperiment.successMetric}</strong></div><div><span>Window</span><strong>{projectExperiment.start} — {projectExperiment.end}</strong></div></> : <p className="empty-state-copy">No active experiment is linked to this project.</p>}</div></article><article className="card"><div className="card-header"><h2>Research notes</h2></div><div className="card-body related-list">{projectNotes.map((note) => <Link key={note.id} to={`/research/${resolvedProject.id}`}>{note.title}<span>{note.updated}</span></Link>)}</div></article><article className="card"><div className="card-header"><h2>References</h2></div><div className="card-body related-list">{projectReferences.map((reference) => <a href={`/research/${project.id}`} key={reference.id}>{reference.title}<span>→</span></a>)}</div></article></aside></section>
    </>
  );
}
