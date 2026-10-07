export default function ProjectSummary({ project }) {
  return (
    <article className="project-summary">
      <div className="project-summary-top">
        <span className="project-department">{project.department}</span>
        <span className={`status ${project.status.toLowerCase().replaceAll(' ', '-')}`}>{project.status}</span>
      </div>
      <h3>{project.name}</h3>
      <div className="progress-label"><span>Progress</span><strong>{project.progress}%</strong></div>
      <div className="progress-track"><span style={{ width: `${project.progress}%` }} /></div>
      <div className="project-meta"><span>Lead: {project.lead}</span><span>Due {project.deadline}</span></div>
    </article>
  );
}
