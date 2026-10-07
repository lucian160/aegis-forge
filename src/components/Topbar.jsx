import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import Button from './Button';

export default function Topbar({ onMenu, notificationsOpen, onToggleNotifications }) {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  useEffect(() => {
    const focusSearch = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get('query')?.toString().trim();
    if (query) navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="topbar">
      <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={onMenu}>
        <Icon name="menu" />
      </button>

      <form className="search-box" onSubmit={submitSearch}>
        <Icon name="search" />
        <input ref={searchInputRef} name="query" aria-label="Search workspace" placeholder="Search projects, tasks, people..." />
        <kbd>⌘ K</kbd>
      </form>

      <div className="topbar-actions">
        <button className="icon-button" aria-label="Open notifications" onClick={onToggleNotifications} aria-pressed={notificationsOpen}>
          <Icon name="bell" />
        </button>
        <Button variant="primary" icon="plus"><span>New task</span></Button>
      </div>
    </header>
  );
}
