import { useEffect, useMemo, useState } from 'react';
import ApplicantCard from '../components/ApplicantCard';
import StatCard from '../components/StatCard';
import { applicationStatuses } from '../data/recruitment';
import { getApplications } from '../services/domainsApi';

function mapApplication(application) {
  return {
    ...application,
    name: application.candidateName,
    email: application.candidateEmail,
    position: typeof application.position === 'string' ? application.position : application.position?.title || 'Position unavailable',
    department: application.department?.name || application.department || 'Unknown department',
    portfolio: application.portfolioUrl || application.linkedInUrl || '',
    applied: application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : 'Date unavailable',
    summary: application.notes || 'No application notes are available.',
  };
}

export default function RecruitmentDashboard() {
  const [applicants, setApplicants] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All statuses');
  const [department, setDepartment] = useState('All departments');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const departments = ['All departments', ...new Set(applicants.map((applicant) => applicant.department))];

  useEffect(() => {
    let active = true;
    getApplications()
      .then((response) => {
        if (active) setApplicants((response.applications || []).map(mapApplication));
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

  const visibleApplicants = useMemo(() => applicants.filter((applicant) => {
    const matchesStatus = status === 'All statuses' || applicant.status === status;
    const matchesDepartment = department === 'All departments' || applicant.department === department;
    const searchable = `${applicant.name} ${applicant.position} ${applicant.skills.join(' ')} ${applicant.email}`.toLowerCase();
    return matchesStatus && matchesDepartment && searchable.includes(query.toLowerCase());
  }), [applicants, department, query, status]);

  const applicantStats = [
    { label: 'Applications', value: applicants.length, trend: 'Live API records' },
    { label: 'Submitted', value: applicants.filter((applicant) => applicant.status === 'Submitted').length, trend: 'Live application status' },
    { label: 'In review', value: applicants.filter((applicant) => ['Under Review', 'Interviewing'].includes(applicant.status)).length, trend: 'Live application status' },
    { label: 'Decisions', value: applicants.filter((applicant) => ['Accepted', 'Rejected', 'Withdrawn'].includes(applicant.status)).length, trend: 'Live application status' },
  ];

  return (
    <>
      <header className="page-header"><div><p className="eyebrow">People operations</p><h1>Recruitment</h1><p>Review applications, assess candidates, and keep hiring activity organized.</p></div></header>
      {error && <p className="auth-error" role="alert">Unable to load recruitment applications: {error}</p>}
      {loading ? <div className="auth-loading">Loading recruitment applications…</div> : (
        <>
          <section className="stat-grid" aria-label="Recruitment summary">{applicantStats.map((stat) => <StatCard key={stat.label} {...stat} />)}</section>
          <section className="recruitment-section"><div className="section-heading"><h2>Applications</h2><span>{visibleApplicants.length} results</span></div><div className="filter-bar"><label className="search-box"><span className="sr-only">Search applicants</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search applicants, roles, or skills..." /></label><select className="filter-select" value={department} onChange={(event) => setDepartment(event.target.value)} aria-label="Filter by department">{departments.map((item) => <option key={item}>{item}</option>)}</select><select className="filter-select" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by application status"><option>All statuses</option>{applicationStatuses.map((item) => <option key={item}>{item}</option>)}</select></div><div className="applicant-grid">{visibleApplicants.map((applicant) => <ApplicantCard key={applicant.id} applicant={applicant} />)}{visibleApplicants.length === 0 && <p className="empty-state">No applications are available for this view.</p>}</div></section>
          <section className="section-grid"><article className="card"><div className="card-header"><h2>Pipeline</h2><span>Current status distribution</span></div><div className="card-body pipeline-list">{applicationStatuses.map((item) => { const count = applicants.filter((applicant) => applicant.status === item).length; return <div key={item}><span>{item}</span><div className="progress-track"><span style={{ width: `${applicants.length ? (count / applicants.length) * 100 : 0}%` }} /></div><strong>{count}</strong></div>; })}</div></article><article className="card"><div className="card-header"><h2>Recent activity</h2><span>From application records</span></div><div className="card-body list-stack"><p className="empty-state">Recruitment activity records are not available from the current API.</p></div></article></section>
        </>
      )}
    </>
  );
}
