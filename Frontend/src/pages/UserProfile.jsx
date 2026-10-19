import Avatar from '../components/Avatar';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Building2, Calendar, Edit3, Share2, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import Dialog from '../components/Dialog';

export default function UserProfile() {
  const { handle } = useParams();
  const { user: currentUser, posts, updateProfile, showToast, isAuthenticated, requireAuth } = useAuth();
  const ownProfile = !handle || handle === currentUser.handle.replace('@', '');
  const author = posts.find(post => post.author.handle.replace('@', '') === handle)?.author;
  const user = ownProfile ? currentUser : author;
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('posts');
  if (!user) return <div className="empty-state"><h1>Profile not found</h1><p>This person’s profile is not available yet.</p><Link to="/" className="button primary">Back to community</Link></div>;
  const published = posts.filter(post => post.author.handle === user.handle || post.author.name === user.name);
  const visible = tab === 'media' ? published.filter(post => post.media) : published;
  const share = async () => {
    if (!requireAuth()) return;
    try { await navigator.clipboard.writeText(`${window.location.origin}/profile/${user.handle.replace('@', '')}`); showToast('Profile link copied.'); }
    catch { showToast('Could not copy the link. Please copy the page address.'); }
  };
  const save = async event => {
    event.preventDefault();
    setBusy(true); setError('');
    const data = new FormData(event.currentTarget);
    const avatar = data.get('avatar');
    if (!avatar?.size) data.delete('avatar');
    try {
      const result = await updateProfile(data);
      if (result.success) setEditing(false);
      else setError(result.error);
    } catch { setError('Could not save your profile. Please try again.'); }
    finally { setBusy(false); }
  };
  return <div className="profile-page"><div className="page-heading"><div><p className="eyebrow">The people behind the ideas</p><h1>{ownProfile ? 'Your profile' : 'Community profile'}</h1></div></div><section className="profile-card"><div className="profile-cover" /><div className="profile-info"><div className="profile-top"><Avatar src={user.avatar} name={user.name} /><div><button className="button" onClick={share} aria-label="Share profile"><Share2 size={16} /></button>{ownProfile && (isAuthenticated ? <button className="button primary" onClick={() => setEditing(true)}><Edit3 size={15} />Edit profile</button> : <Link className="button primary" to="/auth">Sign in to edit</Link>)}</div></div><h1>{user.name}</h1><p className="profile-handle">{user.handle} · {user.title || user.roleBadge || 'Community member'}</p>{user.bio && <p className="profile-bio">{user.bio}</p>}<div className="profile-meta">{user.institution && <span><Building2 size={15} />{user.institution}</span>}{user.joinedDate && <span><Calendar size={15} />{user.joinedDate}</span>}<span><FileText size={15} />{published.length} {published.length === 1 ? 'post' : 'posts'}</span></div></div></section><section className="profile-feed"><div className="category-pills" role="group" aria-label="Profile content"><button className={tab === 'posts' ? 'selected' : ''} aria-pressed={tab === 'posts'} onClick={() => setTab('posts')}>Published posts</button><button className={tab === 'media' ? 'selected' : ''} aria-pressed={tab === 'media'} onClick={() => setTab('media')}>Posts with media</button></div>{visible.length ? <div className="post-list">{visible.map(post => <PostCard key={post.id} post={post} />)}</div> : <div className="empty-state"><FileText size={30} /><h3>{tab === 'media' ? 'No media shared yet' : 'No posts just yet'}</h3><p>{ownProfile ? 'Your contributions will appear here when you publish.' : 'Check back for new ideas from this member.'}</p></div>}</section><Dialog open={editing && ownProfile} onClose={() => setEditing(false)} title="Edit your profile" description="Let the community get to know you." busy={busy}><form key={currentUser.id || currentUser.handle} className="editor-form" onSubmit={save}><label>Full name<input name="name" defaultValue={currentUser.name} required maxLength={100} /></label><label>About you<textarea name="bio" defaultValue={currentUser.bio} rows={4} /></label><label>Profile photo<input name="avatar" type="file" accept="image/*" /></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="dialog-actions"><button type="button" className="button" disabled={busy} onClick={() => setEditing(false)}>Cancel</button><button className="button primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button></div></form></Dialog></div>;
}
