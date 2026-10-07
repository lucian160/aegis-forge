import { Link } from 'react-router-dom';
import Button from './Button';

export default function PositionCard({ position }) {
  return (
    <article className="position-card">
      <div className="position-card-top"><span className="department-pill">{position.department}</span><span className="meta-text">{position.posted}</span></div>
      <h3>{position.title}</h3>
      <p>{position.summary}</p>
      <div className="position-details"><span>{position.location}</span><span>{position.employment}</span><span>{position.level}</span></div>
      <div className="skill-list">{position.skills.slice(0, 4).map((skill) => <span key={skill}>{skill}</span>)}</div>
      <div className="position-card-footer"><strong>{position.salary}</strong><Link to={`/work-with-us/${position.id}`}><Button variant="primary">View role</Button></Link></div>
    </article>
  );
}
