import { useCallback, useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Flag, MessageSquare, MessageSquareText, Trash2 } from 'lucide-react';
import { errorMessage, moderation } from '../api/client';
import { PageHeader } from '../components/Layout';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import SendNotificationModal from '../components/SendNotificationModal';
import { Empty, ErrorState, Loading } from '../components/States';

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'reviewed', label: 'Content removed' },
  { key: 'dismissed', label: 'Dismissed' },
  { key: '', label: 'All' },
];

const statusChip = {
  pending: 'bg-warn-soft text-warn',
  reviewed: 'bg-danger-soft text-danger',
  dismissed: 'bg-success-soft text-success',
};

function ResolveModal({ report, action, onClose, onDone }) {
  const removing = action === 'delete_content';
  const [notes, setNotes] = useState('');
  const [notifyAuthor, setNotifyAuthor] = useState(true);
  const [notifyReporter, setNotifyReporter] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setBusy(true); setError('');
    try {
      const result = await moderation.resolveReport(report.id, {
        action, moderator_notes: notes || undefined, notify_author: notifyAuthor, notify_reporter: notifyReporter,
      });
      onDone(result.message);
    } catch (failure) {
      setError(errorMessage(failure)); setBusy(false);
    }
  };

  return (
    <Modal title={removing ? `Delete this ${report.reportable?.type ?? 'content'}?` : 'Dismiss report?'} onClose={onClose} footer={<>
      <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
      <button type="button" className={removing ? 'btn-danger' : 'btn-primary'} disabled={busy} onClick={submit}>
        {busy ? 'Working…' : removing ? 'Delete content' : 'Dismiss report'}
      </button>
    </>}>
      <p className="text-sm text-muted">
        {removing
          ? 'The content is permanently deleted, and any other pending reports about it are closed.'
          : 'The content stays up and the report is marked as not breaking the rules.'}
      </p>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted">{removing ? 'Note to the author (optional)' : 'Internal note (optional)'}</span>
        <textarea className="input min-h-20" value={notes} maxLength={1000} onChange={e => setNotes(e.target.value)} />
      </label>
      <div className="space-y-2 text-sm">
        {removing && (
          <label className="flex items-center gap-2"><input type="checkbox" checked={notifyAuthor} onChange={e => setNotifyAuthor(e.target.checked)} className="accent-[var(--accent)]" />Notify the author that it was removed</label>
        )}
        <label className="flex items-center gap-2"><input type="checkbox" checked={notifyReporter} onChange={e => setNotifyReporter(e.target.checked)} className="accent-[var(--accent)]" />Tell the reporter the outcome</label>
      </div>
      {error && <p className="text-sm text-danger" role="alert">{error}</p>}
    </Modal>
  );
}

function ReportCard({ report, highlighted, onResolve, onMessage }) {
  const content = report.reportable;
  return (
    <article id={`report-${report.id}`} className={`card p-5 transition ${highlighted ? 'ring-2 ring-accent' : ''}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className={`chip ${statusChip[report.status]}`}>{TABS.find(t => t.key === report.status)?.label}</span>
        <span className="chip bg-soft capitalize text-ink">{report.reportable_type}</span>
        <span>#{report.id} · {report.created_at_human}</span>
      </div>

      <div className="mt-3 flex items-start gap-3">
        <Avatar user={report.reporter} size={30} />
        <div className="min-w-0 text-sm">
          <p><strong>{report.reporter?.name ?? 'Unknown user'}</strong> <span className="text-muted">reported for</span> <strong className="text-danger">{report.reason}</strong></p>
          {report.notes && <p className="mt-1 text-muted">“{report.notes}”</p>}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-line bg-soft p-4">
        {content ? (
          <>
            <div className="mb-2 flex items-center gap-2 text-xs text-muted">
              <Avatar user={content.author} size={22} />
              <span className="font-medium text-ink">{content.author?.name}</span>
              <span>@{content.author?.username}</span>
              {content.type === 'post' && content.status && <span className="chip ml-auto bg-surface">{content.status}</span>}
            </div>
            {content.title && <h3 className="mb-1 font-semibold">{content.title}</h3>}
            <p className="line-clamp-5 whitespace-pre-line text-sm">{content.content}</p>
          </>
        ) : <p className="text-sm italic text-muted">This content has already been deleted.</p>}
      </div>

      {report.status === 'pending' && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="btn-danger" disabled={!content} onClick={() => onResolve(report, 'delete_content')}><Trash2 size={15} />Delete {content?.type ?? 'content'}</button>
          <button type="button" className="btn-ghost" onClick={() => onResolve(report, 'dismiss')}><CheckCircle2 size={15} />Dismiss</button>
          {content?.author?.id && <button type="button" className="btn-ghost" onClick={() => onMessage(content.author, report)}><MessageSquare size={15} />Message author</button>}
          {report.reporter && <button type="button" className="btn-ghost" onClick={() => onMessage(report.reporter, report, true)}><MessageSquareText size={15} />Message reporter</button>}
        </div>
      )}
    </article>
  );
}

export default function Reports() {
  const { notify, refreshUnread } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? 'pending';
  const highlight = Number(params.get('report')) || null;
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [resolving, setResolving] = useState(null);
  const [messaging, setMessaging] = useState(null);

  const load = useCallback(() => {
    setError('');
    moderation.reports({ status: status || undefined, page, per_page: 10 })
      .then(setResult)
      .catch(failure => setError(errorMessage(failure, 'Could not load reports.')));
  }, [status, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (highlight && result) document.getElementById(`report-${highlight}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlight, result]);

  const switchTab = key => { setPage(1); setResult(null); setParams(key === 'pending' ? {} : { status: key }); };

  return (
    <>
      <PageHeader title="Reports" subtitle="Posts and comments flagged by members." />

      <div className="mb-4 flex flex-wrap gap-1 border-b border-line">
        {TABS.map(tab => (
          <button key={tab.label} type="button" onClick={() => switchTab(tab.key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${status === tab.key ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'}`}>{tab.label}</button>
        ))}
      </div>

      {error ? <ErrorState message={error} onRetry={load} />
        : !result ? <Loading />
        : result.data.length === 0 ? <div className="card"><Empty icon={Flag} title={status === 'pending' ? 'All caught up' : 'No reports here'}>{status === 'pending' ? 'There are no reports waiting for review.' : null}</Empty></div>
        : (
          <div className="space-y-3">
            {result.data.map(report => (
              <ReportCard key={report.id} report={report} highlighted={report.id === highlight}
                onResolve={(r, action) => setResolving({ report: r, action })}
                onMessage={(user, r, toReporter) => setMessaging({ user, report: r, toReporter })} />
            ))}
            <Pagination meta={result.meta} onPage={setPage} />
          </div>
        )}

      {resolving && (
        <ResolveModal {...resolving} onClose={() => setResolving(null)}
          onDone={message => { setResolving(null); notify(message); load(); refreshUnread(); }} />
      )}
      {messaging && (
        <SendNotificationModal
          recipients={[messaging.user]}
          defaultTitle={messaging.toReporter ? 'About your report' : 'A note from the moderation team'}
          defaultBody={messaging.toReporter
            ? `Thanks for reporting this ${messaging.report.reportable_type.toLowerCase()}. `
            : `Your ${messaging.report.reportable_type.toLowerCase()} was reported for "${messaging.report.reason}". `}
          onClose={() => setMessaging(null)}
          onSent={notify} />
      )}
    </>
  );
}
