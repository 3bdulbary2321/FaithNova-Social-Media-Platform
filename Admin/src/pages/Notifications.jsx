import { useCallback, useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Bell, CheckCheck, Flag, Megaphone } from 'lucide-react';
import { errorMessage, moderation } from '../api/client';
import { PageHeader } from '../components/Layout';
import Pagination from '../components/Pagination';
import SendNotificationModal from '../components/SendNotificationModal';
import { Empty, ErrorState, Loading } from '../components/States';

export default function Notifications() {
  const { notify, refreshUnread } = useOutletContext();
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [composing, setComposing] = useState(false);

  const load = useCallback(() => {
    setError('');
    moderation.notifications({ page, per_page: 15, unread: onlyUnread ? 1 : undefined })
      .then(setResult)
      .catch(failure => setError(errorMessage(failure, 'Could not load notifications.')));
  }, [page, onlyUnread]);

  useEffect(() => { load(); }, [load]);

  const markRead = async ids => {
    await moderation.markRead(ids).catch(() => {});
    load(); refreshUnread();
  };

  const items = result?.data.data ?? [];

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="New reports from members land here. You can also send messages to members."
        actions={<>
          <button type="button" className="btn-ghost" onClick={() => markRead()} disabled={!result?.unread_count}><CheckCheck size={15} />Mark all read</button>
          <button type="button" className="btn-primary" onClick={() => setComposing(true)}><Megaphone size={15} />Send notification</button>
        </>}
      />

      <div className="mb-4 flex gap-1">
        {[[false, 'All'], [true, `Unread${result ? ` (${result.unread_count})` : ''}`]].map(([value, label]) => (
          <button key={label} type="button" onClick={() => { setOnlyUnread(value); setPage(1); }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${onlyUnread === value ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-soft'}`}>{label}</button>
        ))}
      </div>

      {error ? <ErrorState message={error} onRetry={load} />
        : !result ? <Loading />
        : items.length === 0 ? <div className="card"><Empty icon={Bell} title="No notifications">When a member reports a post or comment, it shows up here.</Empty></div>
        : (
          <div className="card divide-y divide-line">
            {items.map(item => {
              const isReport = item.kind === 'report';
              const Icon = isReport ? Flag : Bell;
              return (
                <div key={item.id} className={`flex gap-3 px-4 py-3.5 ${item.read ? '' : 'bg-accent-soft/40'}`}>
                  <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${isReport ? 'bg-danger-soft text-danger' : 'bg-accent-soft text-accent'}`}><Icon size={16} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-semibold">{item.title}{!item.read && <span className="size-2 rounded-full bg-accent" aria-label="Unread" />}</p>
                    <p className="text-sm text-muted">{item.body}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted">
                      <span>{item.created_at_human}</span>
                      {isReport && item.data.report_id && (
                        <Link to={`/reports?status=&report=${item.data.report_id}`} onClick={() => !item.read && markRead([item.id])} className="font-semibold text-accent">Review report</Link>
                      )}
                      {!item.read && <button type="button" className="font-medium hover:text-ink" onClick={() => markRead([item.id])}>Mark read</button>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      <Pagination meta={result?.data.meta} onPage={setPage} />

      {composing && <SendNotificationModal onClose={() => setComposing(false)} onSent={notify} />}
    </>
  );
}
