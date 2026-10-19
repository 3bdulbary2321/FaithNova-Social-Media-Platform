import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Orbit, ArrowLeft, ArrowUpRight, Eye, EyeOff, BookOpen, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function AuthPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const registering = pathname === '/register';
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true); setError('');
    try {
      const result = registering ? await register({ name: data.get('name').trim(), username: data.get('username').trim(), email: data.get('email'), password: data.get('password'), bio: data.get('institution') || '' }) : await login({ login: data.get('email'), password: data.get('password') });
      if (result.success) navigate(registering ? '/profile' : '/');
      else setError(result.error);
    } catch { setError('We couldn’t connect. Please try again.'); }
    finally { setBusy(false); }
  };
  return <div className="auth-page"><section className="auth-story"><Link to="/" className="brand"><span className="brand-mark"><Orbit size={25} /></span><span>Faith<span className="brand-accent">Nova</span></span></Link><div className="auth-story-content"><p className="eyebrow">For the endlessly curious</p><h1>Good questions<br />bring us<br /><em>closer together.</em></h1><p>Join a community exploring the connections between science, faith, and everything in between.</p><div className="auth-values"><BookOpen size={22} /><span>Thoughtful ideas. Credible sources.<br />Room for every perspective.</span></div></div><small>A meeting of curious minds.</small></section><main className="auth-main"><div className="auth-top"><Link to="/"><ArrowLeft size={16} />Back to community</Link><button className="icon-button" onClick={toggleTheme} aria-label="Toggle theme">{isDark ? <Sun size={20} /> : <Moon size={20} />}</button></div><div className="auth-form-container"><p className="eyebrow">Your next conversation starts here</p><h2>{registering ? 'Find your people.' : 'Welcome back.'}</h2><p>{registering ? 'Create an account and add your perspective.' : 'Sign in to continue exploring and sharing ideas.'}</p><form key={pathname} className="editor-form" onSubmit={submit}>
    {registering && <><label>Full name<input name="name" autoComplete="name" placeholder="Your full name" required /></label><label>Username<input name="username" autoComplete="username" placeholder="Choose a username" pattern="[a-zA-Z0-9_]+" title="Use letters, numbers, and underscores" required /></label><label>Institution <span className="optional">Optional</span><input name="institution" autoComplete="organization" placeholder="University or organization" /></label></>}
    <label>{registering ? 'Email address' : 'Email or username'}<input name="email" type={registering ? 'email' : 'text'} autoComplete={registering ? 'email' : 'username'} placeholder={registering ? 'you@example.com' : 'Your email or username'} required /></label>
    <label>Password<div className="password-field"><input name="password" type={visible ? 'text' : 'password'} autoComplete={registering ? 'new-password' : 'current-password'} placeholder={registering ? 'Create a password (8+ characters)' : 'Enter your password'} minLength={registering ? 8 : undefined} required /><button type="button" className="icon-button" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
    {registering && <label className="checkbox-label"><input type="checkbox" required /><span>I agree to participate respectfully and cite my sources.</span></label>}
    {error && <p className="form-error" role="alert">{error}</p>}<button className="button primary" disabled={busy}>{busy ? 'Please wait…' : registering ? 'Create account' : 'Sign in'}<ArrowUpRight size={17} /></button>
    </form><p className="auth-switch">{registering ? 'Already part of the community?' : 'New to FaithNova?'} <Link to={registering ? '/login' : '/register'} onClick={() => setError('')}>{registering ? 'Sign in' : 'Create an account'}</Link></p></div></main></div>;
}
