import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import CommentSection from '../components/CommentSection';
import api from '../api/axios';
import { normalizePost } from '../api/normalizer';

function PostReader({ postId }) {
  const { posts, showToast } = useAuth();
  const { hash } = useLocation();
  const cached = posts.find(post => String(post.id) === String(postId));
  const [remote, setRemote] = useState(null);
  const [loading, setLoading] = useState(true);
  const post = remote || cached;
  useEffect(() => {
    let active = true;
    api.get(`/posts/${postId}`).then(response => {
      if (active && response.data?.data) setRemote(normalizePost(response.data.data));
    }).catch(() => {}).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [postId]);
  useEffect(() => {
    if (post && hash === '#discussion') document.getElementById('discussion')?.scrollIntoView({ block: 'start' });
  }, [post?.id, hash]);
  if (!post) return <div className="empty-state"><h1>{loading ? 'Loading discussion…' : 'Discussion not found'}</h1><p>{loading ? 'Getting the latest conversation.' : 'This post may have been removed or is currently unavailable.'}</p><Link to="/" className="button primary">Back to community</Link></div>;
  return <div className="detail-page"><Link className="back-link" to="/"><ArrowLeft size={16} />Back to discussions</Link><PostCard key={`${post.id}-${remote ? 'loaded' : 'cached'}`} post={post} expanded /><div id="discussion" className="discussion-section"><CommentSection key={`${post.id}-${remote ? 'loaded' : 'cached'}`} comments={post.comments} onAddComment={async comment => {
    try { await api.post(`/posts/${post.id}/comments`, { content: comment.text, parent_id: comment.parentId || null }); }
    catch { showToast('Your comment is visible in this session only. It could not be saved to the server.'); }
  }} /></div></div>;
}

export default function PostDetail() {
  const { postId } = useParams();
  return <PostReader key={postId} postId={postId} />;
}
