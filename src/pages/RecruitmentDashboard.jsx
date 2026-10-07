import { useEffect, useMemo, useState } from 'react';
import ApplicantCard from '../components/ApplicantCard';
import StatCard from '../components/StatCard';
import { applicants as demoApplicants, applicationStatuses } from '../data/recruitment';
import { getApplications } from '../services/domainsApi';

function mapApplication(application) {
  return {
    ...application,
    name: application.candidateName,
    email: application.candidateEmail,
    position: application.position,
    department: application.department?.name || application.department || 'Unknown department',
    skills: application.skills || [],
    experience: application.experience || 'Not provided',
    portfolio: application.portfolio || '',
    applied: application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : 'Recently',
    summary: application.notes || 'No application summary has been provided.',
    status: application.status === 'Under Review' ? 'Reviewing' : application.status,
  };
}

export default function RecruitmentDashboard() {
  const [applicants, setApplicants] = useState(demoApplicants);
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
        if (active && response.applications?.length) setApplicants(response.applications.map(mapApplication));
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
    { label: 'Total applicants', value: applicants.length, trend: 'Live roster when available' },
    { label: 'New', value: applicants.filter((applicant) => applicant.status === 'New').length, trend: 'Needs review' },
    { label: 'In process', value: applicants.filter((applicant) => ['Reviewing', 'Shortlisted', 'Interview'].includes(applicant.status)).length, trend: 'Active review' },
    { label: 'Final decisions', value: applicants.filter((applicant) => ['Accepted', 'Rejected'].includes(applicant.status)).length, trend: 'Closed' },
  ];

  return (
    <>
      <header className="page-header"><div><p className="eyebrow">People operations</p><h1>Recruitment</h1><p>Review applications, assess candidates, and keep hiring activity organized.</p></div><button className="button primary" type="button">Invite candidate</button></header>
      {error && <p className="auth-error" role="alert">Unable to load recruitment applications: {error}. Showing the existing roster.</p>}
      {loading ? <div className="auth-loading">Loading recruitment applications…</div> : (
        <>
          <section className="stat-grid" aria-label="Recruitment summary">{applicantStats.map((stat) => <StatCard key={stat.label} {...stat} />)}</section>
          <section className="recruitment-section"><div className="section-heading"><h2>Applicants</h2><span>{visibleApplicants.length} results</span></div><div className="filter-bar"><label className="search-box"><span className="sr-only">Search applicants</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search applicants, roles, or skills..." /></label><select className="filter-select" value={department} onChange={(event) => setDepartment(event.target.value)} aria-label="Filter by department">{departments.map((item) => <option key={item}>{item}</option>)}</select><select className="filter-select" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by application status"><option>All statuses</option>{applicationStatuses.map((item) => <option key={item}>{item}</option>)}</select></div><div className="applicant-grid">{visibleApplicants.map((applicant) => <ApplicantCard key={applicant.id} applicant={applicant} />)}</div></section>
          <section className="section-grid"><article className="card"><div className="card-header"><h2>Pipeline</h2><span>Current status distribution</span></div><div className="card-body pipeline-list">{applicationStatuses.map((item) => <div key={item}><span>{item}</span><div className="progress-track"><span style={{ width: `${(applicants.filter((applicant) => applicant.status === item).length / applicants.length) * 100}%` }} /></div><strong>{applicants.filter((applicant) => applicant.status === item).length}</strong></div>)}</div></article><article className="card"><div className="card-header"><h2>Recent activity</h2><span>Live timeline when available</span></div><div className="card-body list-stack"><div className="list-row"><span className="avatar small">NL</span><div className="list-main"><strong>Noah Williams</strong><span>Moved to shortlisted</span></div><span className="meta-text">Today</span></div><div className="list-row"><span className="avatar small">SM</span><div className="list-main"><strong>Sofia Martinez</strong><span>Started interview</span></div><span className="meta-text">Yesterday</span></div><div className="list-row"><span className="avatar small">JP</span><div className="list-main"><strong>Jordan Lee</strong><span>Application submitted</span></div><span className="meta-text">Sep 18</span></div></div></article></section>
        </>
      )}
    </>
  );
}
