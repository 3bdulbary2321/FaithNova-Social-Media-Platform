import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

let googleScript;
function loadGoogle() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!googleScript) {
    googleScript = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = resolve;
      script.onerror = () => { script.remove(); googleScript = null; reject(new Error('Could not load Google sign-in. Check your connection or use email.')); };
      document.head.appendChild(script);
    });
  }
  return googleScript;
}

export default function GoogleSignIn({ onSuccess, disabled }) {
  const { loginWithGoogle } = useAuth();
  const container = useRef(null);
  const callbacks = useRef({ loginWithGoogle, onSuccess, disabled });
  useEffect(() => { callbacks.current = { loginWithGoogle, onSuccess, disabled }; }, [loginWithGoogle, onSuccess, disabled]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  useEffect(() => {
    if (!clientId) return;
    let active = true;
    loadGoogle().then(() => {
      if (!active) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          if (!active || callbacks.current.disabled) return;
          setBusy(true); setError('');
          const result = await callbacks.current.loginWithGoogle(credential);
          if (!active) return;
          setBusy(false);
          if (result.success) callbacks.current.onSuccess?.();
          else setError(result.error);
        },
      });
      window.google.accounts.id.renderButton(container.current, { theme: 'outline', size: 'large', text: 'continue_with', width: 300 });
    }).catch(failure => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, [clientId]);
  return <div className="google-sign-in">
    {clientId ? <div ref={container} inert={busy || disabled} /> : <><button type="button" className="button google-button" disabled>Continue with Google</button><small>Google sign-in isn’t available yet. Please use email.</small></>}
    {busy && <p role="status">Signing in…</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
  </div>;
}
