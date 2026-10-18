import React, { createContext, useContext, useState } from 'react';
import { currentUser as initialUser } from '../mockData/currentUser';
import { mockNotifications as initialNotifications } from '../mockData/notifications';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(initialUser);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [bookmarkedIds, setBookmarkedIds] = useState(['post-1']);

  const unreadCount = notifications.filter(n => n.isUnread).length;

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
  };

  const toggleBookmark = (postId) => {
    setBookmarkedIds(prev => 
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
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
