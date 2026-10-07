export default function NotificationPanel({ notifications = [], loading = false, error = '', onClose }) {
  return (
    <div className="notification-panel" aria-label="Notifications panel">
      <div className="notification-panel-header">
        <div>
          <p className="eyebrow">Inbox</p>
          <h3>Notifications</h3>
        </div>
        <button className="icon-button" type="button" onClick={onClose} aria-label="Close notifications">
          ×
        </button>
      </div>

      <div className="notification-panel-body">
        {loading ? (
          <p className="auth-loading">Loading notifications…</p>
        ) : error ? (
          <p className="auth-error" role="alert">Unable to load notifications: {error}</p>
        ) : notifications.length === 0 ? (
          <p className="empty-state-copy">No new notifications.</p>
        ) : (
          notifications.slice(0, 5).map((item) => (
            <div key={item.id} className={`notification-item ${item.read ? 'read' : 'unread'}`}>
              <span className="notification-dot" aria-hidden="true" />
              <div>
                <div className="notification-item-top"><strong>{item.type}</strong><span>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</span></div>
                <p>{item.title}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
