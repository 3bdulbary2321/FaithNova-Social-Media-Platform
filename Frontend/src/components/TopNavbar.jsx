import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  ChevronDown, 
  Filter, 
  Check, 
  User, 
  Bookmark, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  GraduationCap,
  Award,
  ExternalLink,
  Plus
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const SEARCH_FILTERS = [
  { id: 'all', label: 'All Disciplines' },
  { id: 'cosmology', label: 'Cosmology & Physics' },
  { id: 'biology', label: 'Biology & Genetics' },
  { id: 'hermeneutics', label: 'Sacred Hermeneutics' },
  { id: 'scholars', label: 'Scholars & Fellows' },
  { id: 'peer-reviewed', label: 'Peer-Reviewed Only' },
];

export default function TopNavbar({ onToggleMobileNav, isMobileNavOpen }) {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, notifications, unreadCount, markAllNotificationsAsRead, openCreateModal } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(SEARCH_FILTERS[0]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const searchInputRef = useRef(null);
  const filterRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Keyboard shortcut: Cmd+K / Ctrl+K to focus search bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setIsFilterOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-xl transition-colors duration-200 bg-white/90 border-slate-200/90 dark:bg-[#070b14]/90 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          
          {/* Left: Mobile Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileNav}
              aria-label="Toggle navigation drawer"
              className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 md:hidden transition-colors"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 p-[1px] shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-[11px] bg-slate-900 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-amber-500/20 opacity-80" />
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse relative z-10" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
                    Faith<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300">Nova</span>
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400 border border-indigo-500/20">
                    Academia
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 tracking-wide font-medium">
                  Faith & Science Synthesis
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Global Search Bar with Filter Dropdown */}
          <div className="hidden sm:flex flex-1 max-w-xl mx-2 lg:mx-6">
            <div className="relative w-full flex items-center rounded-xl border transition-all duration-200 bg-slate-100/80 border-slate-200 hover:border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:bg-slate-900/80 dark:border-slate-800 dark:hover:border-slate-700 dark:focus-within:border-indigo-500 dark:focus-within:ring-indigo-500/20">
              
              {/* Filter Selector Button */}
              <div className="relative" ref={filterRef}>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-1.5 pl-3 pr-2 py-2 text-xs font-medium border-r transition-colors text-slate-700 hover:text-slate-900 border-slate-200 dark:text-slate-300 dark:hover:text-white dark:border-slate-800"
                >
                  <Filter className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span className="hidden md:inline max-w-[110px] truncate">{selectedFilter.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Filter Dropdown Popover */}
                {isFilterOpen && (
                  <div className="absolute left-0 mt-2 w-56 rounded-xl border shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                    <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/80">
                      Search Scope
                    </div>
                    {SEARCH_FILTERS.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => {
                          setSelectedFilter(filter);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                          selectedFilter.id === filter.id
                            ? 'bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-950/50 dark:text-indigo-300'
                            : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <span>{filter.label}</span>
                        {selectedFilter.id === filter.id && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Input field */}
              <div className="relative flex-1 flex items-center">
                <Search className="w-4 h-4 ml-3 text-slate-400 dark:text-slate-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search papers, verses, DOI, cosmology..."
                  className="w-full py-2 pl-2.5 pr-10 text-xs sm:text-sm bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400"
                />
                
                {/* Clear or Keyboard Shortcut badge */}
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 mr-2 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden lg:inline-flex items-center gap-0.5 mr-2 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 rounded border border-slate-300/60 dark:border-slate-700">
                    ⌘K
                  </kbd>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Icons: Publish button, Theme Toggle, Notifications, User Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* New Synthesis Action Button */}
            <button
              onClick={openCreateModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-sm hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-xl text-slate-600 hover:text-amber-500 hover:bg-amber-500/10 dark:text-slate-300 dark:hover:text-amber-400 dark:hover:bg-amber-400/10 transition-colors"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400 hover:rotate-90 transition-transform duration-300" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600 hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {/* Notifications with interactive popover */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                aria-label="Notifications"
                className="relative p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950 shadow-sm animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl p-0 z-50 animate-in fade-in zoom-in-95 bg-white border-slate-200 dark:bg-[#0c1222] dark:border-slate-800">
                  <div className="flex items-center justify-between p-3.5 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">Academic Alerts</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3.5 flex items-start gap-3 transition-colors ${
                          item.isUnread
                            ? 'bg-indigo-50/50 dark:bg-indigo-950/20'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <img
                          src={item.actor.avatar}
                          alt={item.actor.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                            <span className="font-semibold text-slate-900 dark:text-white">{item.actor.name}</span>{' '}
                            {item.actionText}{' '}
                            <span className="text-indigo-600 dark:text-indigo-400 italic">"{item.targetTitle}"</span>
                          </p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-400 mt-1 block">
                            {item.time}
                          </span>
                        </div>
                        {item.isUnread && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 text-center border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl">
                    <button className="text-xs font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">
                      View all peer reviews & citations
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full border transition-all bg-slate-100/80 border-slate-200 hover:border-slate-300 dark:bg-slate-900/80 dark:border-slate-800 dark:hover:border-slate-700"
              >
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-amber-400/50"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white max-w-[120px] truncate leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium leading-none">
                    {user.role}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Popover */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 bg-white border-slate-200 dark:bg-[#0c1222] dark:border-slate-800">
                  {/* Scholar Badge Header */}
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-amber-50/30 dark:from-indigo-950/40 dark:to-amber-950/20 border border-indigo-100/60 dark:border-indigo-900/30 mb-1">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</h4>
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.handle}</p>
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium truncate mt-0.5">
                          {user.institution}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-indigo-100/80 dark:border-indigo-900/40 text-center">
                      <div className="bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                        <span className="block text-[10px] text-slate-400 font-medium">Reputation</span>
                        <span className="text-xs font-bold text-amber-500 flex items-center justify-center gap-1">
                          <Award className="w-3 h-3" />
                          {user.reputation}
                        </span>
                      </div>
                      <div className="bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                        <span className="block text-[10px] text-slate-400 font-medium">Peer Reviews</span>
                        <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400">
                          {user.peerReviews}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Links */}
                  <div className="space-y-0.5 py-1 text-xs">
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70 transition-colors">
                      <User className="w-4 h-4 text-indigo-500" />
                      <span>Academic Profile & Treatises</span>
                    </button>
                    <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <Bookmark className="w-4 h-4 text-amber-500" />
                        <span>Saved Syntheses</span>
                      </div>
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-slate-200 dark:bg-slate-800 font-medium">
                        {user.savedPostsCount}
                      </span>
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70 transition-colors">
                      <GraduationCap className="w-4 h-4 text-emerald-500" />
                      <span>Fellowship & Grant Status</span>
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70 transition-colors">
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Account & Privacy Preferences</span>
                    </button>
                  </div>

                  <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors text-xs font-medium">
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
