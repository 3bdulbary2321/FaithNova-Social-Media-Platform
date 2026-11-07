import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async event => {
    event.preventDefault();
    setBusy(true); setError('');
    const result = await login(identifier.trim(), password);
    if (!result.success) { setError(result.error); setBusy(false); }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-5 p-7">
        <div className="space-y-2 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-accent text-on-accent"><ShieldCheck /></span>
          <h1 className="text-xl font-semibold">Moderation dashboard</h1>
          <p className="text-sm text-muted">Sign in with a moderator or admin account.</p>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Email or username</span>
          <input className="input" autoComplete="username" value={identifier} onChange={e => setIdentifier(e.target.value)} required />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Password</span>
          <input className="input" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        {error && <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}
