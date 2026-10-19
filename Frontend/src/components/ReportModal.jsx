import { useState } from 'react';
import Dialog from './Dialog';

const reasons = [
  ['disrespect', 'Disrespectful behavior', 'Personal attacks or hostile conversation.'],
  ['misinformation', 'Misinformation or fabricated sources', 'False citations or misleading research.'],
  ['offtopic', 'Off-topic content', 'Content unrelated to the discussion or community.'],
  ['spam', 'Spam or promotion', 'Duplicate posts, advertising, or unsolicited links.'],
];

export default function ReportModal({ isOpen, onClose, targetType = 'post', targetTitle = '', onSubmitReport }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true); setError('');
    try {
      await onSubmitReport?.({ reason: data.get('reason'), notes: data.get('notes').trim(), targetType });
      form.reset(); onClose();
    } catch (failure) { setError(failure.message || 'Could not send this report. Please try again.'); }
    finally { setBusy(false); }
  };
  return <Dialog open={isOpen} onClose={onClose} title={`Report ${targetType}`} description="Help us keep conversations respectful and constructive." busy={busy}><form className="editor-form" onSubmit={submit}>{targetTitle && <p className="report-target">{targetTitle}</p>}<fieldset className="report-reasons"><legend>What’s the issue?</legend>{reasons.map(([id, label, description], index) => <label key={id}><input type="radio" name="reason" value={id} defaultChecked={index === 0} /><span><strong>{label}</strong><small>{description}</small></span></label>)}</fieldset><label>Additional context <span className="optional">Optional</span><textarea name="notes" maxLength={300} rows={3} placeholder="Tell us what the moderation team should know…" /></label>{error && <p className="form-error" role="alert">{error}</p>}<footer className="dialog-actions"><button type="button" className="button" onClick={onClose} disabled={busy}>Cancel</button><button className="button primary" disabled={busy}>{busy ? 'Sending…' : 'Send report'}</button></footer></form></Dialog>;
}
