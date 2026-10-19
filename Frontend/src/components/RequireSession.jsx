import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireSession({ children, staff = false }) {
  const { isAuthenticated, isLoadingAuth, openAuthDialog, user } = useAuth();
  useEffect(() => { if (!isLoadingAuth && !isAuthenticated) openAuthDialog(); }, [isLoadingAuth, isAuthenticated, openAuthDialog]);
  if (isLoadingAuth) return <p role="status">Restoring your session…</p>;
  if (!isAuthenticated) return <div className="empty-state"><h1>Sign in to continue</h1><p>Your account keeps your contributions and saved posts together.</p><button className="button primary" onClick={openAuthDialog}>Sign in / Create account</button><Link to="/" className="back-link">Continue browsing</Link></div>;
  if (staff && !['admin', 'moderator'].includes(user.rawRole)) return <div className="empty-state"><h1>Staff access required</h1><Link to="/">Back to community</Link></div>;
  return children;
}
