import Button from '../components/Button';

export default function PlaceholderPage({ title, description = 'This workspace is ready for the next implementation phase.' }) {
  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">AEGIS FORGE</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <Button variant="primary">Demo action</Button>
      </header>

      <article className="card empty-state">
        <div>
          <span className="empty-state-icon" aria-hidden="true">◇</span>
          <h3>Foundation ready</h3>
          <p>This page is a lightweight placeholder. The production view and its data layer will be added in the appropriate development phase.</p>
        </div>
      </article>
    </>
  );
}
