import { Outlet } from 'react-router-dom';
import aegisForgeLogo from '../assets/home-logo.jpg';

export default function AuthLayout() {
  return (
    <main className="auth-layout">
      <section className="auth-brand-panel">
        <div className="brand" aria-label="AEGIS FORGE">
          <img className="brand-logo" src={aegisForgeLogo} alt="" />
          <span><span className="brand-name">AEGIS FORGE</span><span className="brand-subtitle">Team operations</span></span>
        </div>
        <div className="auth-brand-copy">
          <p className="eyebrow">Internal operations platform</p>
          <h1>One workspace for your team.</h1>
          <p>Projects, people, tasks, documents, and decisions—organized for the way your technology team works.</p>
        </div>
      </section>
      <section className="auth-form-panel"><Outlet /></section>
    </main>
  );
}
