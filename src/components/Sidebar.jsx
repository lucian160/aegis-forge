import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { navigation } from '../data/navigation';
import { roles } from '../data/roles';
import { canAccessScope } from '../data/permissions';
import Icon from './Icon';

export default function Sidebar({ open, onClose, unreadCount = 0 }) {
  const { user } = useAuth();
  const initials = user?.name?.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '?';
  const roleName = roles.find((role) => role.id === user?.roleId)?.name
    || user?.roleId?.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
    || 'Role unavailable';
  const visibleNavigation = navigation.filter((item) => !item.scope || canAccessScope(user?.roleId, item.scope));

  return (
    <>
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Primary navigation">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span>
            <span className="brand-name">AEGIS FORGE</span>
            <span className="brand-subtitle">Team operations</span>
          </span>
        </div>

        <nav className="sidebar-content">
          <p className="nav-label">Workspace</p>
          <ul className="nav-list">
            {visibleNavigation.map((item) => (
              <li key={item.path}>
                <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to={item.path} onClick={onClose}>
                  <span className="nav-icon"><Icon name={item.icon} /></span>
                  <span>{item.label}</span>
                  {item.count && <span className="nav-count">{item.count}</span>}
                </NavLink>
              </li>
            ))}
          </ul>

          <p className="nav-label">Workspace</p>
          <ul className="nav-list">
            <li><NavLink className="nav-link" to="/notifications" onClick={onClose}><span className="nav-icon"><Icon name="bell" /></span><span>Notifications</span>{unreadCount > 0 && <span className="nav-count">{unreadCount}</span>}</NavLink></li>
            <li><NavLink className="nav-link" to="/settings" onClick={onClose}><span className="nav-icon"><Icon name="layers" /></span><span>Settings</span></NavLink></li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <span className="avatar">{initials}</span>
            <span><strong>{user?.name || 'Account unavailable'}</strong><span>{roleName}</span></span>
          </div>
        </div>
      </aside>
      <div className={`mobile-overlay ${open ? 'visible' : ''}`} aria-hidden="true" onClick={onClose} />
    </>
  );
}
