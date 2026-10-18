import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
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
          <Routes>
            {/* Standalone Split-Screen Auth Page */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />

            {/* Main Application with 3-Column Academic Layout */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="post/:postId" element={<PostDetail />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="profile/:handle" element={<UserProfile />} />
              <Route path="moderation" element={<ModerationDashboard />} />
              <Route path="peer-review" element={<ModerationDashboard />} />
              <Route path="topics/:slug" element={<Home />} />
              <Route path="saved" element={<Home />} />
              <Route path="*" element={<Home />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
