import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Compass, 
  Atom, 
  Dna, 
  Brain, 
  BookOpen, 
  Scroll, 
  Bookmark, 
  ShieldCheck, 
  PlusCircle, 
  Sparkles, 
  Layers, 
  Award,
  ChevronRight,
  Flame,
  FileCheck2,
  HeartPulse
} from 'lucide-react';
import { topics } from '../mockData/topics';
import { useAuth } from '../context/AuthContext';

// Map icon strings to Lucide components
const ICON_MAP = {
  Compass,
  Atom,
  Dna,
  HeartPulse,
  Brain,
  BookOpen,
  Scroll,
};

export default function LeftSidebar({ onItemClick }) {
  const { user } = useAuth();

  return (
    <aside className="w-full flex flex-col gap-6 py-4 select-none">
      
      {/* Primary Navigation */}
      <div className="space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-400">
          Core Navigation
        </div>

        <NavLink
          to="/"
          onClick={onItemClick}
          className={({ isActive }) =>
            `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/70'
            }`
          }
        >
          <div className="flex items-center gap-3">
            <Home className="w-4 h-4" />
            <span>Home Feed</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        </NavLink>

        <NavLink
          to="/peer-review"
          onClick={onItemClick}
          className={({ isActive }) =>
            `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
              isActive
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/70'
            }`
          }
        >
          <div className="flex items-center gap-3">
            <FileCheck2 className="w-4 h-4 text-emerald-500" />
            <span>Peer Review Panel</span>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            2 new
          </span>
        </NavLink>

        <NavLink
          to="/saved"
          onClick={onItemClick}
          className={({ isActive }) =>
            `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
              isActive
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/70'
            }`
          }
        >
          <div className="flex items-center gap-3">
            <Bookmark className="w-4 h-4 text-amber-500" />
            <span>Saved Syntheses</span>
          </div>
          <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {user.savedPostsCount}
          </span>
        </NavLink>

        <NavLink
          to="/moderation"
          onClick={onItemClick}
          className={({ isActive }) =>
            `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
              isActive
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/70'
            }`
          }
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span>Academic Moderation</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Charter v2</span>
        </NavLink>
      </div>

      {/* Categories & Disciplines */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-3 pb-2">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-400">
            Disciplines & Hermeneutics
          </span>
          <span className="text-[10px] text-amber-500 font-medium">7 Fields</span>
        </div>

        <div className="space-y-0.5">
          {topics.map((topic) => {
            const IconComponent = ICON_MAP[topic.icon] || Compass;
            return (
              <NavLink
                key={topic.id}
                to={`/topics/${topic.slug}`}
                onClick={onItemClick}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-500/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
                  }`
                }
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:scale-110 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 transition-transform">
                    <IconComponent className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <span className="truncate">{topic.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300 font-mono">
                  {topic.postCount}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* "New Synthesis / Inquiry" Action Card */}
      <div className="p-4 rounded-2xl relative overflow-hidden border transition-all bg-gradient-to-br from-indigo-900/10 via-slate-900/5 to-amber-900/10 border-indigo-500/20 dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-amber-950/30 dark:border-indigo-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Publish Synthesis</h4>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
          Have an insight connecting cosmological data and theological commentary? Submit a thesis for peer review.
        </p>
        <button
          onClick={() => alert('Synthesis submission modal will be activated in Phase 2!')}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold text-xs shadow-md shadow-amber-500/20 active:scale-[0.98] transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Academic Thesis</span>
        </button>
      </div>

      {/* Mini Scholar Profile Card at Bottom */}
      <div className="mt-auto p-3 rounded-xl border flex items-center gap-3 bg-white/70 border-slate-200 dark:bg-slate-900/60 dark:border-slate-800">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-9 h-9 rounded-full object-cover ring-1 ring-amber-400 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</span>
            <ShieldCheck className="w-3 h-3 text-amber-500 flex-shrink-0" />
          </div>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium block truncate">
            {user.institution}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">
            {user.reputation}
          </span>
        </div>
      </div>

    </aside>
  );
}
