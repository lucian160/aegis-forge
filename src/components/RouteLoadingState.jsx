export default function RouteLoadingState() {
  return (
    <div
      style={{
        minHeight: '50vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        color: '#dfe7ff',
      }}
    >
      <div style={{ display: 'grid', justifyItems: 'center', gap: '0.85rem' }}>
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            border: '3px solid rgba(143, 162, 255, 0.18)',
            borderTopColor: '#8ba4ff',
            animation: 'spin 0.9s linear infinite',
          }}
        />
        <div style={{ textAlign: 'center' }}>
          <strong style={{ display: 'block', fontSize: '1rem' }}>Loading workspace…</strong>
          <span style={{ fontSize: '0.88rem', color: '#afbddf' }}>Preparing the next section.</span>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
