import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import AuthDialog from './components/AuthDialog';
import RequireSession from './components/RequireSession';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import AuthPage from './pages/AuthPage';
import UserProfile from './pages/UserProfile';
import ModerationDashboard from './pages/ModerationDashboard';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AuthDialog />
          <Routes>
            {/* Standalone Split-Screen Auth Page */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />

            {/* Main Application with 3-Column Academic Layout */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="post/:postId" element={<PostDetail />} />
              <Route path="profile" element={<RequireSession><UserProfile /></RequireSession>} />
              <Route path="profile/:handle" element={<UserProfile />} />
              <Route path="moderation" element={<RequireSession staff><ModerationDashboard /></RequireSession>} />
              <Route path="peer-review" element={<RequireSession staff><ModerationDashboard /></RequireSession>} />
              <Route path="topics/:slug" element={<Home />} />
              <Route path="saved" element={<RequireSession><Home /></RequireSession>} />
              <Route path="*" element={<Home />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
