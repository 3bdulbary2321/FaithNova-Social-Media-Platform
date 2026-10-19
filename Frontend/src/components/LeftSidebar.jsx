import Avatar from './Avatar';
import { NavLink } from 'react-router-dom';
import { House, Bookmark, ShieldCheck, Compass, Atom, Dna, HeartPulse, Brain, BookOpen, Scroll, ArrowUpRight } from 'lucide-react';
import { topics } from '../mockData/topics';
import { useAuth } from '../context/AuthContext';

const icons = { Compass, Atom, Dna, HeartPulse, Brain, BookOpen, Scroll };

export default function LeftSidebar({ onItemClick }) {
  const { user, bookmarkedIds, isAuthenticated, openAuthDialog } = useAuth();
  const linkClass = ({ isActive }) => `nav-item${isActive ? ' active' : ''}`;
  return (
    <aside className="sidebar-content">
      <nav aria-label="Main navigation" className="nav-section">
        <p className="eyebrow">Your workspace</p>
        <NavLink to="/" end onClick={onItemClick} className={linkClass}><House size={19} /><span>Home feed</span></NavLink>
        <NavLink to="/saved" onClick={onItemClick} className={linkClass}><Bookmark size={19} /><span>Saved posts</span><span className="nav-count">{bookmarkedIds.length}</span></NavLink>
        <NavLink to="/moderation" onClick={onItemClick} className={linkClass}><ShieldCheck size={19} /><span>Review & moderation</span></NavLink>
      </nav>
      <nav aria-label="Explore topics" className="nav-section topics-nav">
        <p className="eyebrow">Explore disciplines</p>
        {topics.map(topic => {
          const Icon = icons[topic.icon] || Compass;
          return <NavLink key={topic.id} to={`/topics/${topic.slug}`} onClick={onItemClick} className={linkClass}><Icon size={18} /><span>{topic.name}</span></NavLink>;
        })}
      </nav>
      <div className="sidebar-note"><BookOpen size={21} /><h3>Stay curious. Be kind.</h3><p>A shared space for thoughtful questions and evidence-led conversations.</p><NavLink to="/moderation" onClick={onItemClick}>Our community principles <ArrowUpRight size={14} /></NavLink></div>
      <NavLink to={isAuthenticated ? '/profile' : '/auth'} onClick={event => { onItemClick?.(); if (!isAuthenticated) { event.preventDefault(); openAuthDialog(); } }} className="sidebar-profile">
        {isAuthenticated ? <Avatar src={user.avatar} name={user.name} /> : <span className="guest-avatar"><BookOpen size={19} /></span>}
        <div><strong>{isAuthenticated ? user.name : 'Find your community'}</strong><span>{isAuthenticated ? 'View your profile' : 'Sign in or join FaithNova'}</span></div><ArrowUpRight size={16} />
      </NavLink>
    </aside>
  );
}
