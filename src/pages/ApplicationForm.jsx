import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { submitApplication } from '../services/applicationApi';
import { positions } from '../data/recruitment';

export default function ApplicationForm() {
  const { positionId } = useParams();
  const [selectedPositionId, setSelectedPositionId] = useState(positionId || '');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const position = positions.find((item) => item.id === selectedPositionId);

  if (positionId && !position) {
    return <section className="empty-state"><div><span className="empty-state-icon">ROLE</span><h3>Position not found</h3><p>This role may no longer be available.</p><Link to="/work-with-us"><Button variant="primary">Return to open roles</Button></Link></div></section>;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!position) {
      setError('Select an available position before submitting your application.');
      return;
    }
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    try {
      const result = await submitApplication({
        positionId: position.id,
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
    return <section className="card application-confirmation"><div className="card-body"><span className="confirmation-icon">✓</span><p className="eyebrow">Application submitted</p><h1>Thank you for applying.</h1><p>Your application for {position.title} was accepted by the application service.</p><p>{confirmation}</p><Link to="/work-with-us"><Button variant="primary">Return to open roles</Button></Link></div></section>;
  }

  return (
    <>
      <header className="page-header"><div><p className="eyebrow">Recruitment</p><h1>{position ? `Apply for ${position.title}` : 'Apply for a role'}</h1><p>{position ? `${position.department} · ${position.location} · ${position.employment}` : 'Select an available role and submit your application.'}</p></div></header>
      <section className="application-layout">
        <article className="card">
          <div className="card-header"><h2>Application details</h2></div>
          <form className="card-body application-form" onSubmit={handleSubmit}>
            {!positionId && <label><span>Position</span><select value={selectedPositionId} onChange={(event) => setSelectedPositionId(event.target.value)} required><option value="">Select a position</option>{positions.map((item) => <option key={item.id} value={item.id}>{item.title} · {item.department}</option>)}</select></label>}
            <div className="form-row"><label><span>Full name</span><input name="name" autoComplete="name" required maxLength="160" placeholder="Your full name" /></label><label><span>Email address</span><input name="email" type="email" autoComplete="email" required maxLength="254" placeholder="you@example.com" /></label></div>
            <label><span>Phone</span><input name="phone" type="tel" maxLength="30" placeholder="Phone number (optional)" /></label>
            <label><span>Portfolio URL</span><input name="portfolio" type="url" maxLength="500" placeholder="https:// (optional)" /></label>
            <label><span>LinkedIn URL</span><input name="linkedin" type="url" maxLength="500" placeholder="https:// (optional)" /></label>
            <label><span>Why are you a good fit?</span><textarea name="message" rows="5" required maxLength="5000" placeholder="Share your relevant experience." /></label>
            <label className="privacy-consent"><input type="checkbox" checked={privacyConsent} onChange={(event) => setPrivacyConsent(event.target.checked)} required /><span>I agree to the <Link to="/privacy">Privacy Policy</Link> and consent to the processing of my information for this application.</span></label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <div className="form-actions"><Link to={position ? `/work-with-us/${position.id}` : '/work-with-us'}><Button type="button" variant="secondary">Back</Button></Link><Button variant="primary" type="submit" disabled={submitting || !privacyConsent}>{submitting ? 'Submitting…' : 'Submit application'}</Button></div>
          </form>
        </article>
        {position && <aside className="detail-sidebar"><article className="card"><div className="card-header"><h2>Position</h2></div><div className="card-body detail-list"><div><span>Department</span><strong>{position.department}</strong></div><div><span>Location</span><strong>{position.location}</strong></div><div><span>Employment</span><strong>{position.employment}</strong></div><div><span>Salary</span><strong>{position.salary}</strong></div></div></article></aside>}
      </section>
    </>
  );
}
