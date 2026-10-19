import { useMemo } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, BookOpen, SearchX, X } from 'lucide-react';
import CategoryPills from '../components/CategoryPills';
import PostCard from '../components/PostCard';
import CreatePostTrigger from '../components/CreatePostTrigger';
import { useAuth } from '../context/AuthContext';
import { topics } from '../mockData/topics';
import { filterFeed } from '../utils/feed';

export default function Home() {
  const { posts, bookmarkedIds, isLoadingPosts } = useAuth();
  const { slug } = useParams();
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();
  const selectedCategory = params.get('category') || 'All';
  const searchQuery = params.get('q') || '';
  const sortBy = params.get('sort') || 'latest';
  const saved = pathname === '/saved';
  const topic = topics.find(item => item.slug === slug);
  const filteredPosts = useMemo(() => filterFeed(posts, { category: selectedCategory, query: searchQuery, sort: sortBy, topic: slug, savedIds: saved ? bookmarkedIds : null }), [posts, selectedCategory, searchQuery, sortBy, slug, saved, bookmarkedIds]);
  const updateFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'All') next.delete(key); else next.set(key, value);
    setParams(next, { replace: true });
  };
  const hasFilters = selectedCategory !== 'All' || Boolean(searchQuery);
  const resetFilters = () => { const next = new URLSearchParams(params); next.delete('q'); next.delete('category'); setParams(next); };
  return (
    <div className="feed-page">
      <div className="page-heading"><div><p className="eyebrow">{saved ? 'Your reading collection' : topic ? 'Explore a discipline' : 'The community journal'}</p><h1>{saved ? 'Saved for later' : topic ? topic.name : searchQuery ? 'Search results' : 'A little curiosity. A new perspective.'}</h1><p>{saved ? 'Good ideas are worth coming back to.' : topic ? topic.description : searchQuery ? `Conversations matching “${searchQuery}”` : 'Explore the conversations connecting science, faith, and the world around us.'}</p></div></div>
      {!saved && !topic && !searchQuery && <section className="welcome-banner"><div><span className="eyebrow">Where ideas come together</span><h2>Big questions.<br /><em>Thoughtful conversations.</em></h2><p>Discover new connections between what we know and what we believe.</p><Link to="/topics/astronomy-cosmology">Explore a discipline <ArrowUpRight size={16} /></Link></div><div className="orbital-art" aria-hidden="true"><span className="orbit orbit-one" /><span className="orbit orbit-two" /><span className="orbit orbit-three" /><span className="orbit-core"><BookOpen size={28} strokeWidth={1.3} /></span><span className="orbital-star">✦</span></div></section>}
      {!saved && !searchQuery && <CreatePostTrigger />}
      <section aria-label="Discussions" className="feed-section">
        <div className="feed-toolbar"><h2>{saved ? 'Your collection' : 'Discover discussions'}<span>{filteredPosts.length}</span></h2><label className="sort-control"><span>Sort by</span><select aria-label="Sort discussions" value={sortBy} onChange={event => updateFilter('sort', event.target.value)}><option value="latest">Latest</option><option value="insightful">Most insightful</option><option value="popular">Most liked</option></select></label></div>
        {!topic && <CategoryPills selectedCategory={selectedCategory} onSelectCategory={category => updateFilter('category', category)} />}
        {hasFilters && <div className="active-filters"><span>{filteredPosts.length} {filteredPosts.length === 1 ? 'result' : 'results'}{searchQuery ? ` for “${searchQuery}”` : ''}{selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}</span><button onClick={resetFilters}>Clear filters <X size={14} /></button></div>}
        {isLoadingPosts && <p className="loading-label" role="status">Refreshing discussions…</p>}
        {filteredPosts.length ? <div className="post-list">{filteredPosts.map(post => <PostCard key={post.id} post={post} />)}</div> : <div className="empty-state"><SearchX size={32} /><h3>{saved && !hasFilters ? 'Your reading list starts here' : 'No discussions found'}</h3><p>{saved && !hasFilters ? 'Save a post using the bookmark button and find it here whenever you need it.' : 'Try another topic or a broader search to find a conversation.'}</p>{hasFilters ? <button className="button primary" onClick={resetFilters}>Clear filters</button> : <Link className="button primary" to="/">Explore discussions</Link>}</div>}
        {filteredPosts.length > 0 && <p className="feed-end">You’re all caught up. There’s always another question to ask.</p>}
      </section>
    </div>
  );
}
