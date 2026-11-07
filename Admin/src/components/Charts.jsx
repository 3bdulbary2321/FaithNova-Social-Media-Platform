import { useState } from 'react';

const SERIES = [
  { key: 'posts', label: 'Posts', color: 'var(--series-1)' },
  { key: 'reports', label: 'Reports', color: 'var(--series-2)' },
  { key: 'users', label: 'New users', color: 'var(--series-3)' },
];

const shortDate = iso => new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

/** Multi-series line chart of daily activity with a hover readout. */
export function ActivityChart({ data }) {
  const [hover, setHover] = useState(null);
  const width = 640, height = 220, padX = 28, padTop = 12, padBottom = 26;
  const max = Math.max(1, ...data.flatMap(day => SERIES.map(s => day[s.key])));
  const niceMax = Math.ceil(max / 4) * 4 || 4;
  const x = i => padX + (i * (width - padX * 2)) / Math.max(1, data.length - 1);
  const y = v => padTop + (1 - v / niceMax) * (height - padTop - padBottom);
  const ticks = [0, niceMax / 4, niceMax / 2, (3 * niceMax) / 4, niceMax];
  const labelEvery = Math.ceil(data.length / 7);
  const active = hover !== null ? data[hover] : null;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        {SERIES.map(s => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ background: s.color }} />{s.label}
            {active && <strong className="tabular-nums text-ink">{active[s.key]}</strong>}
          </span>
        ))}
        {active && <span className="ml-auto font-medium text-ink">{shortDate(active.date)}</span>}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Daily posts, reports and new users"
        onMouseLeave={() => setHover(null)}
        onMouseMove={event => {
          const box = event.currentTarget.getBoundingClientRect();
          const px = ((event.clientX - box.left) / box.width) * width;
          setHover(Math.min(data.length - 1, Math.max(0, Math.round(((px - padX) / (width - padX * 2)) * (data.length - 1)))));
        }}>
        {ticks.map(t => (
          <g key={t}>
            <line x1={padX} x2={width - padX} y1={y(t)} y2={y(t)} stroke="var(--line)" />
            <text x={padX - 6} y={y(t) + 3} textAnchor="end" fontSize="10" fill="var(--muted)">{t}</text>
          </g>
        ))}
        {data.map((day, i) => i % labelEvery === 0 && (
          <text key={day.date} x={x(i)} y={height - 8} textAnchor="middle" fontSize="10" fill="var(--muted)">{shortDate(day.date)}</text>
        ))}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={padTop} y2={height - padBottom} stroke="var(--muted)" strokeDasharray="3 3" />}
        {SERIES.map(s => (
          <g key={s.key}>
            <polyline fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
              points={data.map((day, i) => `${x(i)},${y(day[s.key])}`).join(' ')} />
            {hover !== null && <circle cx={x(hover)} cy={y(data[hover][s.key])} r="4" fill="var(--surface)" stroke={s.color} strokeWidth="2" />}
          </g>
        ))}
      </svg>
    </div>
  );
}

/** Horizontal bars: published (solid) and pending (light) posts per category. */
export function CategoryBars({ categories }) {
  const max = Math.max(1, ...categories.map(c => c.posts_count + c.pending_posts_count));
  if (!categories.length) return <p className="py-6 text-center text-sm text-muted">No categories yet.</p>;
  return (
    <ul className="space-y-3">
      {categories.map(category => (
        <li key={category.id}>
          <div className="mb-1 flex justify-between gap-2 text-sm">
            <span className="truncate font-medium">{category.name}</span>
            <span className="shrink-0 tabular-nums text-muted">
              {category.posts_count}{category.pending_posts_count > 0 && <span className="text-warn"> +{category.pending_posts_count} pending</span>}
            </span>
          </div>
          <div className="flex h-2.5 overflow-hidden rounded-full bg-soft">
            <div className="bg-series-1" style={{ width: `${(category.posts_count / max) * 100}%` }} />
            <div className="bg-warn/50" style={{ width: `${(category.pending_posts_count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Donut of report statuses with a legend. */
export function ReportDonut({ counts }) {
  const parts = [
    { key: 'pending', label: 'Pending', color: 'var(--warn)' },
    { key: 'reviewed', label: 'Content removed', color: 'var(--danger)' },
    { key: 'dismissed', label: 'Dismissed', color: 'var(--success)' },
  ].map(part => ({ ...part, value: Number(counts?.[part.key] ?? 0) }));
  const total = parts.reduce((sum, part) => sum + part.value, 0);
  const radius = 42, circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 110 110" className="size-28 shrink-0 -rotate-90" role="img" aria-label="Reports by status">
        <circle cx="55" cy="55" r={radius} fill="none" stroke="var(--surface-soft)" strokeWidth="14" />
        {total > 0 && parts.map(part => {
          const length = (part.value / total) * circumference;
          const segment = <circle key={part.key} cx="55" cy="55" r={radius} fill="none" stroke={part.color} strokeWidth="14"
            strokeDasharray={`${Math.max(0, length - 2)} ${circumference}`} strokeDashoffset={-offset} />;
          offset += length;
          return segment;
        })}
        <text x="55" y="55" transform="rotate(90 55 55)" textAnchor="middle" dominantBaseline="central" fontSize="20" fontWeight="600" fill="var(--ink)">{total}</text>
      </svg>
      <ul className="space-y-1.5 text-sm">
        {parts.map(part => (
          <li key={part.key} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: part.color }} />
            <span className="text-muted">{part.label}</span>
            <strong className="tabular-nums">{part.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
