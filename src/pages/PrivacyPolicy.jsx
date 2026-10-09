import { Link } from 'react-router-dom';
import aegisForgeLogo from '../assets/home-logo.jpg';
import { PRIVACY_POLICY_VERSION } from '../../shared/privacyPolicy.js';
import '../styles/privacy.css';

const sections = [
  {
    title: 'Information we may collect',
    paragraphs: [
      'The information collected depends on the feature you use. Contact requests may include your name, email address, subject, selected department, and message. Team applications may include the contact details, role information, links, and answers you submit. A resume file selected in the current application form is not uploaded or stored.',
      'When you create or use an account, we process account information and the authentication and security information needed to operate it. Technical details such as request IP address and user-agent may be recorded for security and activity accountability.',
    ],
  },
  {
    title: 'How information is used',
    paragraphs: [
      'Information may be used to process contact requests and team applications; communicate with applicants and users; provide and maintain the platform; authenticate accounts; verify email addresses; facilitate password recovery; maintain security; prevent abuse; and keep appropriate activity and accountability records.',
      'Information may also support the organization’s operational planning and improvement of its services.',
    ],
  },
  {
    title: 'Email communications',
    paragraphs: [
      'AEGIS FORGE SYSTEM may send transactional email for contact notifications, email verification, password reset, and other communications necessary to respond to a request or operate an account. Transactional email is sent through the configured provider, Resend.',
    ],
  },
  {
    title: 'Data sharing',
    paragraphs: [
      'We do not sell personal information. Information may be processed by service providers needed to operate the platform, including the database provider and transactional email provider, where applicable. Those providers process information to support the requested service.',
    ],
  },
  {
    title: 'Security',
    paragraphs: [
      'Reasonable technical and organizational measures are used to protect information from unauthorized access, loss, misuse, or alteration. No method of storage or transmission can be guaranteed to be completely secure.',
    ],
  },
  {
    title: 'Data retention',
    paragraphs: [
      'Information is retained only as long as reasonably necessary for the purpose for which it was collected, legitimate operational and security requirements, legal obligations, or other applicable requirements.',
    ],
  },
  {
    title: 'Your requests',
    paragraphs: [
      'You may contact AEGIS FORGE to ask about, access, correct, or request deletion of information, subject to applicable requirements. Use the public contact form and select “General inquiry” so your request can be directed appropriately.',
    ],
  },
  {
    title: 'Cookies and sessions',
    paragraphs: [
      'The application may use cookies necessary for authentication and session functionality. These cookies support sign-in and account security.',
    ],
  },
  {
    title: 'Policy updates',
    paragraphs: [
      'This Privacy Policy may be updated when necessary. The current version will be published on this page, along with its version number.',
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <main className="privacy-page">
      <header className="privacy-header">
        <Link className="privacy-brand" to="/" aria-label="AEGIS FORGE SYSTEM home">
          <img className="privacy-brand-logo" src={aegisForgeLogo} alt="AEGIS FORGE SYSTEM logo" />
          <span><strong>AEGIS FORGE</strong><small>SYSTEM</small></span>
        </Link>
        <nav aria-label="Public navigation">
          <Link to="/">Home</Link>
          <Link to="/work-with-us">Careers</Link>
          <Link to="/login">Login</Link>
        </nav>
      </header>

      <article className="privacy-document">
        <div className="privacy-eyebrow"><span>PUBLIC INFORMATION</span><span>VERSION {PRIVACY_POLICY_VERSION}</span></div>
        <h1>Privacy Policy</h1>
        <p className="privacy-intro">This policy explains how AEGIS FORGE SYSTEM handles information submitted through its public forms and information needed to operate authenticated accounts.</p>
        <p className="privacy-effective">Last updated October 7, 2026</p>

        <div className="privacy-sections">
          {sections.map((section, index) => (
            <section className="privacy-section" key={section.title}>
              <span className="privacy-section-number">{String(index + 1).padStart(2, '0')}</span>
              <div><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
            </section>
          ))}
        </div>

        <section className="privacy-contact" aria-labelledby="privacy-contact-title">
          <span className="privacy-section-number">10</span>
          <div><h2 id="privacy-contact-title">Contact</h2><p>For privacy questions or data requests, use the public contact form and choose “General inquiry.”</p><Link to="/#contact">Go to contact form <span aria-hidden="true">↗</span></Link></div>
        </section>
      </article>

      <footer className="privacy-footer"><Link to="/">AEGIS FORGE SYSTEM</Link><span>Collaborative technology, built together.</span><Link to="/privacy">Privacy Policy</Link></footer>
    </main>
  );
}