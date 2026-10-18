import React, { useState } from 'react';
import { 
  TrendingUp, 
  Flame, 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  Plus, 
  Check, 
  ExternalLink, 
  Info,
  ChevronDown,
  ChevronUp,
  BookMarked
} from 'lucide-react';
import { trendingTopics } from '../mockData/trendingTopics';
import { topContributors as initialContributors } from '../mockData/topContributors';
import { communityGuidelines } from '../mockData/guidelines';

export default function RightSidebar() {
  const [contributors, setContributors] = useState(initialContributors);
  const [isGuidelinesExpanded, setIsGuidelinesExpanded] = useState(false);

  const toggleFollow = (id) => {
    setContributors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFollowing: !c.isFollowing } : c))
    );
  };

  return (
    <aside className="w-full flex flex-col gap-5 py-4 select-none">
      
      {/* 1. Trending Scientific & Religious Topics */}
      <div className="rounded-2xl p-4 border transition-colors bg-white/80 border-slate-200/90 dark:bg-slate-900/60 dark:border-slate-800/80">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Trending Syntheses
            </h3>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-amber-500 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <Flame className="w-3 h-3 animate-pulse" /> Live
          </span>
        </div>

        <div className="space-y-3">
          {trendingTopics.map((topic, idx) => (
            <div
              key={topic.id}
              className="group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                <span className="font-mono text-indigo-500 dark:text-indigo-400 font-semibold">
                  {topic.discipline}
                </span>
                <span>{topic.postCount}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                #{topic.tag}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {topic.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Top Academic Contributors */}
      <div className="rounded-2xl p-4 border transition-colors bg-white/80 border-slate-200/90 dark:bg-slate-900/60 dark:border-slate-800/80">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Top Contributors
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Verified Fellows</span>
        </div>

        <div className="space-y-3.5">
          {contributors.map((scholar) => (
            <div key={scholar.id} className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative flex-shrink-0">
                  <img
                    src={scholar.avatar}
                    alt={scholar.name}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  {scholar.isVerified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20 absolute -bottom-1 -right-1" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate hover:underline cursor-pointer">
                    {scholar.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {scholar.institution}
                  </p>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium font-mono">
                    {scholar.followers} followers
                  </span>
                </div>
              </div>

              <button
                onClick={() => toggleFollow(scholar.id)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  scholar.isFollowing
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30'
                }`}
              >
                {scholar.isFollowing ? (
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" /> Following
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Follow
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Community Guidelines: Respectful Discussion */}
      <div className="rounded-2xl p-4 border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-slate-50 to-indigo-500/5 dark:from-amber-950/20 dark:via-slate-900/60 dark:to-indigo-950/20 dark:border-amber-500/25">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-amber-500/20 text-amber-500">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Discourse Charter
            </h3>
          </div>
          <button
            onClick={() => setIsGuidelinesExpanded(!isGuidelinesExpanded)}
            className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-0.5 hover:underline"
          >
            {isGuidelinesExpanded ? 'Collapse' : 'Expand'}
            {isGuidelinesExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
          FaithNova is an academic sanctuary. All discussions must integrate rigorous scientific methodology with respectful theological inquiry.
        </p>

        {isGuidelinesExpanded && (
          <div className="space-y-2.5 pt-2 border-t border-amber-500/20 animate-in fade-in duration-200">
            {communityGuidelines.map((guide) => (
              <div key={guide.id} className="flex items-start gap-2 text-[11px]">
                <span className="font-mono text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1 rounded">
                  {guide.number}
                </span>
                <div>
                  <h5 className="font-semibold text-slate-800 dark:text-slate-200">{guide.title}</h5>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-normal">{guide.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px]">
          <span className="text-slate-400">Strict Moderation Active</span>
          <a
            href="#guidelines"
            onClick={(e) => {
              e.preventDefault();
              alert('Full Academic Charter & Peer Review Guidelines available in platform documentation.');
            }}
            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Full Charter</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {/* Platform Micro-Footer */}
      <div className="px-2 text-[10px] text-slate-400 dark:text-slate-400 space-y-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <a href="#about" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">About</a>
          <a href="#ethics" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Ethics Board</a>
          <a href="#peer-review" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Peer Review</a>
          <a href="#privacy" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Privacy</a>
          <a href="#terms" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">Terms</a>
        </div>
        <p className="font-mono text-[9px] text-slate-400">
          FaithNova Academia © 2026 • Science & Faith in Harmony
        </p>
      </div>

    </aside>
  );
}
