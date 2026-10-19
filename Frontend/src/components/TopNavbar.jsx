import Avatar from './Avatar';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Orbit, Search, Bell, Sun, Moon, Menu, X, Plus, User, Bookmark, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function TopNavbar({ onToggleMobileNav, isMobileNavOpen }) {
  const { isDark, toggleTheme } = useTheme();
  const { user, notifications, unreadCount, markAllNotificationsAsRead, openCreateModal, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [popover, setPopover] = useState(null);
  const searchRef = useRef(null);
  const actionsRef = useRef(null);
  useEffect(() => { setQuery(params.get('q') || ''); }, [params]);
  useEffect(() => {
    const handleKey = event => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') { event.preventDefault(); searchRef.current?.focus(); }
      if (event.key === 'Escape') setPopover(null);
    };
    const handleOutside = event => { if (!actionsRef.current?.contains(event.target)) setPopover(null); };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('pointerdown', handleOutside);
    return () => { document.removeEventListener('keydown', handleKey); document.removeEventListener('pointerdown', handleOutside); };
  }, []);
  const search = event => {
    event.preventDefault();
    navigate(query.trim() ? `/?q=${encodeURIComponent(query.trim())}` : '/');
    setPopover(null);
  };
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand-group"><button className="icon-button mobile-menu" onClick={onToggleMobileNav} aria-label="Open navigation" aria-expanded={isMobileNavOpen}>{isMobileNavOpen ? <X /> : <Menu />}</button><Link to="/" className="brand" aria-label="FaithNova home"><span className="brand-mark"><Orbit size={25} /></span><span>Faith<span className="brand-accent">Nova</span><small>A meeting of curious minds</small></span></Link></div>
        <form className="global-search" role="search" onSubmit={search}><Search size={18} /><input ref={searchRef} type="search" aria-label="Search discussions" placeholder="Search ideas, topics, or people…" value={query} onChange={e => setQuery(e.target.value)} /><button type="submit" aria-label="Submit search"><span className="search-hint">Search</span><Search size={16} className="mobile-search-icon" /></button></form>
        <div className="topbar-actions" ref={actionsRef}>
          <button className="button primary topbar-create" onClick={openCreateModal}><Plus size={17} />Create post</button>
          <button className="icon-button" onClick={toggleTheme} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} title={isDark ? 'Light mode' : 'Dark mode'}>{isDark ? <Sun size={19} /> : <Moon size={19} />}</button>
          <div className="popover-anchor"><button className="icon-button notification-button" onClick={() => setPopover(popover === 'notifications' ? null : 'notifications')} aria-label={`Notifications, ${unreadCount} unread`} aria-expanded={popover === 'notifications'}><Bell size={19} />{unreadCount > 0 && <span className="notification-dot" />}</button>
            {popover === 'notifications' && <section className="popover notifications-panel" aria-label="Notifications"><div className="popover-heading"><h2>Notifications</h2><button className="text-button" onClick={markAllNotificationsAsRead}>Mark all read</button></div><div className="notification-list">{notifications.map(item => <div className={`notification-item ${item.isUnread ? 'unread' : ''}`} key={item.id}><Avatar src={item.actor.avatar} name={item.actor.name} /><div><p><strong>{item.actor.name}</strong> {item.actionText} “{item.targetTitle}”</p><small>{item.time}</small></div></div>)}</div></section>}
          </div>
          <div className="popover-anchor"><button className="icon-button account-button" aria-label="Account menu" aria-expanded={popover === 'profile'} onClick={() => setPopover(popover === 'profile' ? null : 'profile')}>{isAuthenticated ? <Avatar src={user.avatar} name={user.name} /> : <User size={20} />}</button>
            {popover === 'profile' && <div className="popover account-panel"><p className="eyebrow">{isAuthenticated ? user.name : 'Welcome to FaithNova'}</p><Link to="/profile" onClick={() => setPopover(null)}><User size={17} />Your profile</Link><Link to="/saved" onClick={() => setPopover(null)}><Bookmark size={17} />Saved posts</Link>{isAuthenticated ? <button onClick={() => { logout(); setPopover(null); }}><LogOut size={17} />Sign out</button> : <Link to="/auth" onClick={() => setPopover(null)}><LogOut size={17} />Sign in / Create account</Link>}</div>}
          </div>
        </div>
      </div>
    </header>
  );
}
