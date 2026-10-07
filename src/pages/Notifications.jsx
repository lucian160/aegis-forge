import { useEffect, useState } from 'react';
import { getActivities, getNotifications, updateNotification } from '../services/domainsApi';

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown date';
}

function actorName(author) {
  return author?.name || author?.email || 'Unknown user';
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([getNotifications(), getActivities()])
      .then(([notificationResponse, activityResponse]) => {
        if (!active) return;
        setNotifications(notificationResponse.notifications || []);
        setActivities(activityResponse.activities || []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const markRead = async (notificationId) => {
    try {
      const updated = await updateNotification(notificationId, { read: true });
      setNotifications((items) => items.map((item) => item.id === notificationId ? updated.notification : item));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Communication</p>
          <h1>Notifications & activity</h1>
          <p>Announcements, mentions, task updates, and team activity in one place.</p>
        </div>
      </header>

      {error && <p className="auth-error" role="alert">Unable to load communications: {error}</p>}
      {loading ? <div className="auth-loading">Loading communications…</div> : (
        <>
          <section className="section-grid communication-grid">
            <article className="card">
              <div className="card-header"><h2>Unread notifications</h2><span>{unreadCount} active</span></div>
              <div className="card-body communication-list">
                {notifications.length === 0 ? <p className="empty-state">No notifications are available.</p> : notifications.map((item) => (
                  <div key={item.id} className={`communication-row ${item.read ? 'read' : 'unread'}`}>
                    <span className="notification-pill">{item.type}</span>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.message}</p>
                    </div>
                    <div className="communication-actions">
                      <span className="meta-text">{formatDate(item.createdAt)}</span>
                      {!item.read && <button type="button" className="text-button" onClick={() => markRead(item.id)}>Mark read</button>}
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="card">
              <div className="card-header"><h2>Recent activity</h2><span>{activities.length} updates</span></div>
              <div className="card-body communication-list">
                {activities.length === 0 ? <p className="empty-state">No recent activity.</p> : activities.map((item) => (
                  <div key={item.id} className="communication-row">
                    <span className="notification-pill accent">{item.targetType}</span>
                    <div>
                      <strong>{item.action}</strong>
                      <p>{item.details || `Updated ${item.targetType}.`}</p>
                    </div>
                    <span className="meta-text">{formatDate(item.createdAt)}</span>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </>
      )}
    </>
  );
}
