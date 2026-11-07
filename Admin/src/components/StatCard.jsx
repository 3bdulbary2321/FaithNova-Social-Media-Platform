const tones = {
  accent: 'bg-accent-soft text-accent',
  danger: 'bg-danger-soft text-danger',
  success: 'bg-success-soft text-success',
  warn: 'bg-warn-soft text-warn',
};

export default function StatCard({ icon: Icon, label, value, hint, tone = 'accent' }) {
  return (
    <div className="card flex items-start gap-3 p-4">
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tones[tone]}`}><Icon size={18} /></span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted">{label}</p>
        <p className="font-heading text-2xl font-semibold tabular-nums">{value ?? '—'}</p>
        {hint && <p className="truncate text-xs text-muted">{hint}</p>}
      </div>
    </div>
  );
}
