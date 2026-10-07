import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import { submitApplication } from '../services/applicationApi';
import { publicDepartments } from '../data/publicDepartments';
import { positions } from '../data/recruitment';

export default function ApplicationForm() {
  const { positionId } = useParams();
  const [searchParams] = useSearchParams();
  const requestedDepartmentCode = searchParams.get('departmentCode');
  const initialDepartment = publicDepartments.find((item) => item.code === requestedDepartmentCode);
  const [selectedPositionId, setSelectedPositionId] = useState(positionId || '');
  const [applicationType, setApplicationType] = useState(positionId ? 'position' : initialDepartment && !positions.some((item) => item.departmentCode === initialDepartment.code) ? 'talent' : 'position');
  const [selectedDepartmentCode, setSelectedDepartmentCode] = useState(initialDepartment?.code || publicDepartments[0].code);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const position = positions.find((item) => item.id === selectedPositionId);
  const activePosition = applicationType === 'position' ? position : null;

  if (positionId && !position) {
    return <section className="empty-state"><div><span className="empty-state-icon">ROLE</span><h3>Position not found</h3><p>This role may no longer be available.</p><Link to="/work-with-us"><Button variant="primary">Return to open roles</Button></Link></div></section>;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (applicationType === 'position' && !position) {
      setError('Select an available position before submitting your application.');
      return;
    }
    if (applicationType === 'talent' && !publicDepartments.some((item) => item.code === selectedDepartmentCode)) {
      setError('Select a department before submitting your application.');
      return;
    }
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    try {
      const result = await submitApplication({
        ...(applicationType === 'talent' ? { applicationType: 'talent', departmentCode: selectedDepartmentCode } : { positionId: position.id }),
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        portfolio: formData.get('portfolio'),
        linkedin: formData.get('linkedin'),
        message: formData.get('message'),
        privacyConsent,
      });
      setConfirmation(result.message || 'Your application was submitted successfully.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to submit your application. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmation) {
    return <section className="card application-confirmation"><div className="card-body"><span className="confirmation-icon">✓</span><p className="eyebrow">Application submitted</p><h1>Thank you for applying.</h1><p>{applicationType === 'talent' ? `Your profile was submitted to the ${publicDepartments.find((item) => item.code === selectedDepartmentCode)?.name} talent network for future opportunities.` : `Your application for ${activePosition.title} was accepted by the application service.`}</p><p>{confirmation}</p><Link to="/work-with-us"><Button variant="primary">Return to open roles</Button></Link></div></section>;
  }

  return (
    <>
      <header className="page-header"><div><p className="eyebrow">Recruitment</p><h1>{activePosition ? `Apply for ${activePosition.title}` : applicationType === 'talent' ? 'Join our talent network' : 'Apply for a role'}</h1><p>{activePosition ? `${activePosition.department} · ${activePosition.location} · ${activePosition.employment}` : applicationType === 'talent' ? 'Share your profile for consideration for future opportunities. A submission is not a guarantee of a role.' : 'Select an available role or submit your profile for future opportunities.'}</p></div></header>
      <section className="application-layout">
        <article className="card">
          <div className="card-header"><h2>Application details</h2></div>
          <form className="card-body application-form" onSubmit={handleSubmit}>
            {!positionId && <label><span>Application type</span><select value={applicationType} onChange={(event) => setApplicationType(event.target.value)}><option value="position">Open position</option><option value="talent">Talent network (future opportunities)</option></select></label>}
            {!positionId && applicationType === 'position' && <label><span>Position</span><select value={selectedPositionId} onChange={(event) => setSelectedPositionId(event.target.value)} required><option value="">Select a position</option>{positions.map((item) => <option key={item.id} value={item.id}>{item.title} · {item.department}</option>)}</select></label>}
            {!positionId && applicationType === 'talent' && <label><span>Department</span><select value={selectedDepartmentCode} onChange={(event) => setSelectedDepartmentCode(event.target.value)} required>{publicDepartments.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label>}
            <div className="form-row"><label><span>Full name</span><input name="name" autoComplete="name" required maxLength="160" placeholder="Your full name" /></label><label><span>Email address</span><input name="email" type="email" autoComplete="email" required maxLength="254" placeholder="you@example.com" /></label></div>
            <label><span>Phone</span><input name="phone" type="tel" maxLength="30" placeholder="Phone number (optional)" /></label>
            <label><span>Portfolio URL</span><input name="portfolio" type="url" maxLength="500" placeholder="https:// (optional)" /></label>
            <label><span>LinkedIn URL</span><input name="linkedin" type="url" maxLength="500" placeholder="https:// (optional)" /></label>
            <label><span>Why are you a good fit?</span><textarea name="message" rows="5" required maxLength="5000" placeholder="Share your relevant experience." /></label>
            <label className="privacy-consent"><input type="checkbox" checked={privacyConsent} onChange={(event) => setPrivacyConsent(event.target.checked)} required /><span>I agree to the <Link to="/privacy">Privacy Policy</Link> and consent to the processing of my information for this application.</span></label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <div className="form-actions"><Link to={activePosition ? `/work-with-us/${activePosition.id}` : '/work-with-us'}><Button type="button" variant="secondary">Back</Button></Link><Button variant="primary" type="submit" disabled={submitting || !privacyConsent}>{submitting ? 'Submitting…' : 'Submit application'}</Button></div>
          </form>
        </article>
        {activePosition && <aside className="detail-sidebar"><article className="card"><div className="card-header"><h2>Position</h2></div><div className="card-body detail-list"><div><span>Department</span><strong>{activePosition.department}</strong></div><div><span>Location</span><strong>{activePosition.location}</strong></div><div><span>Employment</span><strong>{activePosition.employment}</strong></div><div><span>Salary</span><strong>{activePosition.salary}</strong></div></div></article></aside>}
      </section>
    </>
  );
}
