import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Ban, ClipboardList, FileText, Flag, Heart, RefreshCw, UserPlus, Users } from 'lucide-react';
import { moderation, errorMessage } from '../api/client';
import { PageHeader } from '../components/Layout';
import StatCard from '../components/StatCard';
import Avatar from '../components/Avatar';
import { ActivityChart, CategoryBars, ReportDonut } from '../components/Charts';
import { Empty, ErrorState, Loading, timeAgo } from '../components/States';

const RANGES = [7, 14, 30];

function Panel({ title, action, children, className = '' }) {
  return (
    <section className={`card p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function UserRow({ user, metric }) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <Avatar user={user} size={34} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="truncate text-xs text-muted">@{user.username}</p>
      </div>
      <span className="shrink-0 text-sm tabular-nums text-muted">{metric}</span>
    </li>
  );
}

export default function Overview() {
  const [days, setDays] = useState(14);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    setRefreshing(true); setError('');
    moderation.overview(days)
      .then(setData)
      .catch(failure => setError(errorMessage(failure, 'Could not load the dashboard.')))
      .finally(() => setRefreshing(false));
  }, [days]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, [load]);

  if (error && !data) return <ErrorState message={error} onRetry={load} />;
  if (!data) return <Loading />;

  const { stats } = data;

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="Community health at a glance. Refreshes every minute."
        actions={<>
          <div className="flex rounded-xl border border-line bg-surface p-0.5">
            {RANGES.map(range => (
              <button key={range} type="button" onClick={() => setDays(range)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${days === range ? 'bg-accent-soft text-accent' : 'text-muted hover:text-ink'}`}>{range}d</button>
            ))}
          </div>
          <button type="button" className="btn-ghost" onClick={load} disabled={refreshing} aria-label="Refresh">
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </>}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Activity} tone="success" label="Active now" value={stats.active_users_count} hint="Used the app in the last 15 min" />
        <StatCard icon={Users} label="Total users" value={stats.total_users_count} hint={`+${stats.new_users_count} in the last ${days} days`} />
        <StatCard icon={Flag} tone="danger" label="Pending reports" value={stats.pending_reports_count} hint={`${stats.reviewed_reports_count} resolved`} />
        <StatCard icon={ClipboardList} tone="warn" label="Posts awaiting review" value={stats.pending_posts_count} hint={`${stats.total_published_posts_count} published`} />
        <StatCard icon={FileText} label="Published posts" value={stats.total_published_posts_count} hint={`${stats.total_comments_count} comments`} />
        <StatCard icon={Heart} label="Follows" value={stats.total_follows_count} hint="Connections between members" />
        <StatCard icon={UserPlus} tone="success" label="New users" value={stats.new_users_count} hint={`Last ${days} days`} />
        <StatCard icon={Ban} tone="danger" label="Blocked users" value={stats.blocked_users_count} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title={`Activity · last ${days} days`} className="xl:col-span-2">
          <ActivityChart data={data.activity} />
        </Panel>
        <Panel title="Reports by status" action={<Link to="/reports" className="text-sm font-medium text-accent">Open reports</Link>}>
          <ReportDonut counts={data.reports_by_status} />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Panel title="Posts by category">
          <CategoryBars categories={data.posts_by_category} />
        </Panel>

        <Panel title="Most followed accounts" action={<Link to="/users?sort=followers" className="text-sm font-medium text-accent">See all</Link>}>
          {data.top_followed.length
            ? <ul className="divide-y divide-line">{data.top_followed.map(user => <UserRow key={user.id} user={user} metric={`${user.followers_count} followers`} />)}</ul>
            : <Empty title="No accounts yet" />}
          {data.top_posters.length > 0 && <>
            <h3 className="mb-1 mt-5 text-sm font-semibold text-muted">Most posts</h3>
            <ul className="divide-y divide-line">{data.top_posters.map(user => <UserRow key={user.id} user={user} metric={`${user.posts_count} posts`} />)}</ul>
          </>}
        </Panel>

        <Panel title="Active users" action={<Link to="/users?filter=active" className="text-sm font-medium text-accent">See all</Link>}>
          {data.active_users.length ? (
            <ul className="divide-y divide-line">
              {data.active_users.map(user => (
                <li key={user.id} className="flex items-center gap-3 py-2.5">
                  <span className="relative">
                    <Avatar user={user} size={34} />
                    <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-surface bg-success" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted">@{user.username}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">{timeAgo(user.last_active_at)}</span>
                </li>
              ))}
            </ul>
          ) : <Empty icon={Activity} title="Nobody online right now">Members show here for 15 minutes after their last request.</Empty>}
        </Panel>
      </div>
    </>
  );
}
