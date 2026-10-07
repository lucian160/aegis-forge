import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import PositionCard from '../components/PositionCard';
import StatCard from '../components/StatCard';
import { positions } from '../data/recruitment';

export default function WorkWithUs() {
  const [department, setDepartment] = useState('All departments');
  const [query, setQuery] = useState('');
  const departments = ['All departments', ...new Set(positions.map((position) => position.department))];
  const visiblePositions = useMemo(() => positions.filter((position) => {
    const matchesDepartment = department === 'All departments' || position.department === department;
    const searchable = `${position.title} ${position.department} ${position.skills.join(' ')}`.toLowerCase();
    return matchesDepartment && searchable.includes(query.toLowerCase());
  }), [department, query]);

  return (
    <>
      <header className="page-header"><div><p className="eyebrow">Join AEGIS FORGE</p><h1>Work with us</h1><p>Build practical technology products with a focused, collaborative team.</p></div><Link to="/work-with-us/application"><Button variant="primary" icon="plus">Apply now</Button></Link></header>
      <section className="hero-panel"><div><p className="eyebrow">Our team is growing</p><h2>Build systems that help teams work better.</h2><p>We are looking for thoughtful engineers, designers, and quality practitioners who care about clear processes, useful products, and sustainable delivery.</p><Link to="#open-positions"><Button variant="primary">Explore positions</Button></Link></div><div className="hero-visual"><span>AEGIS</span><strong>FORGE</strong><small>Technology operations</small></div></section>
      <section className="stat-grid"><StatCard label="Open positions" value={positions.length} trend="Across 4 teams" /><StatCard label="Employment types" value="Full-time & contract" trend="Flexible work locations" /><StatCard label="Application timeline" value="2 weeks" trend="Typical review window" /><StatCard label="Team culture" value="Collaborative" trend="Documented and transparent" /></section>
      <section className="recruitment-section" id="open-positions"><div className="section-heading"><h2>Open positions</h2><span>{visiblePositions.length} roles</span></div><div className="filter-bar"><label className="search-box"><span className="sr-only">Search positions</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search roles or skills..." /></label><select className="filter-select" value={department} onChange={(event) => setDepartment(event.target.value)} aria-label="Filter by department">{departments.map((item) => <option key={item}>{item}</option>)}</select></div><div className="position-grid">{visiblePositions.map((position) => <PositionCard key={position.id} position={position} />)}</div></section>
      <section className="section-grid"><article className="card"><div className="card-header"><h2>What we value</h2><span>Our working principles</span></div><div className="card-body value-list"><div><strong>Clear decisions</strong><p>We document context, ownership, and decisions so teams can move with confidence.</p></div><div><strong>Thoughtful delivery</strong><p>We measure the quality of the work and the system around it, not only the speed.</p></div><div><strong>Healthy collaboration</strong><p>We create room for technical depth, design quality, and honest feedback.</p></div></div></article><article className="card"><div className="card-header"><h2>Application process</h2><span>Simple and transparent</span></div><div className="card-body process-list"><div><span>01</span><strong>Apply</strong><p>Submit your profile, portfolio, and relevant experience.</p></div><div><span>02</span><strong>Review</strong><p>Our team reviews applications against the role criteria.</p></div><div><span>03</span><strong>Conversation</strong><p>Selected candidates meet the team for a structured discussion.</p></div></div></article></section>
    </>
  );
}
