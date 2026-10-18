import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Compass, 
  Plus, 
  Bell, 
  User, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MobileBottomBar() {
  const { user, unreadCount, openCreateModal } = useAuth();

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-xl transition-colors duration-200 bg-white/95 border-slate-200/90 dark:bg-[#070b14]/95 dark:border-slate-800/80 safe-area-pb"
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
        
        {/* 1. Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 transition-colors ${
              isActive
                ? 'text-indigo-600 dark:text-amber-400 font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </NavLink>

        {/* 2. Explore Disciplines */}
        <NavLink
          to="/topics/astronomy-cosmology"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 transition-colors ${
              isActive
                ? 'text-indigo-600 dark:text-amber-400 font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`
          }
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Explore</span>
        </NavLink>

        {/* 3. Center Elevated "New Thesis" Action Button */}
        <div className="flex items-center justify-center -mt-5">
          <button
            onClick={openCreateModal}
            aria-label="New Synthesis"
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 shadow-lg shadow-amber-500/30 active:scale-95 transition-transform cursor-pointer"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* 4. Notifications */}
        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center gap-1 transition-colors ${
              isActive
                ? 'text-indigo-600 dark:text-amber-400 font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`
          }
        >
          <div className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-slate-950">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Alerts</span>
        </NavLink>

        {/* 5. Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 transition-colors ${
              isActive
                ? 'text-indigo-600 dark:text-amber-400 font-semibold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`
          }
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-5 h-5 rounded-full object-cover ring-1 ring-amber-400"
          />
          <span className="text-[10px] tracking-tight">Profile</span>
        </NavLink>

      </div>
    </nav>
  );
}
