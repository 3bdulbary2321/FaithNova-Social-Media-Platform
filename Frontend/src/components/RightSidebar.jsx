import Avatar from './Avatar';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, TrendingUp } from 'lucide-react';
import { communityGuidelines } from '../mockData/guidelines';
import { useAuth } from '../context/AuthContext';

export default function RightSidebar() {
  const { posts } = useAuth();
  const popular = [...posts].sort((a, b) => b.stats.insightfuls - a.stats.insightfuls).slice(0, 3);
  const scholars = [...new Map(posts.map(post => [post.author.handle, post.author])).values()].slice(0, 3);
  return <aside className="discovery-sidebar">
    <section className="discovery-section"><div className="section-title"><h2>Worth a read</h2><TrendingUp size={17} /></div><p className="section-description">Ideas the community finds insightful</p><div className="reading-list">{popular.map((post, index) => <Link to={`/post/${post.id}`} key={post.id} className="reading-item"><span className="reading-number">0{index + 1}</span><div><small>{post.category}</small><h3>{post.title}</h3><span>{post.stats.insightfuls} found this insightful</span></div></Link>)}</div></section>
    <section className="discovery-section"><div className="section-title"><h2>Meet the community</h2></div><p className="section-description">People bringing new perspectives</p><div className="scholar-list">{scholars.map(scholar => <Link key={scholar.handle} className="scholar-item" to={`/profile/${scholar.handle.replace('@', '')}`}><Avatar src={scholar.avatar} name={scholar.name} /><div><strong>{scholar.name}</strong><span>{scholar.roleBadge}</span></div><ArrowUpRight size={15} /></Link>)}</div></section>
    <section className="community-card"><BookOpen size={23} /><h2>Different perspectives.<br />Shared respect.</h2><p>Bring your curiosity. Cite your sources. Make room for another point of view.</p><details><summary>Our community principles</summary><ol>{communityGuidelines.map(guide => <li key={guide.id}><strong>{guide.title}</strong><p>{guide.description}</p></li>)}</ol></details></section>
    <footer className="sidebar-footer"><span>FaithNova</span><p>A space for science, faith & thoughtful discovery.</p><small>© {new Date().getFullYear()} FaithNova</small></footer>
  </aside>;
}
