import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paperclip, X, ArrowUpRight, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Dialog from './Dialog';

const defaults = ['Astronomy', 'Medicine', 'Physics', 'Biology', 'History', 'Philosophy', 'Neurotheology'];

export default function CreatePostModal({ isOpen, onClose }) {
  const { user, addPost, categories } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const options = categories.length ? categories.map(category => category.name) : defaults;
  const submit = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const title = values.get('title').trim();
    const content = values.get('content').trim();
    if (title.length < 5 || content.length < 20) { setError('Add a title of at least 5 characters and a discussion of at least 20 characters.'); return; }
    setBusy(true);
    setError('');
    try {
      const result = await addPost({
        id: `post-${Date.now()}`, title, content, category: values.get('category'), author: user,
        timestamp: 'Just now', created_at: new Date().toISOString(),
        tags: values.get('tags').split(',').map(tag => tag.trim().replace(/^#/, '')).filter(Boolean),
        religiousReference: values.get('faithSource').trim() ? { source: values.get('faithSource').trim(), scripture: values.get('faithQuote').trim() } : null,
        scientificReference: values.get('scienceSource').trim() ? { citation: values.get('scienceSource').trim(), explanation: values.get('scienceNote').trim() } : null,
        mediaFiles: files,
      });
      if (result?.success) { form.reset(); setFiles([]); onClose(); navigate('/?sort=latest'); }
      else setError(result?.error || 'We couldn’t publish your post. Please try again.');
    } catch { setError('We couldn’t publish your post. Your draft is still here.'); }
    finally { setBusy(false); }
  };
  const selectFiles = event => {
    const selected = Array.from(event.target.files);
    if (selected.some(file => file.size > 20 * 1024 * 1024)) { setError('Each attachment must be smaller than 20 MB.'); return; }
    setFiles(previous => [...previous, ...selected]);
    setError('');
    event.target.value = '';
  };
  return <Dialog open={isOpen} onClose={onClose} title="Start a conversation" description="A question, a discovery, or a different way of seeing things." busy={busy}>
    <form className="editor-form" onSubmit={submit}>
      <label>Title <input name="title" placeholder="Give your idea a clear, thoughtful title" minLength={5} maxLength={200} required /></label>
      <label>Discipline <select name="category">{options.map(option => <option key={option}>{option}</option>)}</select></label>
      <label>Your perspective <textarea name="content" rows={5} placeholder="Share your idea and the thinking behind it…" minLength={20} required /><small>Make space for discussion. Be respectful and specific.</small></label>
      <details className="editor-references"><summary><BookOpen size={17} />Add sources & context <span>Optional</span></summary><div className="editor-reference-fields"><label>Faith or historical source<input name="faithSource" placeholder="Text, author, or reference" /></label><label>Quote or passage<textarea name="faithQuote" rows={2} placeholder="Add a relevant passage" /></label><label>Scientific source<input name="scienceSource" placeholder="Paper title, journal, or DOI" /></label><label>Scientific context<textarea name="scienceNote" rows={2} placeholder="What does this source contribute?" /></label></div></details>
      <label>Tags <input name="tags" placeholder="e.g. Cosmology, Philosophy, Origins" /><small>Separate tags with commas.</small></label>
      <label className="upload-field"><Paperclip size={18} /><span>Add images, video, or a PDF<small>Up to 20 MB per file</small></span><input type="file" accept="image/*,video/*,application/pdf" multiple onChange={selectFiles} /></label>
      {files.length > 0 && <ul className="attachment-list">{files.map((file, index) => <li key={`${file.name}-${index}`}><span>{file.name}</span><button type="button" className="icon-button" aria-label={`Remove ${file.name}`} onClick={() => setFiles(previous => previous.filter((_, i) => i !== index))}><X size={16} /></button></li>)}</ul>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <footer className="dialog-actions"><button className="button" type="button" onClick={onClose} disabled={busy}>Keep draft & close</button><button type="submit" className="button primary" disabled={busy}>{busy ? 'Publishing…' : 'Publish post'}<ArrowUpRight size={16} /></button></footer>
    </form>
  </Dialog>;
}
