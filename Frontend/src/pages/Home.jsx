import React, { useState, useMemo } from 'react';
import CategoryPills from '../components/CategoryPills';
import PostCard from '../components/PostCard';
import CreatePostTrigger from '../components/CreatePostTrigger';
import { sampleFeedPosts } from '../mockData/feedPosts';
import { 
  Sparkles, 
  Search, 
  SlidersHorizontal, 
  X, 
  TrendingUp, 
  FileCheck2, 
  Filter 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { posts } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('insightful'); // 'insightful', 'latest', 'popular'

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Category filter
      const matchesCategory = 
        selectedCategory === 'All' || 
        post.category.toLowerCase() === selectedCategory.toLowerCase();

      // Search query filter (matches title, content, author, tags, or scripture)
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        post.title.toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q) ||
        post.author.name.toLowerCase().includes(q) ||
        post.tags.some(t => t.toLowerCase().includes(q)) ||
        (post.religiousReference && post.religiousReference.source.toLowerCase().includes(q)) ||
        (post.scientificReference && post.scientificReference.citation.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    }).sort((a, b) => {
      if (sortBy === 'insightful') {
        return b.stats.insightfuls - a.stats.insightfuls;
      }
      if (sortBy === 'popular') {
        return b.stats.likes - a.stats.likes;
      }
      return 0; // default order
    });
  }, [posts, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="space-y-5">
      
      {/* 1. Quick "Create Post" Trigger Box at the top */}
      <CreatePostTrigger />

      {/* 2. CategoryPills Bar */}
      <div className="pt-1">
        <CategoryPills
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />
      </div>

      {/* 3. Search / Filter & Sort Controls Sub-Bar */}
      <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl border bg-white/70 border-slate-200/80 dark:bg-slate-900/50 dark:border-slate-800 text-xs">
        {/* Inline Search */}
        <div className="relative flex-1 flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter current feed by keyword, DOI, or Surah..."
            className="w-full py-1.5 pl-8 pr-7 text-xs bg-transparent outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5 border-l pl-3 border-slate-200 dark:border-slate-800 flex-shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
          >
            <option value="insightful" className="dark:bg-slate-900">Most Insightful</option>
            <option value="popular" className="dark:bg-slate-900">Highest Endorsement</option>
            <option value="latest" className="dark:bg-slate-900">Chronological</option>
          </select>
        </div>
      </div>

      {/* Active Filter Indicator Tag */}
      {(selectedCategory !== 'All' || searchQuery) && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-900/40 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400">Filtering:</span>
            {selectedCategory !== 'All' && (
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                {selectedCategory}
              </span>
            )}
            {searchQuery && (
              <span className="font-semibold text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                "{searchQuery}"
              </span>
            )}
            <span className="text-[10px] text-slate-400 font-mono">
              ({filteredPosts.length} results)
            </span>
          </div>

          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* 4. Feed of PostCard Components */}
      {filteredPosts.length > 0 ? (
        <div className="space-y-5">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 mx-auto flex items-center justify-center mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
            No Syntheses Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            No peer-reviewed posts matched "{searchQuery}" in the {selectedCategory} category.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            Reset All Filters
          </button>
        </div>
      )}

    </div>
  );
}
