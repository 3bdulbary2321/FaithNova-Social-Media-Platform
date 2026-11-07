import { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Bell, ClipboardList, Flag, LayoutDashboard, LogOut, Menu, ShieldCheck, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { moderation } from '../api/client';
import Avatar from './Avatar';

const NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/reports', label: 'Reports', icon: Flag },
  { to: '/queue', label: 'Post queue', icon: ClipboardList },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/notifications', label: 'Notifications', icon: Bell },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState('');

  const refreshUnread = useCallback(() => {
    moderation.notifications({ unread: 1, per_page: 1 }).then(r => setUnread(r.unread_count)).catch(() => {});
  }, []);

  useEffect(() => {
    refreshUnread();
    const timer = setInterval(refreshUnread, 30000);
    return () => clearInterval(timer);
  }, [refreshUnread]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-4">
      <div className="mb-6 flex items-center gap-2 px-2">
        <span className="grid size-9 place-items-center rounded-xl bg-accent text-on-accent"><ShieldCheck size={18} /></span>
        <div>
          <p className="font-heading text-base font-semibold leading-tight">FaithNova</p>
          <p className="text-xs text-muted">Moderation</p>
        </div>
      </div>
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)}
          className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-soft hover:text-ink'}`}>
          <Icon size={18} />{label}
          {to === '/notifications' && unread > 0 && <span className="chip ml-auto bg-danger text-on-accent">{unread > 99 ? '99+' : unread}</span>}
        </NavLink>
      ))}
      <div className="mt-auto flex items-center gap-3 rounded-xl border border-line p-3">
        <Avatar user={user} size={34} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="text-xs capitalize text-muted">{user.role}</p>
        </div>
        <button type="button" onClick={logout} className="rounded-lg p-1.5 text-muted hover:bg-soft hover:text-danger" aria-label="Sign out" title="Sign out"><LogOut size={16} /></button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-line bg-surface lg:block">{sidebar}</aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface px-4 py-3 lg:hidden">
        <span className="font-heading font-semibold">FaithNova Moderation</span>
        <button type="button" onClick={() => setMenuOpen(true)} className="rounded-lg p-1.5 hover:bg-soft" aria-label="Open menu"><Menu size={20} /></button>
      </header>
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMenuOpen(false)}>
          <aside className="h-full w-64 bg-surface" onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => setMenuOpen(false)} className="absolute left-56 top-4 rounded-lg bg-surface p-1.5" aria-label="Close menu"><X size={18} /></button>
            {sidebar}
          </aside>
        </div>
      )}

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet context={{ notify: setToast, refreshUnread }} />
      </main>

      {toast && <div role="status" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-canvas shadow-lg">{toast}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
