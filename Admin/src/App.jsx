import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { Loading } from './components/States';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Reports from './pages/Reports';
import UsersPage from './pages/Users';
import Notifications from './pages/Notifications';

export default function App() {
  const { user, checking } = useAuth();

  if (checking) return <Loading label="Checking your session…" />;
  if (!user) return <Routes><Route path="*" element={<Login />} /></Routes>;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Overview />} />
        <Route path="reports" element={<Reports />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
