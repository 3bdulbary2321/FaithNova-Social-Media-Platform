import { useState } from 'react';
import { Eye, EyeOff, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleSignIn from './GoogleSignIn';

export default function AuthForm({ initialMode = 'login', onSuccess }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const registering = mode === 'register';
  const submit = async event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true); setError('');
    try {
      const result = registering
        ? await register({ name: data.get('name').trim(), username: data.get('username').trim(), email: data.get('email').trim(), password: data.get('password'), bio: data.get('institution')?.trim() || '' })
        : await login({ login: data.get('email').trim(), password: data.get('password') });
      if (result.success) onSuccess?.();
      else setError(result.error);
    } catch { setError('We couldn’t connect. Please try again.'); }
    finally { setBusy(false); }
  };
  return <div className="auth-options">
    <GoogleSignIn onSuccess={onSuccess} disabled={busy} />
    <div className="auth-divider"><span>or continue with email</span></div>
    <form key={mode} className="editor-form" onSubmit={submit}>
      {registering && <><label>Full name<input name="name" autoComplete="name" required maxLength={100} /></label><label>Username<input name="username" autoComplete="username" pattern="[a-zA-Z0-9_]+" minLength={3} maxLength={30} required /></label><label>Institution <span className="optional">Optional</span><input name="institution" autoComplete="organization" placeholder="University or organization" /></label></>}
      <label>{registering ? 'Email address' : 'Email or username'}<input name="email" type={registering ? 'email' : 'text'} autoComplete={registering ? 'email' : 'username'} placeholder="you@example.com" required /></label>
      <label>Password<div className="password-field"><input name="password" type={visible ? 'text' : 'password'} autoComplete={registering ? 'new-password' : 'current-password'} minLength={registering ? 8 : undefined} required /><button type="button" className="icon-button" aria-label={visible ? 'Hide password' : 'Show password'} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
      {registering && <label className="checkbox-label"><input type="checkbox" required /><span>I agree to participate respectfully and cite my sources.</span></label>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button primary" disabled={busy}>{busy ? 'Please wait…' : registering ? 'Create account' : 'Sign in with email'}<ArrowUpRight size={17} /></button>
    </form>
    <p className="auth-switch">{registering ? 'Already have an account?' : 'New to FaithNova?'} <button type="button" className="text-button" disabled={busy} onClick={() => { setMode(registering ? 'login' : 'register'); setError(''); }}>{registering ? 'Sign in' : 'Create an account'}</button></p>
    <p className="auth-session-note">You’ll stay signed in on this browser until you sign out.</p>
  </div>;
}
