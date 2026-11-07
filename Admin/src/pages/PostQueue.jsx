import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Check, ClipboardList, Trash2, X } from 'lucide-react';
import { errorMessage, moderation } from '../api/client';
import { PageHeader } from '../components/Layout';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { Empty, ErrorState, Loading, timeAgo } from '../components/States';

export default function PostQueue() {
  const { notify } = useOutletContext();
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [reason, setReason] = useState('');

  const load = useCallback(() => {
    setError('');
    moderation.pendingPosts({ page, per_page: 10 }).then(setResult).catch(failure => setError(errorMessage(failure)));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const run = async (id, action) => {
    setBusyId(id);
    try {
      const response = await action();
      notify(response.message);
      load();
    } catch (failure) {
      notify(errorMessage(failure));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader title="Post queue" subtitle="New submissions waiting for approval." />
      {error ? <ErrorState message={error} onRetry={load} />
        : !result ? <Loading />
        : result.data.length === 0 ? <div className="card"><Empty icon={ClipboardList} title="Queue is empty">No posts are waiting for review.</Empty></div>
        : (
          <div className="space-y-3">
            {result.data.map(post => (
              <article key={post.id} className="card p-5">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Avatar user={post.author} size={26} />
                  <span className="font-medium text-ink">{post.author?.name}</span>
                  <span>· {timeAgo(post.created_at)}</span>
                  {post.category && <span className="chip ml-auto bg-accent-soft text-accent">{post.category.name}</span>}
                </div>
                <h3 className="mt-3 font-semibold">{post.title}</h3>
                <p className="mt-1 line-clamp-4 whitespace-pre-line text-sm text-muted">{post.content}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" className="btn-primary" disabled={busyId === post.id} onClick={() => run(post.id, () => moderation.setPostStatus(post.id, 'published'))}><Check size={15} />Publish</button>
                  <button type="button" className="btn-ghost" disabled={busyId === post.id} onClick={() => run(post.id, () => moderation.setPostStatus(post.id, 'rejected'))}><X size={15} />Reject</button>
                  <button type="button" className="btn-ghost text-danger" disabled={busyId === post.id} onClick={() => { setReason(''); setDeleting(post); }}><Trash2 size={15} />Delete</button>
                </div>
              </article>
            ))}
            <Pagination meta={result.meta} onPage={setPage} />
          </div>
        )}

      {deleting && (
        <Modal title="Delete this post?" onClose={() => setDeleting(null)} footer={<>
          <button type="button" className="btn-ghost" onClick={() => setDeleting(null)}>Cancel</button>
          <button type="button" className="btn-danger" onClick={() => { const post = deleting; setDeleting(null); run(post.id, () => moderation.deletePost(post.id, { reason: reason || undefined })); }}>Delete post</button>
        </>}>
          <p className="text-sm text-muted">“{deleting.title}” will be permanently deleted. {deleting.author?.name} will be notified.</p>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">Reason (shown to the author)</span>
            <textarea className="input min-h-20" value={reason} maxLength={1000} onChange={e => setReason(e.target.value)} />
          </label>
        </Modal>
      )}
    </>
  );
}
