import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api, { TOKEN_KEY, errorMessage } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)));

  const signOutLocally = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    api.get('/auth/me')
      .then(({ data }) => (data.user.is_moderator ? setUser(data.user) : signOutLocally()))
      .catch(signOutLocally)
      .finally(() => setChecking(false));
  }, [signOutLocally]);

  useEffect(() => {
    window.addEventListener('admin:signed-out', signOutLocally);
    return () => window.removeEventListener('admin:signed-out', signOutLocally);
  }, [signOutLocally]);

  const login = async (identifier, password) => {
    try {
      const { data } = await api.post('/auth/login', { login: identifier, password, device_name: 'faithnova_admin' });
      if (!data.user.is_moderator) {
        await api.post('/auth/logout', null, { headers: { Authorization: `Bearer ${data.token}` } }).catch(() => {});
        return { success: false, error: 'This dashboard is only for moderators and administrators.' };
      }
      localStorage.setItem(TOKEN_KEY, data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: errorMessage(error, 'Could not sign in.') };
    }
  };

  const logout = async () => {
    await api.post('/auth/logout').catch(() => {});
    signOutLocally();
  };

  return <AuthContext.Provider value={{ user, checking, login, logout }}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
