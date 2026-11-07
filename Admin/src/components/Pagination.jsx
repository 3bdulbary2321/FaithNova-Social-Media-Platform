export default function Pagination({ meta, onPage }) {
  if (!meta || meta.last_page <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 pt-4 text-sm text-muted">
      <span>Page {meta.current_page} of {meta.last_page} · {meta.total} total</span>
      <div className="flex gap-2">
        <button type="button" className="btn-ghost" disabled={meta.current_page <= 1} onClick={() => onPage(meta.current_page - 1)}>Previous</button>
        <button type="button" className="btn-ghost" disabled={meta.current_page >= meta.last_page} onClick={() => onPage(meta.current_page + 1)}>Next</button>
      </div>
    </div>
  );
}
