import { Link } from 'react-router-dom';

export default function ApplicantCard({ applicant }) {
  return (
    <article className="applicant-card">
      <div className="applicant-card-top"><span className="avatar small">{applicant.name.split(' ').map((part) => part[0]).join('')}</span><span className={`status ${applicant.status.toLowerCase()}`}>{applicant.status}</span></div>
      <h3>{applicant.name}</h3>
      <p className="applicant-role">{applicant.position}</p>
      <p className="member-meta">{applicant.department}</p>
      <div className="skill-list">{applicant.skills.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}</div>
      <div className="applicant-card-footer"><span>{applicant.applied}</span><Link to={`/recruitment/${applicant.id}`}>View profile →</Link></div>
    </article>
  );
}
