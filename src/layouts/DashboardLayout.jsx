import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import NotificationPanel from '../components/NotificationPanel';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { notifications } from '../data/communications';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-area">
        <Topbar onMenu={() => setSidebarOpen(true)} notificationsOpen={notificationOpen} onToggleNotifications={() => setNotificationOpen((value) => !value)} />
        {notificationOpen && <div className="notification-flyout"><NotificationPanel notifications={notifications} onClose={() => setNotificationOpen(false)} /></div>}
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}
