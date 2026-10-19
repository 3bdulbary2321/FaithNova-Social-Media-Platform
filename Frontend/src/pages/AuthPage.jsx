import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Orbit, ArrowLeft, BookOpen, Sun, Moon } from 'lucide-react';
import AuthForm from '../components/AuthForm';
import { useTheme } from '../context/ThemeContext';

export default function AuthPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const registering = pathname === '/register';
  return <div className="auth-page"><section className="auth-story"><Link to="/" className="brand"><span className="brand-mark"><Orbit size={25} /></span><span>Faith<span className="brand-accent">Nova</span></span></Link><div className="auth-story-content"><p className="eyebrow">For the endlessly curious</p><h1>Good questions<br />bring us<br /><em>closer together.</em></h1><p>Join a community exploring the connections between science, faith, and everything in between.</p><div className="auth-values"><BookOpen size={22} /><span>Thoughtful ideas. Credible sources.<br />Room for every perspective.</span></div></div><small>A meeting of curious minds.</small></section><main className="auth-main"><div className="auth-top"><Link to="/"><ArrowLeft size={16} />Back to community</Link><button className="icon-button" onClick={toggleTheme} aria-label="Toggle theme">{isDark ? <Sun size={20} /> : <Moon size={20} />}</button></div><div className="auth-form-container"><p className="eyebrow">Your next conversation starts here</p><h2>{registering ? 'Find your people.' : 'Welcome back.'}</h2><p>{registering ? 'Create an account and add your perspective.' : 'Sign in to continue exploring and sharing ideas.'}</p><AuthForm key={pathname} initialMode={registering ? 'register' : 'login'} onSuccess={() => navigate('/')} /></div></main></div>;
}
