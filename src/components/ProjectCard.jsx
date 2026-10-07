export default function ProjectCard({ project }) {
  return (
    <article className="project-card">
      <div className="project-card-top">
        <span className={`priority priority-${project.priority.toLowerCase()}`}>{project.priority}</span>
        <span className={`status ${project.status.toLowerCase().replaceAll(' ', '-')}`}>{project.status}</span>
      </div>
      <h3>{project.name}</h3>
      <p>{project.description}</p>
      <div className="project-card-footer">
        <span>{project.department}</span>
        <strong>{project.progress}%</strong>
      </div>
      <div className="progress-track"><span style={{ width: `${project.progress}%` }} /></div>
    </article>
  );
}
