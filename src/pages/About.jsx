import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import aegisForgeLogo from '../assets/home-logo.jpg';
import { aboutContent } from '../data/about.js';
import '../styles/landing.css';

function SectionLabel({ value }) {
  return <div className="landing-section-label"><span>{value}</span></div>;
}

function FounderProfile({ person, featured = false }) {
  return (
    <article className={`about-profile ${featured ? 'featured' : ''}`}>
      <div className="about-portrait" aria-label={`${person.name} portrait placeholder`}>
        <span>{person.name.split(' ')[0].slice(0, 1)}</span>
      </div>
      <div className="about-profile-copy">
        <p className="about-eyebrow">{person.role}</p>
        <h3>{person.name}</h3>
        {person.alias && <p className="about-alias">{person.alias}</p>}
        {person.bio ? <p>{person.bio}</p> : null}
      </div>
    </article>
  );
}

export default function AboutPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    document.title = 'About | Aegis Forge System';
    let description = document.querySelector('meta[name="description"]');
    if (!description) {
      description = document.createElement('meta');
      description.setAttribute('name', 'description');
      document.head.appendChild(description);
    }
    description.setAttribute('content', 'Aegis Forge System is a privately owned Nigerian defence technology organization focused on sovereign hardware, software, and field systems.');
  }, []);

  return (
    <main className="landing-page about-page">
      <header className="landing-header about-header">
        <Link className="landing-brand" to="/" aria-label="AEGIS FORGE SYSTEM home" onClick={closeMenu}>
          <img className="landing-brand-logo" src={aegisForgeLogo} alt="AEGIS FORGE SYSTEM logo" />
          <span><strong>AEGIS FORGE</strong><small>SYSTEM</small></span>
        </Link>

        <button className="landing-menu-toggle" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          <span /><span />
        </button>

        <nav className={`landing-nav about-nav ${menuOpen ? 'is-open' : ''}`} aria-label="About navigation">
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/about" onClick={closeMenu}>About</Link>
          <a href="#what-we-build" onClick={closeMenu}>What We Do</a>
          <a href="#field-operations" onClick={closeMenu}>Field Operations</a>
          <a href="#principles" onClick={closeMenu}>Principles</a>
          <Link to="/work-with-us" onClick={closeMenu}>Work With Us</Link>
          <a href="/#contact" onClick={closeMenu}>Contact</a>
        </nav>
      </header>

      <section className="landing-section about-hero" id="about">
        <SectionLabel value="01" />
        <h1>{aboutContent.company.tagline}</h1>
        <p className="about-intro-lede">Aegis Forge System is a privately owned Nigerian defence technology organization focused on designing, engineering, prototyping, and retaining ownership of proprietary hardware, software, and field systems.</p>
        <p className="about-intro-copy">We believe technological sovereignty begins with the ability to build what we depend on. We bring together engineers, programmers, cybersecurity specialists, field operators, and technical builders to develop technology for demanding operational environments.</p>
      </section>

      <section className="landing-section about-section" id="who-we-are">
        <div className="about-section-heading">
          <SectionLabel value="02" />
          <h2>WHO WE ARE</h2>
        </div>
        <div className="about-content-grid">
          <div>
            <p className="about-first-paragraph">Aegis Forge System is a privately owned defence technology organization.</p>
            <p>We are not owned by any government.</p>
            <p>We are Nigerians, building for Nigeria.</p>
          </div>
          <div>
            <p>We design, prototype, and retain full ownership of proprietary hardware, software, and field systems.</p>
            <p>We build advanced technology for operational conditions, including austere, off-grid, and demanding environments.</p>
          </div>
        </div>
      </section>

      <section className="landing-section about-section" id="why-we-exist">
        <div className="about-section-heading">
          <SectionLabel value="03" />
          <h2>WHY WE EXIST</h2>
        </div>
        <div className="about-quote-block">
          <p className="about-quote-main">{aboutContent.whyWeExist.quote}</p>
          <p className="about-quote-sub">Every piece of defence technology Nigeria imports was built by someone else. If someone else built it, someone else owns it. If someone else owns it, someone else controls it.</p>
        </div>
        <div className="about-body-copy">
          {aboutContent.whyWeExist.body.map((item) => <p key={item}>{item}</p>)}
        </div>
      </section>

      <section className="landing-section about-section" id="what-we-build">
        <div className="about-section-heading">
          <SectionLabel value="04" />
          <h2>WHAT WE BUILD</h2>
        </div>
        <div className="about-capabilities-list">
          {aboutContent.capabilities.map((item) => <div key={item} className="about-capability-item">{item}</div>)}
        </div>
        <p className="about-supporting-line">Hardware that survives where nothing else does.</p>
      </section>

      <section className="landing-section about-section about-founders" id="founder">
        <div className="about-section-heading">
          <SectionLabel value="05" />
          <h2>FOUNDER</h2>
        </div>
        <FounderProfile person={{ name: aboutContent.founder.name, role: aboutContent.founder.role, alias: aboutContent.founder.alias, bio: aboutContent.founder.bio ? null : null }} featured />
        <div className="about-founder-story">
          <p>{aboutContent.founder.biography[0]}</p>
          <p>{aboutContent.founder.biography[1]}</p>
          <p>{aboutContent.founder.biography[2]}</p>
          <p>{aboutContent.founder.biography[3]}</p>
          <p>{aboutContent.founder.biography[4]}</p>
          <p>{aboutContent.founder.biography[5]}</p>
        </div>
      </section>

      <section className="landing-section about-section" id="cadet-initiative">
        <div className="about-section-heading">
          <SectionLabel value="06" />
          <h2>CADET INITIATIVE</h2>
        </div>
        <div className="about-cadet-box">
          <p><strong>Afolabi is a Community Ambassador for the Developmental and Engagement Techniques Initiative (CADET Initiative).</strong></p>
          <p>{aboutContent.cadet.description}</p>
        </div>
      </section>

      <section className="landing-section about-section" id="founder-motivation">
        <div className="about-section-heading">
          <SectionLabel value="07" />
          <h2>FOUNDER'S MOTIVATION</h2>
        </div>
        <div className="about-motivation-text">
          <p className="about-motivation-quote">{aboutContent.founder.quote}</p>
          <ul>
            {aboutContent.founder.motivation.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <p className="about-motivation-lead">Technology that a nation does not build or control creates technological dependence.</p>
        </div>
      </section>

      <section className="landing-section about-section" id="founder-message">
        <div className="about-section-heading">
          <SectionLabel value="08" />
          <h2>FOUNDER'S MESSAGE</h2>
        </div>
        <blockquote className="about-message">
          {aboutContent.founder.message}
        </blockquote>
        <p className="about-message-signoff">{aboutContent.founder.identity}</p>
      </section>

      <section className="landing-section about-section" id="co-founder">
        <div className="about-section-heading">
          <SectionLabel value="09" />
          <h2>CO-FOUNDER</h2>
        </div>
        <FounderProfile person={{ name: aboutContent.coFounder.name, role: aboutContent.coFounder.role, bio: aboutContent.coFounder.bio }} />
      </section>

      <section className="landing-section about-section" id="structure">
        <div className="about-section-heading">
          <SectionLabel value="10" />
          <h2>OUR STRUCTURE</h2>
        </div>
        <div className="about-structure-box">
          <h3>{aboutContent.structure.title}</h3>
          <div className="about-structure-grid">
            {aboutContent.structure.divisions.map((group) => (
              <div key={group.label} className="about-structure-group">
                <p className="about-structure-label">{group.label}</p>
                <ul>
                  {group.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section about-section" id="field-operations">
        <div className="about-section-heading">
          <SectionLabel value="11" />
          <h2>ORGANIZATIONAL DIVISIONS</h2>
        </div>
        <div className="about-divisions-grid">
          {aboutContent.divisions.map((division) => (
            <article key={division.number} className="about-division-card">
              <span>{division.number}</span>
              <h3>{division.title}</h3>
              <p>{division.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section about-section" id="principles">
        <div className="about-section-heading">
          <SectionLabel value="12" />
          <h2>PRINCIPLES</h2>
        </div>
        <div className="about-principles-grid">
          {aboutContent.principles.map((principle) => (
            <article key={principle.number} className="about-principle-card">
              <span>{principle.number}</span>
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
