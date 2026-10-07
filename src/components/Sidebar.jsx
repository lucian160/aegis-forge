import { NavLink } from 'react-router-dom';
import { navigation } from '../data/navigation';
import Icon from './Icon';

export default function Sidebar({ open, onClose }) {
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
            {navigation.map((item) => (
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
            <li><NavLink className="nav-link" to="/notifications" onClick={onClose}><span className="nav-icon"><Icon name="bell" /></span><span>Notifications</span><span className="nav-count">6</span></NavLink></li>
            <li><NavLink className="nav-link" to="/settings" onClick={onClose}><span className="nav-icon"><Icon name="layers" /></span><span>Settings</span></NavLink></li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <span className="avatar">AK</span>
            <span><strong>Alex Kim</strong><span>Organization Leader</span></span>
          </div>
        </div>
      </aside>
      <div className={`mobile-overlay ${open ? 'visible' : ''}`} aria-hidden="true" onClick={onClose} />
    </>
  );
}
