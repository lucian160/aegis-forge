import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import NotificationPanel from '../components/NotificationPanel';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { getNotifications } from '../services/domainsApi';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationError, setNotificationError] = useState('');

  useEffect(() => {
    let active = true;
    getNotifications()
      .then((response) => {
        if (active) setNotifications(response.notifications || []);
      })
      .catch((error) => {
        if (active) setNotificationError(error.message);
      })
      .finally(() => {
        if (active) setNotificationsLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} unreadCount={notifications.filter((item) => !item.read).length} />
      <div className="main-area">
        <Topbar onMenu={() => setSidebarOpen(true)} notificationsOpen={notificationOpen} onToggleNotifications={() => setNotificationOpen((value) => !value)} />
        {notificationOpen && <div className="notification-flyout"><NotificationPanel notifications={notifications} loading={notificationsLoading} error={notificationError} onClose={() => setNotificationOpen(false)} /></div>}
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}
