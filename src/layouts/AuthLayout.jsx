import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <main className="auth-layout">
      <section className="auth-brand-panel">
        <div className="brand" aria-label="AEGIS FORGE">
          <span className="brand-mark" aria-hidden="true" />
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
