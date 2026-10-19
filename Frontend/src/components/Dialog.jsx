import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Dialog({ open, onClose, title, description, children, busy = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);
  return <dialog ref={ref} className="form-dialog" aria-label={title} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} onClick={event => { if (event.target === ref.current && !busy) onClose(); }}><div className="dialog-content"><header className="dialog-header"><div><h2>{title}</h2>{description && <p>{description}</p>}</div><button type="button" className="icon-button" aria-label="Close dialog" onClick={onClose} disabled={busy}><X size={20} /></button></header>{children}</div></dialog>;
}
