import { useState } from 'react';
import { Send } from 'lucide-react';
import Modal from './Modal';
import { errorMessage, moderation } from '../api/client';

/** Compose a message to specific members (`recipients`) or, when none are given, optionally to everyone. */
export default function SendNotificationModal({ recipients = [], defaultTitle = '', defaultBody = '', onClose, onSent }) {
  const [audience, setAudience] = useState(recipients.length ? 'users' : 'all');
  const [title, setTitle] = useState(defaultTitle);
  const [body, setBody] = useState(defaultBody);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async event => {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const result = await moderation.sendNotification({
        audience,
        user_ids: audience === 'users' ? recipients.map(r => r.id) : undefined,
        title, body,
      });
      onSent?.(result.message);
      onClose();
    } catch (failure) {
      setError(errorMessage(failure));
      setBusy(false);
    }
  };

  return (
    <Modal title="Send notification" onClose={onClose} footer={<>
      <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
      <button type="submit" form="send-notification" className="btn-primary" disabled={busy || !title.trim() || !body.trim()}>
        <Send size={15} />{busy ? 'Sending…' : 'Send'}
      </button>
    </>}>
      <form id="send-notification" onSubmit={submit} className="space-y-4">
        <fieldset className="flex gap-2">
          <legend className="mb-1.5 text-xs font-medium text-muted">Send to</legend>
          {recipients.length > 0 && (
            <label className={`btn-ghost cursor-pointer ${audience === 'users' ? 'border-accent text-accent' : ''}`}>
              <input type="radio" className="sr-only" checked={audience === 'users'} onChange={() => setAudience('users')} />
              {recipients.length === 1 ? recipients[0].name : `${recipients.length} members`}
            </label>
          )}
          <label className={`btn-ghost cursor-pointer ${audience === 'all' ? 'border-accent text-accent' : ''}`}>
            <input type="radio" className="sr-only" checked={audience === 'all'} onChange={() => setAudience('all')} />
            All members
          </label>
        </fieldset>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Title</span>
          <input className="input" value={title} maxLength={120} onChange={e => setTitle(e.target.value)} required />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Message</span>
          <textarea className="input min-h-28" value={body} maxLength={2000} onChange={e => setBody(e.target.value)} required />
        </label>
        {audience === 'all' && <p className="rounded-xl bg-warn-soft px-3 py-2 text-xs text-warn">This goes to every active member of the platform.</p>}
        {error && <p className="text-sm text-danger" role="alert">{error}</p>}
      </form>
    </Modal>
  );
}
