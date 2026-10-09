import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import aegisForgeLogo from '../assets/home-logo.jpg';
import { publicDepartments } from '../data/publicDepartments.js';
import { submitContactMessage } from '../services/contactApi';
import '../styles/landing.css';
import '../styles/privacyConsent.css';

const capabilities = [
  ['01', 'Web development', 'Thoughtful web experiences, platforms, and services.'],
  ['02', 'Mobile development', 'Useful products shaped for people on the move.'],
  ['03', 'UI/UX design', 'Clear, accessible interfaces grounded in real needs.'],
  ['04', 'Hardware & technology', 'Ideas explored through practical technology projects.'],
  ['05', 'Quality assurance', 'Careful testing that makes products more dependable.'],
  ['06', 'DevOps & infrastructure', 'Reliable foundations for building and delivery.'],
  ['07', 'Research & development', 'Exploration that turns questions into new possibilities.'],
  ['08', 'Product & project management', 'Direction, planning, and coordination from idea to launch.'],
  ['09', 'Marketing & social media', 'Communicating products and connecting with communities.'],
  ['10', 'Business & client relations', 'Partnerships that connect real needs to useful outcomes.'],
];

const workflow = ['Idea / client need', 'Planning', 'Design', 'Development', 'Testing / QA', 'Deployment', 'Continuous improvement'];

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
    try {
      const result = await submitContactMessage({
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        departmentCode: formData.get('department'),
        message: formData.get('message'),
        privacyConsent: formData.get('privacyConsent') === 'true',
      });
      setFormState('success');
      setFormMessage(result.message || 'Your message was sent to the selected team.');
      form.reset();
    } catch {
      setFormState('error');
      setFormMessage('We could not send your message right now. Please try again later.');
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

        <button className="landing-menu-toggle" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          <span /><span />
        </button>

        <nav className={`landing-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Public navigation">
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/about" onClick={closeMenu}>About</Link>
          <a href="#capabilities" onClick={closeMenu}>What We Do</a>
          <a href="#departments" onClick={closeMenu}>Field Operations</a>
          <Link to="/about#principles" onClick={closeMenu}>Principles</Link>
          <Link to="/work-with-us" onClick={closeMenu}>Work With Us</Link>
          <a className="landing-nav-contact" href="#contact" onClick={closeMenu}>Contact</a>
          <Link className="landing-login" to="/register" onClick={closeMenu}>Register</Link>
          <Link className="landing-login" to="/login" onClick={closeMenu}>Login <Icon name="arrow" size={15} /></Link>
        </nav>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <img className="landing-hero-image" src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=2200&q=85" alt="A team collaborating around a shared workspace" fetchpriority="high" />
        <div className="landing-hero-shade" />
        <div className="landing-hero-content">
          <p className="landing-kicker"><span /> Technology, built together</p>
          <h1 id="landing-title">AEGIS<br /><span>FORGE</span> SYSTEM</h1>
          <p className="landing-hero-lede">Different disciplines. Shared momentum. Digital products built to make a difference.</p>
          <p className="landing-hero-copy">We bring technical, creative, product, and business minds together to shape, build, test, and deliver useful technology.</p>
          <div className="landing-hero-actions">
            <Link className="landing-button landing-button-primary" to="/work-with-us">Join the Team <Icon name="arrow" size={17} /></Link>
            <a className="landing-button landing-button-quiet" href="#contact">Contact Us <span aria-hidden="true">↘</span></a>
            <Link className="landing-button landing-button-quiet" to="/register">Create Account</Link>
          </div>
        </div>
        <div className="landing-hero-caption"><span>One team, many points of view</span><span>Build · Learn · Improve</span></div>
        <a className="landing-scroll-cue" href="#about" aria-label="Scroll to learn about AEGIS FORGE"><span /></a>
      </section>

      <section className="landing-intro landing-section" id="about">
        <div className="landing-section-label"><span>01</span> About AEGIS FORGE SYSTEM</div>
        <div className="landing-intro-copy">
          <h2>Privately owned. Nigerian. Engineering-led.</h2>
          <div>
            <p>AEGIS FORGE SYSTEM is a privately owned Nigerian defence technology organization focused on designing, engineering, prototyping, and retaining ownership of proprietary hardware, software, and field systems.</p>
            <p>We believe technological sovereignty begins with the ability to build what we depend on. We bring together engineers, programmers, cybersecurity specialists, field operators, and technical builders to develop technology for demanding operational environments.</p>
            <p>We design. We engineer. We prototype. We own what we build.</p>
            <Link className="landing-button landing-button-quiet landing-about-cta" to="/about">READ OUR STORY <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <div className="landing-values" aria-label="How we work"><span>Independent</span><i /><span>Technological sovereignty</span><i /><span>Proprietary systems</span></div>
      </section>

      <section className="landing-capabilities landing-section" id="capabilities">
        <div className="landing-section-heading">
          <div><div className="landing-section-label"><span>02</span> What we do</div><h2>From first sketch<br />to finished product.</h2></div>
          <p>We connect the skills needed to explore, create, and deliver technology that serves real people and real needs.</p>
        </div>
        <div className="landing-capability-grid">
          {capabilities.map(([number, title, description]) => (
            <article className="landing-capability" key={number}>
              <span className="landing-capability-number">{number}</span>
              <div><h3>{title}</h3><p>{description}</p></div>
              <span className="landing-capability-mark" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-departments landing-section" id="departments">
        <div className="landing-section-heading">
          <div><div className="landing-section-label"><span>03</span> Our disciplines</div><h2>Ten teams of<br />specialists. One forge.</h2></div>
          <p>Each department brings a distinct perspective. Together, they make room for the full journey from opportunity to outcome.</p>
        </div>
        <ol className="landing-department-list">
          {publicDepartments.map((department, index) => (
            <li key={department.code}><span>{String(index + 1).padStart(2, '0')}</span><strong>{department.name}</strong><Icon name="arrow" size={16} /></li>
          ))}
        </ol>
      </section>

      <section className="landing-workflow landing-section" id="approach">
        <div className="landing-section-heading">
          <div><div className="landing-section-label"><span>04</span> How we work</div><h2>Progress, made<br />together.</h2></div>
          <p>A clear, adaptable path keeps ideas connected to the people they are meant to help.</p>
        </div>
        <ol className="landing-workflow-list">
          {workflow.map((step, index) => (
            <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><strong>{step}</strong>{index < workflow.length - 1 && <i aria-hidden="true" />}</li>
          ))}
        </ol>
        <p className="landing-workflow-note">Learn as we go. Improve with every release.</p>
      </section>

      <section className="landing-join" id="join">
        <div className="landing-join-mark" aria-hidden="true">AF<span>↗</span></div>
        <div className="landing-join-copy"><p className="landing-section-label"><span>05</span> Join the team</p><h2>Bring your craft.<br />Build what matters.</h2><p>We welcome people with technical, creative, product, marketing, and business skills who want to make useful things together.</p></div>
        <Link className="landing-button landing-button-light" to="/work-with-us">Explore Opportunities <Icon name="arrow" size={17} /></Link>
      </section>

      <section className="landing-contact landing-section" id="contact">
        <div className="landing-contact-copy">
          <div className="landing-section-label"><span>06</span> Contact us</div>
          <h2>Have a good question?<br /><em>Let’s start there.</em></h2>
          <p>Tell us what you are looking to build, explore, or improve. Choose the team closest to your needs and we’ll direct your inquiry to that department.</p>
          <div className="landing-contact-note"><span aria-hidden="true">↗</span><span>Looking for your next team? <Link to="/work-with-us">Explore open opportunities</Link></span></div>
        </div>

        <form className="landing-contact-form" onSubmit={submitContact}>
          <div className="landing-form-row">
            <label>Name<input name="name" autoComplete="name" required placeholder="Your name" /></label>
            <label>Email<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
          </div>
          <label>Subject<input name="subject" required placeholder="What would you like to discuss?" /></label>
          <label>Department / reason for contact
            <select name="department" defaultValue="" required>
              <option value="" disabled>Select a team</option>
              {publicDepartments.map((department) => <option key={department.code} value={department.code}>{department.name}</option>)}
              <option value="GENERAL">General inquiry</option>
            </select>
          </label>
          <label>Message<textarea name="message" rows="4" required placeholder="A little context helps us understand what you need." /></label>
          <label className="privacy-consent"><input type="checkbox" name="privacyConsent" value="true" required /><span>I agree to the <Link to="/privacy">Privacy Policy</Link> and consent to the processing of my information for this submission.</span></label>
          <div className="landing-form-submit"><button type="submit" disabled={formState === 'sending'}>{formState === 'sending' ? 'Sending…' : 'Send inquiry'}{formState !== 'sending' && <Icon name="arrow" size={16} />}</button><span>We’ll direct your note to the selected team.</span></div>
          {formMessage && <p className={`landing-form-message ${formState}`} role={formState === 'error' ? 'alert' : 'status'}>{formMessage}</p>}
        </form>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-brand"><Link className="landing-brand" to="/" aria-label="AEGIS FORGE SYSTEM home"><img className="landing-brand-logo" src={aegisForgeLogo} alt="AEGIS FORGE SYSTEM logo" /><span><strong>AEGIS FORGE</strong><small>SYSTEM</small></span></Link><p>A collaborative technology organization building useful digital products and services.</p></div>
        <div className="landing-footer-nav"><strong>Explore</strong><a href="#about">About</a><a href="#capabilities">What we do</a><a href="#departments">Departments</a><Link to="/work-with-us">Join the team</Link></div>
        <div className="landing-footer-nav"><strong>Connect</strong><a href="#contact">Contact</a><Link to="/work-with-us">Opportunities</Link><Link to="/privacy">Privacy Policy</Link><Link to="/login">Team login</Link></div>
        <div className="landing-footer-bottom"><span>© {new Date().getFullYear()} AEGIS FORGE SYSTEM</span><span>Built by people, for people.</span></div>
      </footer>
    </main>
  );
}