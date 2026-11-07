import { useCallback, useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { Ban, MessageSquare, Search, ShieldCheck, Undo2, Users } from 'lucide-react';
import { errorMessage, moderation } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/Layout';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import SendNotificationModal from '../components/SendNotificationModal';
import { Empty, ErrorState, Loading, timeAgo } from '../components/States';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active now' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'staff', label: 'Staff' },
];
const SORTS = [
  { key: 'newest', label: 'Newest' },
  { key: 'followers', label: 'Most followers' },
  { key: 'posts', label: 'Most posts' },
  { key: 'active', label: 'Recently active' },
];

const isOnline = iso => iso && Date.now() - new Date(iso).getTime() < 15 * 60 * 1000;

export default function UsersPage() {
  const { user: me } = useAuth();
  const { notify } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const filter = params.get('filter') ?? 'all';
  const sort = params.get('sort') ?? 'newest';
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [blocking, setBlocking] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [messaging, setMessaging] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => { setQuery(search.trim()); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(() => {
    setError('');
    moderation.users({ filter, sort, search: query || undefined, page, per_page: 15 })
      .then(setResult)
      .catch(failure => setError(errorMessage(failure, 'Could not load users.')));
  }, [filter, sort, query, page]);

  useEffect(() => { load(); }, [load]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next); setPage(1);
  };

  const canBlock = target => target.id !== me.id && target.role !== 'admin' && (target.role === 'user' || me.role === 'admin');

  const toggleBlock = async (target, reason) => {
    try {
      const response = target.is_blocked ? await moderation.unblockUser(target.id) : await moderation.blockUser(target.id, reason || undefined);
      notify(response.message);
      load();
    } catch (failure) {
      notify(errorMessage(failure));
    }
  };

  return (
    <>
      <PageHeader title="Users" subtitle="Search members, see who is online, and block accounts that break the rules." />

      <div className="card mb-4 flex flex-col gap-3 p-3 md:flex-row md:items-center">
        <label className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input pl-9" placeholder="Search by name, username or email" value={search} onChange={e => setSearch(e.target.value)} />
        </label>
        <div className="flex flex-wrap gap-1">
          {FILTERS.map(f => (
            <button key={f.key} type="button" onClick={() => update('filter', f.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${filter === f.key ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-soft'}`}>{f.label}</button>
          ))}
        </div>
        <select className="input md:w-44" value={sort} onChange={e => update('sort', e.target.value)} aria-label="Sort users">
          {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      {error ? <ErrorState message={error} onRetry={load} />
        : !result ? <Loading />
        : result.data.length === 0 ? <div className="card"><Empty icon={Users} title="No users found" /></div>
        : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-soft text-left text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Member</th>
                    <th className="px-4 py-3 text-right font-semibold">Followers</th>
                    <th className="px-4 py-3 text-right font-semibold">Posts</th>
                    <th className="px-4 py-3 text-right font-semibold">Comments</th>
                    <th className="px-4 py-3 font-semibold">Last active</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {result.data.map(member => (
                    <tr key={member.id} className={member.is_blocked ? 'bg-danger-soft/40' : ''}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="relative">
                            <Avatar user={member} size={34} />
                            {isOnline(member.last_active_at) && <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-surface bg-success" />}
                          </span>
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 font-medium">{member.name}{member.is_moderator && <ShieldCheck size={14} className="text-accent" aria-label={member.role} />}</p>
                            <p className="truncate text-xs text-muted">@{member.username} · {member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{member.followers_count}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{member.posts_count}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{member.comments_count}</td>
                      <td className="px-4 py-3 text-muted">{isOnline(member.last_active_at) ? <span className="font-medium text-success">Online</span> : timeAgo(member.last_active_at)}</td>
                      <td className="px-4 py-3">
                        {member.is_blocked
                          ? <span className="chip bg-danger-soft text-danger" title={member.block_reason || undefined}>Blocked</span>
                          : <span className="chip bg-soft capitalize text-muted">{member.role}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button type="button" className="rounded-lg p-2 text-muted hover:bg-soft hover:text-accent" title="Send notification" aria-label={`Message ${member.name}`} onClick={() => setMessaging(member)}><MessageSquare size={16} /></button>
                          {member.is_blocked
                            ? <button type="button" className="rounded-lg p-2 text-muted hover:bg-soft hover:text-success" title="Unblock" aria-label={`Unblock ${member.name}`} onClick={() => toggleBlock(member)}><Undo2 size={16} /></button>
                            : canBlock(member) && <button type="button" className="rounded-lg p-2 text-muted hover:bg-soft hover:text-danger" title="Block" aria-label={`Block ${member.name}`} onClick={() => { setBlockReason(''); setBlocking(member); }}><Ban size={16} /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 pb-4"><Pagination meta={result.meta} onPage={setPage} /></div>
          </div>
        )}

      {blocking && (
        <Modal title={`Block ${blocking.name}?`} onClose={() => setBlocking(null)} footer={<>
          <button type="button" className="btn-ghost" onClick={() => setBlocking(null)}>Cancel</button>
          <button type="button" className="btn-danger" onClick={() => { toggleBlock(blocking, blockReason); setBlocking(null); }}><Ban size={15} />Block account</button>
        </>}>
          <p className="text-sm text-muted">They are signed out everywhere right away and can't sign in again until they are unblocked.</p>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">Reason (shared with the member)</span>
            <input className="input" value={blockReason} maxLength={500} onChange={e => setBlockReason(e.target.value)} />
          </label>
        </Modal>
      )}
      {messaging && <SendNotificationModal recipients={[messaging]} onClose={() => setMessaging(null)} onSent={notify} />}
    </>
  );
}
