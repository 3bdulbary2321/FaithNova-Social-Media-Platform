import React, { createContext, useContext, useState } from 'react';
import { currentUser as initialUser } from '../mockData/currentUser';
import { mockNotifications as initialNotifications } from '../mockData/notifications';
import { sampleFeedPosts as initialPosts } from '../mockData/feedPosts';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(initialUser);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [bookmarkedIds, setBookmarkedIds] = useState(['post-1', 'post-2']);
  const [posts, setPosts] = useState(initialPosts);

  // Global Create Post Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const unreadCount = notifications.filter(n => n.isUnread).length;

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
  };

  const toggleBookmark = (postId) => {
    setBookmarkedIds(prev => 
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const addPost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    showToast(`Synthesis "${newPost.title.slice(0, 35)}..." published successfully!`);
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        notifications,
        unreadCount,
        markAllNotificationsAsRead,
        bookmarkedIds,
        toggleBookmark,
        posts,
        setPosts,
        addPost,
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
