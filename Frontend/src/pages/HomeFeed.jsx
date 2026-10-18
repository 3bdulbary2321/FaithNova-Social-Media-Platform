import React, { useState } from 'react';
import { 
  Sparkles, 
  Share2, 
  Bookmark, 
  MessageSquare, 
  ThumbsUp, 
  FileText, 
  Quote, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  Filter,
  Layers,
  Send,
  HelpCircle
} from 'lucide-react';
import { sampleFeedPosts } from '../mockData/feedPosts';
import { useAuth } from '../context/AuthContext';

export default function HomeFeed() {
  const { user, bookmarkedIds, toggleBookmark } = useAuth();
  const [activeTab, setActiveTab] = useState('curated');
  const [posts, setPosts] = useState(sampleFeedPosts);
  const [postLikes, setPostLikes] = useState({ 'post-1': 142, 'post-2': 289 });
  const [likedPosts, setLikedPosts] = useState({});

  const handleLike = (postId) => {
    setLikedPosts(prev => {
      const isLiked = !prev[postId];
      setPostLikes(likes => ({
        ...likes,
        [postId]: (likes[postId] || 0) + (isLiked ? 1 : -1),
      }));
      return { ...prev, [postId]: isLiked };
    });
  };

  return (
    <div className="space-y-5">
      
      {/* Phase 1 Status Banner */}
      <div className="p-4 rounded-2xl border transition-all bg-gradient-to-r from-indigo-950/40 via-slate-900/40 to-amber-950/30 border-amber-500/30 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                  Phase 1 Architecture Complete
                </span>
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium">
                  Layout Active
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5 font-heading">
                FaithNova: Academic Harmony of Faith & Science
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Featuring the responsive 3-column academic grid, top navbar with search & filter, notification popovers, light/dark mode, and mobile bottom navigation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feed Filters Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'curated', label: 'Curated Syntheses' },
            { id: 'peer-reviewed', label: 'Peer-Reviewed' },
            { id: 'latest', label: 'Latest Inquiries' },
            { id: 'following', label: 'Following Scholars' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button 
          title="Filter feed"
          className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 px-2 py-1 rounded-md"
        >
          <Filter className="w-3.5 h-3.5 text-indigo-500" />
          <span>Sort: Rigor</span>
        </button>
      </div>

      {/* Quick Inquiry / Thesis Prompt Box */}
      <div className="p-4 rounded-2xl border transition-all bg-white border-slate-200/90 shadow-sm dark:bg-slate-900/60 dark:border-slate-800/80">
        <div className="flex items-start gap-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover ring-1 ring-amber-400 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <input
              type="text"
              placeholder={`Share an academic hypothesis, paper critique, or scriptural synthesis, ${user.name.split(' ')[1]}...`}
              className="w-full text-xs sm:text-sm bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 py-1"
            />
            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/70">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Scope:
                </span>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 cursor-pointer">
                  + Add DOI Reference
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60 cursor-pointer">
                  + Cite Sacred Text
                </span>
              </div>
              <button
                onClick={() => alert('Full posting composer will be implemented in Phase 2!')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
              >
                <Send className="w-3 h-3" />
                <span>Submit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed Posts List */}
      <div className="space-y-5">
        {posts.map((post) => {
          const isSaved = bookmarkedIds.includes(post.id);
          const isLiked = likedPosts[post.id];
          const likesCount = postLikes[post.id] || post.stats.endorsements;

          return (
            <article
              key={post.id}
              className="rounded-2xl p-4 sm:p-5 border transition-all duration-200 bg-white border-slate-200/90 hover:border-slate-300 dark:bg-slate-900/60 dark:border-slate-800/80 dark:hover:border-slate-700 shadow-sm"
            >
              {/* Post Header: Author & Metadata */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {post.author.name}
                      </h3>
                      {post.author.isVerified && (
                        <ShieldCheck className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      )}
                      <span className="px-1.5 py-0.2 text-[9px] font-semibold uppercase tracking-wider rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {post.author.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {post.author.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{post.publishedAt}</span>
                </div>
              </div>

              {/* Topic & Tags */}
              <div className="flex items-center gap-2 flex-wrap mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 font-mono">
                  {post.topic}
                </span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-amber-400 cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Title & Thesis Statement */}
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug font-heading">
                {post.title}
              </h4>

              {/* Thesis Callout Card */}
              <div className="p-3 rounded-xl mb-3 border-l-4 border-amber-500 bg-amber-500/5 dark:bg-amber-950/20 border-r border-t border-b border-amber-500/20">
                <div className="flex items-start gap-2">
                  <Quote className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-0.5">
                      Core Hypothesis / Thesis
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 italic font-serif leading-relaxed">
                      "{post.thesis}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Post Body Content */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                {post.content}
              </p>

              {/* Dual Citations Section: Science + Scripture */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800">
                {post.citations.map((cite, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold uppercase tracking-wider">
                      {cite.type === 'scientific' ? (
                        <>
                          <FileText className="w-3 h-3 text-indigo-500" />
                          <span className="text-indigo-600 dark:text-indigo-400">Scientific Reference</span>
                        </>
                      ) : (
                        <>
                          <Quote className="w-3 h-3 text-amber-500" />
                          <span className="text-amber-600 dark:text-amber-400">Sacred Exegesis</span>
                        </>
                      )}
                    </div>
                    <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                      {cite.source}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 italic line-clamp-2 mt-0.5">
                      {cite.title || cite.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Interactive Action Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-3 sm:gap-6">
                  {/* Endorsement / Like */}
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 transition-colors ${
                      isLiked
                        ? 'text-indigo-600 dark:text-amber-400 font-semibold'
                        : 'hover:text-indigo-600 dark:hover:text-amber-400'
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{likesCount}</span>
                  </button>

                  {/* Academic Inquiries / Comments */}
                  <button className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.stats.inquiries}</span>
                  </button>

                  {/* Citations Counter */}
                  <button className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    <FileText className="w-4 h-4" />
                    <span>{post.stats.citations} cites</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Bookmark Button */}
                  <button
                    onClick={() => toggleBookmark(post.id)}
                    aria-label="Save synthesis"
                    className={`p-1.5 rounded-lg transition-colors ${
                      isSaved
                        ? 'text-amber-500 bg-amber-500/10'
                        : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>

                  {/* Share Button */}
                  <button 
                    aria-label="Share post"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

    </div>
  );
}
