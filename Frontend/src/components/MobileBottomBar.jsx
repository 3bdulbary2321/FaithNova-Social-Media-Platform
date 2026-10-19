import { NavLink } from 'react-router-dom';
import { House, Bookmark, Plus, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MobileBottomBar() {
  const { openCreateModal, isAuthenticated } = useAuth();
  return <nav className="mobile-bottom-bar" aria-label="Mobile navigation"><NavLink to="/" end><House size={20} /><span>Home</span></NavLink><NavLink to="/saved"><Bookmark size={20} /><span>Saved</span></NavLink><button className="mobile-create" onClick={openCreateModal}><Plus size={23} /><span>Create</span></button><NavLink to="/moderation"><ShieldCheck size={20} /><span>Review</span></NavLink><NavLink to={isAuthenticated ? '/profile' : '/auth'}><User size={20} /><span>{isAuthenticated ? 'Profile' : 'Sign in'}</span></NavLink></nav>;
}
