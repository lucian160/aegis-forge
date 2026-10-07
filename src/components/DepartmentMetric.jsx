export default function DepartmentMetric({ label, value, detail, tone = 'neutral' }) {
  return (
    <article className="department-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small className={tone}>{detail}</small>
    </article>
  );
}
