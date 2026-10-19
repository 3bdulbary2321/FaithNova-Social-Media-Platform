import Avatar from './Avatar';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Atom, ThumbsUp, Lightbulb, MessageSquare, Share2, Bookmark, ShieldCheck, FileText, Check, Flag, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ReportModal from './ReportModal';
import api from '../api/axios';

export default function PostCard({ post, expanded = false }) {
  const { bookmarkedIds, toggleBookmark, toggleReaction, showToast } = useAuth();
  const [reaction, setReaction] = useState(post.user_reaction);
  const [counts, setCounts] = useState({ like: post.stats.likes, insightful: post.stats.insightfuls });
  const [pending, setPending] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => { setCounts({ like: post.stats.likes, insightful: post.stats.insightfuls }); setReaction(post.user_reaction); }, [post.stats.likes, post.stats.insightfuls, post.user_reaction]);
  const Heading = expanded ? 'h1' : 'h2';
  const isSaved = bookmarkedIds.includes(post.id);
  const readTime = Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200));
  const react = async type => {
    if (pending) return;
    setPending(true);
    const next = reaction === type ? null : type;
    setCounts(previous => ({
      like: Math.max(0, previous.like + Number(next === 'like') - Number(reaction === 'like')),
      insightful: Math.max(0, previous.insightful + Number(next === 'insightful') - Number(reaction === 'insightful')),
    }));
    setReaction(next);
    try {
      const result = await toggleReaction(post.id, type);
      if (result?.stats) {
        setCounts({ like: result.stats.likes_count, insightful: result.stats.insightfuls_count });
        setReaction(result.user_reaction);
      }
    } finally { setPending(false); }
  };
  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
      setCopied(true);
      showToast('Post link copied.');
      setTimeout(() => setCopied(false), 2000);
    } catch { showToast('Could not copy the link. Open the post and copy its address.'); }
  };
  const report = async data => {
    try {
      await api.post('/reports', { reportable_type: 'post', reportable_id: post.id, reason: data.reason, notes: data.notes || null });
      showToast('Report sent to the moderation team.');
    } catch { throw new Error('Could not send your report. Please try again when connected.'); }
  };
  return (
    <article className="post-card">
      <header className="post-header"><Link to={`/profile/${post.author.handle.replace('@', '')}`} className="post-author"><Avatar src={post.author.avatar} name={post.author.name} /><div><strong>{post.author.name}{post.author.isVerified && <ShieldCheck size={14} aria-label="Verified" />}</strong><span>{post.author.roleBadge} <span aria-hidden="true">·</span> {post.timestamp}</span></div></Link><button className={`icon-button ${isSaved ? 'is-active' : ''}`} onClick={() => toggleBookmark(post.id)} aria-label={isSaved ? 'Remove from saved posts' : 'Save post'} aria-pressed={isSaved}><Bookmark size={19} fill={isSaved ? 'currentColor' : 'none'} /></button></header>
      <div className="post-body"><div className="post-meta"><Link to={`/?category=${encodeURIComponent(post.category)}`} className="discipline-label">{post.category}</Link><span>{readTime} min read</span></div><Heading><Link to={`/post/${post.id}`}>{post.title}</Link></Heading><p className={expanded ? "post-full-content" : "post-excerpt"}>{post.content}</p>{!expanded && <Link to={`/post/${post.id}`} className="read-discussion">Read discussion <ArrowUpRight size={15} /></Link>}
        {post.media?.type === 'image' && <Link to={`/post/${post.id}`} className="post-media" aria-label={`Open ${post.title}`}>{post.media.items.slice(0, 2).map((item, index) => <img key={index} src={item.url} alt={item.alt || item.caption || 'Attached research image'} loading="lazy" />)}</Link>}
        {post.media?.type === 'pdf' && <a href={expanded ? post.media.document.downloadUrl || undefined : `/post/${post.id}`} className="attachment-link" target={expanded && post.media.document.downloadUrl ? "_blank" : undefined} rel="noreferrer"><FileText size={20} /><span>{post.media.document.title}<small>{expanded ? post.media.document.downloadUrl ? "Open research document" : "Document preview · Download unavailable" : "Research document · View in discussion"}</small></span><ArrowUpRight size={16} /></a>}
        {post.media?.type === 'video' && <div>{expanded && post.media.video.url ? <video controls preload="metadata" className="post-video" src={post.media.video.url} poster={post.media.video.poster} /> : <Link to={`/post/${post.id}`} className="attachment-link"><FileText size={20} /><span>{post.media.video.title}<small>{expanded ? "Presentation preview · Video unavailable" : "Presentation · View in discussion"}</small></span><ArrowUpRight size={16} /></Link>}</div>}
        {(post.religiousReference || post.scientificReference) && <details className="post-references" open={expanded || undefined}><summary><BookOpen size={16} /><span>Sources & perspectives</span><span className="reference-count">{Number(Boolean(post.religiousReference)) + Number(Boolean(post.scientificReference))} references</span></summary><div className="reference-grid">{post.religiousReference && <section><h3><BookOpen size={15} />Faith perspective</h3><strong>{post.religiousReference.source}</strong><blockquote>{post.religiousReference.scripture}</blockquote><p>{post.religiousReference.exegesis}</p></section>}{post.scientificReference && <section><h3><Atom size={15} />Scientific perspective</h3><strong>{post.scientificReference.citation}</strong><p>{post.scientificReference.paperTitle}</p><p>{post.scientificReference.explanation}</p></section>}</div></details>}
        <div className="post-tags">{post.tags.slice(0, 3).map(tag => <Link key={tag} to={`/?q=${encodeURIComponent(tag)}`}>#{tag}</Link>)}</div>
      </div>
      <footer className="post-actions"><div><button disabled={pending} className={reaction === 'like' ? 'is-active' : ''} aria-label={`Like post, ${counts.like} likes`} aria-pressed={reaction === 'like'} onClick={() => react('like')}><ThumbsUp size={17} /><span>{counts.like}</span></button><button disabled={pending} className={reaction === 'insightful' ? 'is-active' : ''} aria-label={`Mark insightful, ${counts.insightful} reactions`} aria-pressed={reaction === 'insightful'} onClick={() => react('insightful')}><Lightbulb size={17} /><span>{counts.insightful}</span><span className="action-label">Insightful</span></button><Link to={`/post/${post.id}#discussion`} aria-label="Read comments"><MessageSquare size={17} /><span>{post.stats.commentsCount || post.comments.length}</span></Link></div><div><button onClick={share} aria-label="Copy post link">{copied ? <Check size={17} /> : <Share2 size={17} />}</button><button onClick={() => setReportOpen(true)} aria-label="Report post"><Flag size={16} /></button></div></footer>
      {reportOpen && <ReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} targetType="post" targetTitle={post.title} onSubmitReport={report} />}
    </article>
  );
}
