import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button';
import { positions } from '../data/recruitment';

export default function ApplicationForm() {
  const { positionId } = useParams();
  const position = positions.find((item) => item.id === positionId) ?? positions[0];
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (<section className="card application-confirmation"><div className="card-body"><span className="confirmation-icon">✓</span><p className="eyebrow">Application received</p><h1>Thank you for applying.</h1><p>Your application for {position.title} has been received. Our recruitment team will review it and follow up through the email address you provided.</p><Link to="/work-with-us"><Button variant="primary">Return to open roles</Button></Link></div></section>);
  }

  return (
    <>
      <header className="page-header"><div><p className="eyebrow">Recruitment</p><h1>Apply for {position.title}</h1><p>{position.department} · {position.location} · {position.employment}</p></div></header>
      <section className="application-layout"><article className="card"><div className="card-header"><h2>Application details</h2><span>All fields are demo-only</span></div><form className="card-body application-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}><div className="form-row"><label><span>Full name</span><input name="name" required placeholder="Your full name" /></label><label><span>Email address</span><input name="email" type="email" required placeholder="you@example.com" /></label></div><div className="form-row"><label><span>Phone</span><input name="phone" type="tel" placeholder="+1 555 000 0000" /></label><label><span>Current role</span><input name="currentRole" placeholder="Your current position" /></label></div><label><span>Portfolio</span><input name="portfolio" type="url" placeholder="GitHub, LinkedIn, or portfolio URL" /></label><label><span>LinkedIn URL</span><input name="linkedin" type="url" placeholder="https://www.linkedin.com/in/yourname" /></label><label><span>CV or resume</span><div className="file-upload"><span>◇</span><input name="cv" type="file" accept=".pdf,.doc,.docx" /><strong>Choose a CV to upload</strong><small>Demo UI only — no file is stored.</small></div></label><label><span>Why are you a good fit?</span><textarea name="message" rows="5" required placeholder="Share your experience and the value you would bring to AEGIS FORGE." /></label><div className="form-actions"><Link to={`/work-with-us/${position.id}`}><Button type="button" variant="secondary">Back</Button></Link><Button variant="primary" type="submit">Submit application</Button></div></form></article><aside className="detail-sidebar"><article className="card"><div className="card-header"><h2>Position</h2></div><div className="card-body detail-list"><div><span>Department</span><strong>{position.department}</strong></div><div><span>Location</span><strong>{position.location}</strong></div><div><span>Employment</span><strong>{position.employment}</strong></div><div><span>Salary</span><strong>{position.salary}</strong></div></div></article><article className="card"><div className="card-header"><h2>Application notes</h2></div><div className="card-body"><p className="empty-state-copy">This demo does not send email or store applications.</p></div></article></aside></section>
    </>
  );
}
