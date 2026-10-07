import { useAuth } from '../hooks/useAuth';
import { canViewForRole } from '../data/communications';

export default function NotificationPanel({ notifications = [], onClose }) {
  const { user } = useAuth();
  const visibleNotifications = notifications.filter((item) => canViewForRole(user?.roleId, item.audience));

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
        {visibleNotifications.length === 0 ? (
          <p className="empty-state-copy">No new notifications.</p>
        ) : (
          visibleNotifications.slice(0, 5).map((item) => (
            <div key={item.id} className={`notification-item ${item.read ? 'read' : 'unread'}`}>
              <span className="notification-dot" aria-hidden="true" />
              <div>
                <div className="notification-item-top">
                  <strong>{item.category}</strong>
                  <span>{item.time}</span>
                </div>
                <p>{item.title}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
