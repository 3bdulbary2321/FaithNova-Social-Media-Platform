import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import HomeFeed from './pages/HomeFeed';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomeFeed />} />
              <Route path="topics/:slug" element={<HomeFeed />} />
              <Route path="saved" element={<HomeFeed />} />
              <Route path="peer-review" element={<HomeFeed />} />
              <Route path="moderation" element={<HomeFeed />} />
              <Route path="*" element={<HomeFeed />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
