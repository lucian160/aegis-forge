import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { applicants as demoApplicants } from '../data/recruitment';
import { getApplication } from '../services/domainsApi';

export default function ApplicantDetail() {
  const { applicantId } = useParams();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getApplication(applicantId)
      .then((response) => {
        if (active) setApplicant(response.application);
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
  }, [applicantId]);

  if (loading) return <div className="auth-loading">Loading application…</div>;
  if (error) return <section className="empty-state"><div><span className="empty-state-icon">APP</span><h3>Application unavailable</h3><p>{error}. The existing recruitment roster remains available.</p><Link to="/recruitment"><Button variant="primary">Back to applicants</Button></Link></div></section>;

  const resolvedApplicant = applicant || demoApplicants.find((item) => item.id === applicantId);
  if (!resolvedApplicant) {
    return <section className="empty-state"><div><span className="empty-state-icon">APP</span><h3>Applicant not found</h3><p>The requested applicant may no longer be in the roster.</p><Link to="/recruitment"><Button variant="primary">Back to applicants</Button></Link></div></section>;
  }

  return (
    <>
      <header className="page-header"><div><p className="eyebrow">Recruitment workspace</p><h1>{resolvedApplicant.name}</h1><p>{resolvedApplicant.position} · {resolvedApplicant.department}</p></div><Button variant="primary">Review application</Button></header>
      <section className="detail-layout"><article className="card"><div className="card-header"><h2>Application overview</h2><span className={`status ${resolvedApplicant.status.toLowerCase()}`}>{resolvedApplicant.status}</span></div><div className="card-body applicant-profile"><div className="applicant-profile-header"><span className="avatar large">{resolvedApplicant.name.split(' ').map((part) => part[0]).join('')}</span><div><h3>{resolvedApplicant.name}</h3><p>{resolvedApplicant.email}</p><span className="meta-text">Applied {resolvedApplicant.applied}</span></div></div><p className="application-summary">{resolvedApplicant.summary}</p><div className="skill-list">{resolvedApplicant.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div></article><aside className="detail-sidebar"><article className="card"><div className="card-header"><h2>Candidate details</h2></div><div className="card-body detail-list"><div><span>Position</span><strong>{resolvedApplicant.position}</strong></div><div><span>Department</span><strong>{resolvedApplicant.department}</strong></div><div><span>Experience</span><strong>{resolvedApplicant.experience}</strong></div><div><span>Applied</span><strong>{resolvedApplicant.applied}</strong></div><div><span>Portfolio</span><strong>{resolvedApplicant.portfolio ? <a href={resolvedApplicant.portfolio} target="_blank" rel="noreferrer">Open profile</a> : 'Not provided'}</strong></div></div></article><article className="card"><div className="card-header"><h2>Decision workflow</h2></div><div className="card-body decision-list"><span>New</span><span>Reviewing</span><span>Shortlisted</span><span>Interview</span><span>Accepted</span><span>Rejected</span></div></article></aside></section>
    </>
  );
}
