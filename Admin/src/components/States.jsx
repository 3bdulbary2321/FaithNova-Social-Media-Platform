import { AlertCircle, Loader2 } from 'lucide-react';

export const Loading = ({ label = 'Loading…' }) => (
  <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted"><Loader2 size={16} className="animate-spin" />{label}</div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
    <AlertCircle className="text-danger" />
    <p className="text-sm">{message}</p>
    {onRetry && <button type="button" className="btn-ghost" onClick={onRetry}>Try again</button>}
  </div>
);

export const Empty = ({ icon: Icon, title, children }) => (
  <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
    {Icon && <Icon className="text-muted" />}
    <p className="font-medium">{title}</p>
    {children && <p className="text-sm text-muted">{children}</p>}
  </div>
);

export const timeAgo = iso => {
  if (!iso) return 'never';
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const units = [[60, 'minute'], [24, 'hour'], [30, 'day'], [12, 'month'], [Infinity, 'year']];
  let value = Math.floor(seconds / 60);
  for (const [size, unit] of units) {
    if (value < size) return `${value} ${unit}${value === 1 ? '' : 's'} ago`;
    value = Math.floor(value / size);
  }
};
