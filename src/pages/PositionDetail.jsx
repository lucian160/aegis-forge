import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { positions } from '../data/recruitment';

export default function PositionDetail() {
  const { positionId } = useParams();
  const position = positions.find((item) => item.id === positionId);

  if (!position) {
    return <section className="empty-state"><div><span className="empty-state-icon">ROLE</span><h3>Position not found</h3><p>This role may no longer be open.</p><Link to="/work-with-us"><Button variant="primary">Return to open roles</Button></Link></div></section>;
  }

  return (
    <>
      <header className="page-header"><div><p className="eyebrow">{position.department}</p><h1>{position.title}</h1><p>{position.summary}</p></div><Link to={`/work-with-us/${position.id}/apply`}><Button variant="primary" icon="plus">Apply for this role</Button></Link></header>
      <section className="detail-layout"><article className="card position-reader"><div className="card-header"><h2>Role details</h2><span>{position.employment}</span></div><div className="card-body article-body"><section><h3>About the role</h3><p>{position.summary}</p></section><section><h3>Responsibilities</h3><ul>{position.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h3>Required experience</h3><ul>{position.requirements.map((item) => <li key={item}>{item}</li>)}</ul></section></div></article><aside className="detail-sidebar"><article className="card"><div className="card-header"><h2>Position summary</h2></div><div className="card-body detail-list"><div><span>Department</span><strong>{position.department}</strong></div><div><span>Location</span><strong>{position.location}</strong></div><div><span>Employment</span><strong>{position.employment}</strong></div><div><span>Level</span><strong>{position.level}</strong></div><div><span>Salary</span><strong>{position.salary}</strong></div><div><span>Applicants</span><strong>{position.applicants}</strong></div></div></article><article className="card"><div className="card-header"><h2>What we are looking for</h2></div><div className="card-body skill-list">{position.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></article></aside></section>
    </>
  );
}
