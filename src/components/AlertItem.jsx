export default function AlertItem({ alert }) {
  const severity = alert.severity === 'danger' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'info';

  return (
    <div className="alert-item">
      <span className={`alert-dot ${severity}`} aria-hidden="true" />
      <div><strong>{alert.title}</strong><span>{alert.detail}</span></div>
    </div>
  );
}
