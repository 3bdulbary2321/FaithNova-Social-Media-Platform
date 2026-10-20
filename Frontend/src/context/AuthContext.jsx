import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { normalizePost, normalizeUser } from '../api/normalizer';
import { sampleFeedPosts as initialPosts } from '../mockData/feedPosts';

const AuthContext = createContext();
const guestUser = { name: 'Guest', handle: '', avatar: '', id: null };

export function AuthProvider({ children }) {
  // Load stored token and user from localStorage
  const [token, setToken] = useState(() => localStorage.getItem('faithnova_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('faithnova_token') && localStorage.getItem('faithnova_user');
      const cached = saved ? JSON.parse(saved) : null;
      return cached?.id ? cached : guestUser;
    } catch {
      return guestUser;
    }
  });

  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  
  // Feed state with live API posts
  const [posts, setPosts] = useState(() => initialPosts.map(p => normalizePost(p)));
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [categories, setCategories] = useState([]);

  // Global Create Post Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const openAuthDialog = useCallback(() => setIsAuthDialogOpen(true), []);
  const closeAuthDialog = () => setIsAuthDialogOpen(false);

  const isAuthenticated = Boolean(token && user?.id);
  const requireAuth = () => {
    if (isAuthenticated && localStorage.getItem('faithnova_token') === token) return true;
    openAuthDialog();
    return false;
  };

  useEffect(() => {
    const resetSession = () => {
      setToken(null); setUser(guestUser); setBookmarkedIds([]); setNotifications([]);
      setIsCreateModalOpen(false);
    };
    const expired = () => { resetSession(); openAuthDialog(); };
    const sync = event => {
      if (event.key === 'faithnova_token' || event.key === null) {
        const stored = localStorage.getItem('faithnova_token');
        if (!stored) resetSession();
        else setToken(stored);
      }
    };
    window.addEventListener('faithnova_auth_expired', expired);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('faithnova_auth_expired', expired);
      window.removeEventListener('storage', sync);
    };
  }, [openAuthDialog]);

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch current user from /auth/me on mount if token exists
  useEffect(() => {
    let active = true;
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('faithnova_token');
      if (!storedToken) {
        setIsLoadingAuth(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (active && localStorage.getItem('faithnova_token') === storedToken && response.data?.user) {
          const authUser = normalizeUser(response.data.user);
          setUser(authUser);
          localStorage.setItem('faithnova_user', JSON.stringify(authUser));
        }
      } catch (err) {
        console.warn('Authentication token expired or unreachable, continuing with guest/cached session.');
      } finally {
        if (active) setIsLoadingAuth(false);
      }
    };

    checkAuth();
    return () => { active = false; };
  }, [token]);

  // Fetch categories from Laravel API
  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories');
      if (res.data && res.data.data) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.warn('Could not load categories from API, using defaults.');
    }
  }, []);

  // Fetch posts from Laravel API
  const fetchPosts = useCallback(async (params = {}) => {
    setIsLoadingPosts(true);
    try {
      let endpoint = '/posts';
      let requestParams = { ...params };

      if (params.q) {
        endpoint = '/posts/search';
      }

      const res = await api.get(endpoint, { params: requestParams });
      const rawPosts = res.data?.data?.data || res.data?.data || res.data?.posts || [];

      if (Array.isArray(rawPosts) && rawPosts.length > 0) {
        const normalized = rawPosts.map((p) => normalizePost(p));
        setPosts(normalized);
      } else if (!params.q && (!params.category || params.category === 'All')) {
        // Fallback to sample posts if DB has few or empty
        setPosts(initialPosts.map((p) => normalizePost(p)));
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.warn('Could not fetch posts from API, falling back to local dataset.', err);
      setPosts(initialPosts.map((p) => normalizePost(p)));
    } finally {
      setIsLoadingPosts(false);
    }
  }, []);

  // Initial load of categories and posts
  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, [fetchCategories, fetchPosts]);

  // Login handler
  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token: newToken, user: rawUser } = response.data;
      const newUser = normalizeUser(rawUser);

      localStorage.setItem('faithnova_token', newToken);
      localStorage.setItem('faithnova_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      closeAuthDialog();

      showToast(`Welcome back, ${newUser.name}! Fellowship session active.`);
      return { success: true, user: newUser };
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      showToast(msg);
      return { success: false, error: msg, validationErrors: error.response?.data?.errors };
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token: newToken, user: rawUser } = response.data;
      const newUser = normalizeUser(rawUser);

      localStorage.setItem('faithnova_token', newToken);
      localStorage.setItem('faithnova_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      closeAuthDialog();

      showToast(`Welcome to FaithNova, ${newUser.name}!`);
      return { success: true, user: newUser };
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Please check your inputs.';
      showToast(msg);
      return { success: false, error: msg, validationErrors: error.response?.data?.errors };
    }
  };

  const loginWithGoogle = async credential => {
    try {
      const { data } = await api.post('/auth/google', { credential });
      const newUser = normalizeUser(data.user);
      localStorage.setItem('faithnova_token', data.token);
      localStorage.setItem('faithnova_user', JSON.stringify(newUser));
      setToken(data.token); setUser(newUser); closeAuthDialog();
      showToast(`Welcome, ${newUser.name}!`);
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Google sign-in failed. Please try again.' };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Continue cleanup regardless
    } finally {
      localStorage.removeItem('faithnova_token');
      localStorage.removeItem('faithnova_user');
      setToken(null);
      setUser(guestUser);
      setBookmarkedIds([]); setNotifications([]); setIsCreateModalOpen(false);
      showToast('Logged out successfully.');
    }
  };

  // Update profile handler (supports avatar file upload)
  const updateProfile = async (formData) => {
    if (!requireAuth()) return { success: false, error: 'Please sign in to continue.' };
    try {
      const response = await api.post('/user/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedUser = normalizeUser(response.data.user);
      setUser(updatedUser);
      localStorage.setItem('faithnova_user', JSON.stringify(updatedUser));
      showToast('Academic profile updated successfully.');
      return { success: true, user: updatedUser };
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile.';
      showToast(msg);
      return { success: false, error: msg };
    }
  };

  // Add new post (supports multipart file uploads)
  const addPost = async (postData) => {
    if (!requireAuth()) return { success: false, error: 'Please sign in to continue.' };
    try {
      let createdPost = null;

      if (postData instanceof FormData) {
        const response = await api.post('/posts', postData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        createdPost = normalizePost(response.data.data);
      } else {
        // Build FormData from object
        const formData = new FormData();
        formData.append('title', postData.title);
        formData.append('content', postData.content);
        
        // Find category_id
        const matchedCategory = categories.find(c => c.name.toLowerCase() === (postData.category || '').toLowerCase());
        formData.append('category_id', matchedCategory ? matchedCategory.id : (categories[0]?.id || 1));

        if (postData.religiousReference) {
          const rel = typeof postData.religiousReference === 'string'
            ? postData.religiousReference
            : `${postData.religiousReference.source || ''}\n${postData.religiousReference.scripture || ''}\n${postData.religiousReference.exegesis || ''}`.trim();
          formData.append('religious_reference', rel);
        }

        if (postData.scientificReference) {
          const sci = typeof postData.scientificReference === 'string'
            ? postData.scientificReference
            : `${postData.scientificReference.citation || ''}\n${postData.scientificReference.paperTitle || ''}\n${postData.scientificReference.explanation || ''}`.trim();
          formData.append('scientific_reference', sci);
        }

        if (postData.mediaFiles && Array.isArray(postData.mediaFiles)) {
          postData.mediaFiles.forEach((file) => {
            formData.append('media[]', file);
          });
        }

        const response = await api.post('/posts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        createdPost = normalizePost(response.data.data);
      }

      if (createdPost) {
        setPosts((prev) => [createdPost, ...prev]);
        showToast(`Synthesis "${createdPost.title.slice(0, 35)}..." published successfully!`);
        return { success: true, post: createdPost };
      }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Could not publish your post. Please try again.' };
    }
  };

  // Toggle reaction on a post
  const toggleReaction = async (postId, type = 'like') => {
    if (!requireAuth()) return null;
    try {
      const response = await api.post(`/posts/${postId}/reactions`, { type });
      const { user_reaction, stats } = response.data;

      // Update post in feed
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              user_reaction,
              stats: {
                ...p.stats,
                likes: stats.likes_count,
                insightfuls: stats.insightfuls_count,
                likes_count: stats.likes_count,
                insightfuls_count: stats.insightfuls_count,
              },
            };
          }
          return p;
        })
      );

      return response.data;
    } catch (error) {
      console.warn('Could not save reaction via API.');
      return null;
    }
  };

  const markAllNotificationsAsRead = () => {
    if (!requireAuth()) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  const toggleBookmark = (postId) => {
    if (!requireAuth()) return;
    setBookmarkedIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const openCreateModal = () => { if (requireAuth()) setIsCreateModalOpen(true); };
  const closeCreateModal = () => setIsCreateModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        setUser,
        isAuthenticated,
        isLoadingAuth,
        isAuthDialogOpen, openAuthDialog, closeAuthDialog, requireAuth, loginWithGoogle,
        login,
        register,
        logout,
        updateProfile,
        notifications,
        unreadCount,
        markAllNotificationsAsRead,
        bookmarkedIds,
        toggleBookmark,
        posts,
        setPosts,
        categories,
        isLoadingPosts,
        fetchPosts,
        addPost,
        toggleReaction,
        isCreateModalOpen,
        openCreateModal,
        closeCreateModal,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
