export default function StatCard({ label, value, trend, tone = 'neutral' }) {
  return (
    <article className="card stat-card">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {trend && <span className="stat-trend">{trend}</span>}
      {tone === 'accent' && <span className="sr-only">Accent metric</span>}
    </article>
  );
}
