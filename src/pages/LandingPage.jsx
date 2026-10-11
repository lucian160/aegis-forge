import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import aegisForgeLogo from '../assets/home-logo.jpg';
import { aboutContent } from '../data/about.js';
import { contactDepartmentPreferences, contactEnquiryTypes } from '../../shared/contactOptions.js';
import { submitContactMessage } from '../services/contactApi';
import '../styles/landing.css';
import '../styles/privacyConsent.css';

const capabilities = [
  {
    number: '01',
    title: 'Digital Technology',
    departments: ['Software and AI', 'Web Development', 'Programmers'],
    description: 'Digital products, software implementation, and applied AI.',
  },
  {
    number: '02',
    title: 'Engineering and Systems',
    departments: ['Hardware and Systems', 'CAD', 'Mechanical Engineering'],
    description: 'Physical systems, technical design, and mechanical problem-solving.',
  },
  {
    number: '03',
    title: 'Security and Reliability',
    departments: ['Cybersecurity', 'Quality Assurance'],
    description: 'Defensive security practices, testing, and validation.',
  },
  {
    number: '04',
    title: 'Implementation and Growth',
    departments: ['Field Operations', 'Marketing'],
    description: 'Field implementation and communication about the organisation’s work.',
  },
];

const workflow = [
  { title: 'Discover', description: 'Understand the need, context, and constraints.' },
  { title: 'Plan', description: 'Clarify priorities and agree the project scope.' },
  { title: 'Design and Build', description: 'Develop an approach and create the proposed solution.' },
  { title: 'Test and Validate', description: 'Check the work against agreed requirements.' },
  { title: 'Deploy and Improve', description: 'Deploy when in scope, then use feedback to guide improvements.' },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const [formState, setFormState] = useState('idle');
  const submittingRef = useRef(false);

  const closeMenu = () => setMenuOpen(false);
  const submitContact = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setFormState('sending');
    setFormMessage('');
    const form = event.currentTarget;
    const formData = new FormData(form);
    const organisation = String(formData.get('organisation') || '').trim();
    const enquiryType = String(formData.get('enquiryType') || '');
    const budgetTimeline = String(formData.get('budgetTimeline') || '').trim();
    const description = String(formData.get('message') || '').trim();
    try {
      const result = await submitContactMessage({
        name: formData.get('name'),
        email: formData.get('email'),
        subject: enquiryType,
        departmentCode: 'GENERAL',
        organization: organisation,
        enquiryType,
        preferredDepartment: formData.get('preferredDepartment'),
        budgetTimeline,
        message: description,
        privacyConsent: formData.get('privacyConsent') === 'true',
      });
      setFormState('success');
      setFormMessage(result.message || 'Your enquiry was sent.');
      form.reset();
    } catch (error) {
      setFormState('error');
      setFormMessage(error?.status
        ? error.message
        : 'We could not send your message right now. Please try again later.');
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <main className="landing-page">
      <header className="landing-header">
        <Link className="landing-brand" to="/" aria-label="AEGIS FORGE SYSTEM home" onClick={closeMenu}>
          <img className="landing-brand-logo" src={aegisForgeLogo} alt="AEGIS FORGE SYSTEM logo" />
          <span><strong>AEGIS FORGE</strong><small>SYSTEM</small></span>
        </Link>

        <button className="landing-menu-toggle" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="landing-public-navigation" onClick={() => setMenuOpen((open) => !open)}>
          <span /><span />
        </button>

        <nav id="landing-public-navigation" className={`landing-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Public navigation">
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/about" onClick={closeMenu}>About</Link>
          <a href="#capabilities" onClick={closeMenu}>Capabilities</a>
          <a href="#faq" onClick={closeMenu}>FAQ</a>
          <a href="#departments" onClick={closeMenu}>Departments</a>
          <a href="#projects" onClick={closeMenu}>Projects</a>
          <Link to="/work-with-us" onClick={closeMenu}>Work With Us</Link>
          <a className="landing-nav-contact" href="#contact" onClick={closeMenu}>Contact</a>
          <Link className="landing-login" to="/register" onClick={closeMenu}>Register</Link>
          <Link className="landing-login" to="/login" onClick={closeMenu}>Login <Icon name="arrow" size={15} /></Link>
        </nav>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-visual" aria-hidden="true">
          <div className="landing-visual-frame">
            <div className="landing-visual-topline"><span>AEGIS FORGE SYSTEM</span><span>01 / 04</span></div>
            <svg className="landing-visual-network" viewBox="0 0 520 520" fill="none">
              <circle cx="260" cy="260" r="190" />
              <circle cx="260" cy="260" r="142" />
              <circle cx="260" cy="260" r="82" />
              <path d="M260 178V70h-48M342 260h108v-40M260 342v108h48M178 260H70v40M202 202l-76-76h-38M318 202l76-76h38M318 318l76 76v38M202 318l-76 76H88" />
              <path d="M212 260h96M260 212v96M226 226l68 68M294 226l-68 68" />
              <circle cx="212" cy="260" r="5" />
              <circle cx="308" cy="260" r="5" />
              <circle cx="260" cy="212" r="5" />
              <circle cx="260" cy="308" r="5" />
              <circle cx="164" cy="164" r="5" />
              <circle cx="356" cy="164" r="5" />
              <circle cx="164" cy="356" r="5" />
              <circle cx="356" cy="356" r="5" />
              <circle cx="212" cy="70" r="4" />
              <circle cx="450" cy="220" r="4" />
              <circle cx="308" cy="450" r="4" />
              <circle cx="70" cy="300" r="4" />
              <circle cx="88" cy="126" r="4" />
              <circle cx="394" cy="126" r="4" />
              <circle cx="394" cy="394" r="4" />
              <circle cx="126" cy="394" r="4" />
              <circle className="landing-visual-core" cx="260" cy="260" r="29" />
            </svg>
            <span className="landing-visual-label landing-visual-label-hardware">Hardware &amp; systems</span>
            <span className="landing-visual-label landing-visual-label-software">Software &amp; AI</span>
            <span className="landing-visual-label landing-visual-label-security">Cybersecurity</span>
            <span className="landing-visual-label landing-visual-label-field">Field operations</span>
            <div className="landing-visual-footer"><span>ENGINEERING / SYSTEMS / OPERATIONS</span><span className="landing-visual-indicator" /></div>
          </div>
        </div>
        <div className="landing-hero-shade" />
        <div className="landing-hero-content">
          <p className="landing-kicker"><span /> Engineering · Technology · Systems</p>
          <h1 id="landing-title">Engineering Ideas.<br />Building Intelligent <span>Solutions.</span></h1>
          <p className="landing-hero-copy">AEGIS FORGE SYSTEM brings together technology, software, engineering, systems, security, and operational expertise to develop practical solutions.</p>
          <div className="landing-hero-actions">
            <a className="landing-button landing-button-primary" href="#contact">Start a Project <Icon name="arrow" size={17} /></a>
            <a className="landing-button landing-button-quiet" href="#capabilities">Explore Our Capabilities <Icon name="arrow" size={17} /></a>
          </div>
        </div>
        <div className="landing-hero-caption"><span>Practical engineering</span><span>Connected disciplines</span></div>
        <a className="landing-scroll-cue" href="#about" aria-label="Scroll to learn about AEGIS FORGE"><span /></a>
      </section>

      <section className="landing-intro landing-section" id="about">
        <div className="landing-section-label"><span>01</span> About us</div>
        <div className="landing-intro-copy">
          <h2>Technology, engineering and systems—built together.</h2>
          <div>
            <p>AEGIS FORGE SYSTEM is a privately owned Nigerian defence technology organization focused on designing, engineering, prototyping, and retaining ownership of proprietary hardware, software, and field systems.</p>
            <p>Its ten departments span software and AI, web development, programming, hardware and systems, CAD, mechanical engineering, cybersecurity, quality assurance, field operations, and marketing.</p>
            <p>Company material describes an aim to build local capability and address reliance on imported technology, including technology for demanding and off-grid environments. The work brings digital, physical, security, and operational disciplines together around those challenges.</p>
            <Link className="landing-button landing-button-quiet landing-about-cta" to="/about">READ OUR STORY <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <div className="landing-values" aria-label="Areas of focus"><span>Engineering-led</span><i /><span>Practical solutions</span><i /><span>Connected disciplines</span></div>
      </section>

      <section className="landing-mission landing-section" id="mission">
        <div className="landing-section-heading">
          <div><div className="landing-section-label"><span>02</span> Mission, vision, and values</div><h2>Purpose in progress.</h2></div>
          <p className="landing-review-note"><strong>Draft for team approval.</strong> The repository contains company goals and principles, but no approved mission or vision statements or recorded approval status for this wording.</p>
        </div>
        <div className="landing-statement-grid">
          <article className="landing-statement">
            <h3>Draft mission</h3>
            <p>Build Nigerian-owned hardware, software, and field systems that address practical needs and reduce dependence on imported technology.</p>
          </article>
          <article className="landing-statement">
            <h3>Draft vision</h3>
            <p>A Nigeria with the capability to design, engineer, and control the technologies it relies on.</p>
          </article>
          <article className="landing-statement landing-statement-values">
            <h3>Draft values</h3>
            <p>Adapted from principles already listed in the company profile; proposed wording still requires approval.</p>
            <ul>
              {aboutContent.principles.map((principle) => <li key={principle.number}>{principle.title}</li>)}
            </ul>
          </article>
        </div>
      </section>

      <section className="landing-capabilities landing-section" id="capabilities">
        <div className="landing-section-heading">
          <div><div className="landing-section-label"><span>03</span> Our capabilities</div><h2>Connected areas<br />of expertise.</h2></div>
          <p>These four presentation groupings organise the ten existing departments. They are not new official departments.</p>
        </div>
        <div className="landing-capability-grid">
          {capabilities.map(({ number, title, departments, description }) => (
            <article className="landing-capability" key={number}>
              <span className="landing-capability-number">{number}</span>
              <div><h3>{title}</h3><p>{description}</p><p className="landing-capability-departments">{departments.join(' · ')}</p></div>
              <span className="landing-capability-mark" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-projects landing-section" id="projects" aria-labelledby="landing-projects-title">
        <div className="landing-projects-layout">
          <div className="landing-projects-copy">
            <div className="landing-section-label"><span>04</span> Featured Projects</div>
            <h2 id="landing-projects-title">Our work, shared<br />with permission.</h2>
            <p>Public case studies will appear here when the team has approved them for sharing. We do not publish internal project records in this showcase.</p>
          </div>
          <div className="landing-projects-empty">
            <div className="landing-projects-art" aria-hidden="true">
              <span className="landing-projects-art-orbit" />
              <span className="landing-projects-art-core"><Icon name="folder" size={28} /></span>
            </div>
            <div className="landing-projects-empty-copy">
              <span className="landing-projects-status">Public showcase</span>
              <h3>No case studies available yet</h3>
              <p>For project briefs, technical collaborations, or partnership conversations, tell us what you are looking to build.</p>
              <a className="landing-button landing-button-quiet" href="#contact">Discuss a Project <Icon name="arrow" size={17} /></a>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-departments landing-section" id="departments">
        <div className="landing-section-heading">
          <div><div className="landing-section-label"><span>05</span> Our Departments</div><h2>Ten disciplines.<br />One connected forge.</h2></div>
          <p>Explore the areas of work represented across AEGIS FORGE SYSTEM. These focus areas describe the divisions and do not confirm current service availability.</p>
        </div>
        <ol className="landing-department-list">
          {aboutContent.divisions.map((division) => (
            <li key={division.number} tabIndex={0}>
              <div className="landing-department-card-top">
                <span className="landing-department-number">{division.number}</span>
                <span className="landing-department-icon"><Icon name={division.icon} size={20} /></span>
              </div>
              <h3>{division.title}</h3>
              <p>{division.description}</p>
              <p className="landing-department-areas"><span>Focus areas</span>{division.areas}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing-workflow landing-section" id="approach">
        <div className="landing-section-heading">
          <div><div className="landing-section-label"><span>06</span> How we work</div><h2>Progress, made<br />together.</h2></div>
          <p>This is an illustrative working path; the actual scope and sequence should be agreed for each project.</p>
        </div>
        <ol className="landing-workflow-list">
          {workflow.map((step, index) => (
            <li key={step.title}><span>{String(index + 1).padStart(2, '0')}</span><strong>{step.title}</strong><small>{step.description}</small>{index < workflow.length - 1 && <i aria-hidden="true" />}</li>
          ))}
        </ol>
        <p className="landing-workflow-note">Deployment is included only when agreed for the project; no delivery timeline is implied.</p>
      </section>

      <section className="landing-audience landing-section" id="who-we-serve">
        <div className="landing-section-heading">
          <div><div className="landing-section-label"><span>07</span> Who we serve</div><h2>Problems worth<br />solving locally.</h2></div>
          <p>Company material identifies technology dependence and the need for systems suited to demanding or off-grid conditions as problems it wants to address.</p>
        </div>
        <p className="landing-review-note"><strong>Suggested audiences — draft for team approval.</strong> These potential target markets are suggestions, not confirmed clients or approved business priorities.</p>
        <ul className="landing-audience-list">
          <li>Nigerian organisations exploring locally designed and owned technology.</li>
          <li>Public-sector or defence-related organisations assessing domestic technology capability.</li>
          <li>Teams working in demanding, remote, or off-grid environments.</li>
        </ul>
      </section>

      <section className="landing-collaboration landing-section" id="why-work-with-us">
        <div className="landing-section-heading">
          <div><div className="landing-section-label"><span>08</span> Why work with us</div><h2>More perspectives<br />on one problem.</h2></div>
          <p>When a challenge crosses software, hardware, security, and field use, bringing those disciplines into the same conversation can help teams consider the whole system.</p>
        </div>
        <div className="landing-collaboration-copy">
          <p>Software choices can be considered alongside hardware constraints. Design and build work can include quality checks. Field feedback can inform what gets improved next.</p>
          <p>This is the practical value of a multidisciplinary structure—not a guarantee of outcomes, availability, or delivery.</p>
        </div>
      </section>

      <section className="landing-team landing-section" id="team">
        <div className="landing-section-heading">
          <div><div className="landing-section-label"><span>09</span> Team and leadership</div><h2>People behind<br />the organisation.</h2></div>
          <p>The existing company profile lists these leadership roles. No approved photographs, skills profiles, or professional links are currently supplied.</p>
        </div>
        <ul className="landing-team-list">
          <li><div><strong>{aboutContent.founder.name}</strong><span>{aboutContent.founder.role}</span></div><Link to="/about#founder">Read founder profile <span aria-hidden="true">↗</span></Link></li>
          <li><div><strong>{aboutContent.coFounder.name}</strong><span>{aboutContent.coFounder.role}</span></div><Link to="/about#co-founder">Read co-founder profile <span aria-hidden="true">↗</span></Link></li>
        </ul>
      </section>

      <section className="landing-faq landing-section" id="faq">
        <div className="landing-section-heading">
          <div><div className="landing-section-label"><span>10</span> Frequently asked questions</div><h2>Before you<br />get in touch.</h2></div>
          <p>Answers reflect the information currently published by AEGIS FORGE SYSTEM. Unconfirmed policies are marked for team review.</p>
        </div>
        <div className="landing-faq-list">
          <details>
            <summary>What does AEGIS FORGE SYSTEM do?</summary>
            <p>It is a privately owned Nigerian defence technology organisation focused on hardware, software, and field systems. Its departments bring together digital technology, engineering, security, quality assurance, and field operations.</p>
          </details>
          <details>
            <summary>Which departments are available?</summary>
            <p>Software and AI, Web Development, Programmers, Hardware and Systems, CAD, Mechanical Engineering, Cybersecurity, Quality Assurance, Field Operations, and Marketing.</p>
          </details>
          <details>
            <summary>How do I request a project?</summary>
            <p>Use the project enquiry form below to describe the need and choose a department preference. The enquiry is submitted to the general inbox for triage; availability and project fit are not guaranteed.</p>
          </details>
          <details>
            <summary>How do collaborations work?</summary>
            <p>Potential collaborators can describe their interests in the form. The organisation brings together several technical disciplines, but no standard partnership process or terms are published.</p>
            <p className="landing-faq-review"><strong>Team review:</strong> confirm collaboration process and any formal partnership arrangements before publishing further details.</p>
          </details>
          <details>
            <summary>How do I contact a specific department?</summary>
            <p>Select your preferred department in the form. The current supported contact route sends enquiries to the general inbox and includes that preference in the message; separate direct-to-department routing is not configured for these divisions.</p>
          </details>
          <details>
            <summary>How can I enquire about joining the team?</summary>
            <p>Visit <Link to="/work-with-us">Work With Us</Link> to see the current opportunities and application options.</p>
          </details>
          <details>
            <summary>What budget, response time, and project terms should I expect?</summary>
            <p>These policies are not confirmed in the available company information. Share an optional budget or timeline in your enquiry if helpful.</p>
            <p className="landing-faq-review"><strong>Team review:</strong> confirm response expectations, engagement terms, and whether there are minimum or typical budget and timeline ranges.</p>
          </details>
        </div>
      </section>

      <section className="landing-collaboration-cta landing-section" aria-labelledby="landing-collaboration-title">
        <div>
          <div className="landing-section-label"><span>11</span> Start a conversation</div>
          <h2 id="landing-collaboration-title">Have a challenge, idea, or skill to share?</h2>
          <p>Potential clients, technical collaborators, and partners are welcome to get in touch. An enquiry starts a conversation; it does not imply a formal partnership or commitment.</p>
        </div>
        <div className="landing-collaboration-actions">
          <a className="landing-button landing-button-primary" href="#contact">Discuss a Project <Icon name="arrow" size={17} /></a>
          <Link className="landing-button landing-button-quiet" to="/work-with-us">Explore the Team <Icon name="arrow" size={17} /></Link>
        </div>
      </section>

      <section className="landing-join" id="join">
        <div className="landing-join-mark" aria-hidden="true">AF<span>↗</span></div>
        <div className="landing-join-copy"><p className="landing-section-label"><span>12</span> Join the team</p><h2>Bring your craft.<br />Build what matters.</h2><p>We welcome people with technical, creative, product, marketing, and business skills who want to make useful things together.</p></div>
        <Link className="landing-button landing-button-light" to="/work-with-us">Explore Opportunities <Icon name="arrow" size={17} /></Link>
      </section>

      <section className="landing-contact landing-section" id="contact">
        <div className="landing-contact-copy">
          <div className="landing-section-label"><span>13</span> Project enquiry</div>
          <h2>Tell us what you’re<br /><em>looking to solve.</em></h2>
          <p>Share a few details about your project or enquiry. Your message goes to the general contact inbox for triage; selecting a department records your preference but does not directly route to that division.</p>
          <p className="landing-contact-info">No public phone number, direct email address, office location, or social account is listed here. Please use this form to get in touch.</p>
          <div className="landing-contact-note"><span aria-hidden="true">↗</span><span>Looking for your next team? <Link to="/work-with-us">Explore open opportunities</Link></span></div>
        </div>

        <form className="landing-contact-form" onSubmit={submitContact} aria-describedby="landing-form-routing">
          <div className="landing-form-row">
            <label>Name<input name="name" autoComplete="name" required maxLength="100" placeholder="Your name" /></label>
            <label>Email address<input name="email" type="email" autoComplete="email" required maxLength="254" placeholder="you@example.com" /></label>
          </div>
          <label>Organisation <span className="landing-form-optional">(optional)</span><input name="organisation" autoComplete="organization" maxLength="150" placeholder="Organisation name" /></label>
          <label>Project or enquiry type
            <select name="enquiryType" defaultValue="" required>
              <option value="" disabled>Select an enquiry type</option>
              {contactEnquiryTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <label>Department preference
            <select name="preferredDepartment" defaultValue="" required>
              <option value="" disabled>Select a department</option>
              {contactDepartmentPreferences.map((department) => <option key={department} value={department}>{department}</option>)}
            </select>
            <span id="landing-form-routing" className="landing-field-note">This preference is included in your message to the general contact inbox; direct department routing is not currently configured.</span>
          </label>
          <label>Project or enquiry description<textarea name="message" rows="5" required maxLength="4000" placeholder="What are you looking to build, explore, or improve?" /></label>
          <label>Budget or timeline <span className="landing-form-optional">(optional)</span><input name="budgetTimeline" maxLength="200" placeholder="Share a range or target date if known" /></label>
          <label className="privacy-consent"><input type="checkbox" name="privacyConsent" value="true" required /><span>I agree to the <Link to="/privacy">Privacy Policy</Link> and consent to the processing of my information for this submission.</span></label>
          <div className="landing-form-submit"><button type="submit" disabled={formState === 'sending' || submittingRef.current}>{formState === 'sending' ? 'Sending…' : 'Send enquiry'}{formState !== 'sending' && <Icon name="arrow" size={16} />}</button><span>Your enquiry is sent only after the server confirms email delivery.</span></div>
          {formMessage && <p className={`landing-form-message ${formState}`} role={formState === 'error' ? 'alert' : 'status'}>{formMessage}</p>}
        </form>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-brand"><Link className="landing-brand" to="/" aria-label="AEGIS FORGE SYSTEM home"><img className="landing-brand-logo" src={aegisForgeLogo} alt="AEGIS FORGE SYSTEM logo" /><span><strong>AEGIS FORGE</strong><small>SYSTEM</small></span></Link><p>A privately owned Nigerian defence technology organisation focused on hardware, software, and field systems.</p></div>
        <div className="landing-footer-nav"><strong>Explore</strong><a href="#about">About</a><a href="#mission">Mission and values</a><a href="#capabilities">Capabilities</a><a href="#departments">Departments</a><a href="#projects">Projects</a><a href="#team">Leadership</a><a href="#faq">FAQ</a><Link to="/work-with-us">Join the team</Link></div>
        <div className="landing-footer-nav"><strong>Connect</strong><a href="#contact">Project enquiry</a><Link to="/work-with-us">Opportunities</Link><Link to="/privacy">Privacy Policy</Link><Link to="/login">Team login</Link></div>
        <div className="landing-footer-bottom"><span>© {new Date().getFullYear()} AEGIS FORGE SYSTEM</span><span>Built by people, for people.</span></div>
      </footer>
    </main>
  );
}