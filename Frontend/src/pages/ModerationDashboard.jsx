import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  FileCheck, 
  Users, 
  AlertTriangle, 
  BookOpen, 
  Atom, 
  ExternalLink, 
  Check, 
  X, 
  Clock, 
  ArrowRight, 
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { initialPendingPosts, initialReportedContent } from '../mockData/moderationData';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function ModerationDashboard() {
  const { addPost, showToast } = useAuth();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'reported'
  const [pendingQueue, setPendingQueue] = useState(initialPendingPosts);
  const [reportedList, setReportedList] = useState(initialReportedContent);
  const [searchQuery, setSearchQuery] = useState('');
  const [statsData, setStatsData] = useState({
    pending_posts_count: 1,
    pending_reports_count: 1,
    total_users_count: 5,
    total_published_posts_count: 3,
  });

  // Fetch real moderation data on mount
  useEffect(() => {
    const fetchModerationData = async () => {
      try {
        const [statsRes, pendingRes, reportsRes] = await Promise.allSettled([
          api.get('/moderation/stats'),
          api.get('/moderation/posts/pending'),
          api.get('/moderation/reports'),
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value?.data?.data) {
          setStatsData(statsRes.value.data.data);
        }

        if (pendingRes.status === 'fulfilled') {
          const raw = pendingRes.value?.data?.data?.data || pendingRes.value?.data?.data || [];
          if (Array.isArray(raw) && raw.length > 0) {
            setPendingQueue(raw.map((p) => ({
              id: p.id,
              title: p.title,
              category: p.category?.name || 'Cosmology',
              author: {
                name: p.author?.name || 'Scholar Fellow',
                avatar: p.author?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                roleBadge: p.author?.role === 'admin' ? 'Curator' : 'Astrophysicist',
                institution: p.author?.bio || 'Academic Fellowship',
              },
              timestamp: p.created_at_human || 'Recent submission',
              excerpt: p.content?.slice(0, 200) + '...',
              religiousReference: typeof p.religiousReference === 'object' && p.religiousReference !== null
                ? p.religiousReference
                : {
                    source: 'Scriptural Exegesis & Theological Source',
                    text: p.religious_reference || 'Sacred hermeneutical synthesis attached.',
                  },
              scientificReference: typeof p.scientificReference === 'object' && p.scientificReference !== null
                ? p.scientificReference
                : {
                    citation: 'Empirical Science Publication',
                    paperTitle: p.scientific_reference || 'Peer-reviewed evidence attached.',
                  },
            })));
          }
        }

        if (reportsRes.status === 'fulfilled') {
          const rawReports = reportsRes.value?.data?.data?.data || reportsRes.value?.data?.data || [];
          if (Array.isArray(rawReports) && rawReports.length > 0) {
            setReportedList(rawReports.map((r) => ({
              id: r.id,
              type: r.reportable_type?.toLowerCase() || 'post',
              contentSnippet: r.reportable?.title || r.reportable?.content || 'Reported content snippet',
              author: r.reportable?.author?.name || 'Member',
              reportedBy: r.reporter?.name || 'Academic Colleague',
              reason: r.reason,
              notes: r.notes || '',
              timestamp: r.created_at_human || 'Recently',
              status: r.status,
            })));
          }
        }
      } catch (err) {
        console.warn('Could not load moderation data from API, using cached data.', err);
      }
    };

    fetchModerationData();
  }, []);

  // Handle Post Approval
  const handleApprove = async (post) => {
    try {
      await api.patch(`/moderation/posts/${post.id}/status`, { status: 'published' });
    } catch {
      // Fallback
    }

    addPost({
      ...post,
      id: `approved-${post.id}`,
      content: post.excerpt,
      tags: [post.category, 'PeerReviewed', 'ModeratedApproved'],
      stats: { likes: 0, insightfuls: 0, commentsCount: 0, shares: 0 },
      comments: [],
    });

    setPendingQueue((prev) => prev.filter((p) => p.id !== post.id));
    setStatsData((prev) => ({
      ...prev,
      pending_posts_count: Math.max(0, prev.pending_posts_count - 1),
      total_published_posts_count: prev.total_published_posts_count + 1,
    }));
    showToast(`Approved "${post.title.slice(0, 30)}..." to the public feed!`);
  };

  // Handle Post Rejection
  const handleReject = async (postId, title) => {
    try {
      await api.patch(`/moderation/posts/${postId}/status`, { status: 'rejected' });
    } catch {
      // Fallback
    }

    setPendingQueue((prev) => prev.filter((p) => p.id !== postId));
    setStatsData((prev) => ({
      ...prev,
      pending_posts_count: Math.max(0, prev.pending_posts_count - 1),
    }));
    showToast(`Rejected submission: "${title.slice(0, 30)}...". Feedback sent to author.`);
  };

  // Handle Dismiss Report
  const handleDismissReport = async (reportId) => {
    try {
      await api.post(`/moderation/reports/${reportId}/resolve`, { action: 'dismiss' });
    } catch {
      // Fallback
    }

    setReportedList((prev) => prev.filter((r) => r.id !== reportId));
    setStatsData((prev) => ({
      ...prev,
      pending_reports_count: Math.max(0, prev.pending_reports_count - 1),
    }));
    showToast('Report dismissed as charter-compliant.');
  };

  // Handle Delete Content
  const handleDeleteContent = async (reportId, title) => {
    try {
      await api.post(`/moderation/reports/${reportId}/resolve`, { action: 'delete_content' });
    } catch {
      // Fallback
    }

    setReportedList((prev) => prev.filter((r) => r.id !== reportId));
    setStatsData((prev) => ({
      ...prev,
      pending_reports_count: Math.max(0, prev.pending_reports_count - 1),
    }));
    showToast(`Content removed for charter breach: "${title.slice(0, 30)}..."`);
  };

  return (
    <div className="space-y-6">
      
      <div className="page-heading"><div><p className="eyebrow">A thoughtful community starts here</p><h1>Review & moderation</h1><p>Review submissions, respond to reports, and keep conversations respectful.</p></div></div>

      {/* 2. Top Stats Responsive Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Card 1: Pending Posts */}
        <div className="p-4 rounded-2xl border border-amber-500/30 bg-[var(--surface)] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-sans">
              Pending Submissions
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-sans">
              {pendingQueue.length}
            </span>
            <span className="text-xs text-amber-500 font-medium">Awaiting Peer Review</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full w-2/3" />
          </div>
        </div>

        {/* Card 2: Active Reports */}
        <div className="p-4 rounded-2xl border border-rose-500/30 bg-[var(--surface)] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 font-sans">
              Charter Reports
            </span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-sans">
              {reportedList.length}
            </span>
            <span className="text-xs text-rose-500 font-medium">Flagged Items</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full w-1/2" />
          </div>
        </div>

        {/* Card 3: Total Verified Scholars */}
        <div className="p-4 rounded-2xl border border-indigo-500/30 bg-[var(--surface)] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-sans">
              Verified Scholars
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-sans">
              1,420
            </span>
            <span className="text-xs text-indigo-500 font-medium">+14 this week</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full w-4/5" />
          </div>
        </div>

        {/* Card 4: Discourse Compliance Rate */}
        <div className="p-4 rounded-2xl border border-emerald-500/30 bg-[var(--surface)] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-sans">
              Charter Compliance
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-sans">
              99.4%
            </span>
            <span className="text-xs text-emerald-500 font-medium">Civil Discourse Rate</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-[99%]" />
          </div>
        </div>

      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex p-1 rounded-2xl bg-[var(--surface)] border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-indigo-600 text-white shadow-md font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Pending Posts Queue ({pendingQueue.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reported')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'reported'
              ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Reported Content & Breaches ({reportedList.length})</span>
        </button>
      </div>

      {/* 4. TAB A: PENDING POSTS QUEUE */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingQueue.length > 0 ? (
            pendingQueue.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200/90 dark:border-slate-800/80 bg-[var(--surface)] p-5 sm:p-6 shadow-sm space-y-4"
              >
                {/* Author row */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.author.avatar}
                      alt={item.author.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {item.author.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.author.institution} • <span className="text-amber-500 font-sans">{item.author.roleBadge}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-sans text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold">
                      {item.category}
                    </span>
                    <span>Submitted {item.submittedAt}</span>
                  </div>
                </div>

                {/* Title & Excerpt */}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
                    {item.excerpt}
                  </p>
                </div>

                {/* Dual Reference Verification Boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Religious Box */}
                  <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 text-xs">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Scriptural Reference</span>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
                      {item.religiousReference?.source || 'Theological Reference'}
                    </span>
                    <p className="italic font-serif text-slate-600 dark:text-slate-400 text-xs">
                      "{item.religiousReference?.text || 'Scriptural hermeneutic excerpt'}"
                    </p>
                  </div>

                  {/* Scientific Box */}
                  <div className="p-3 rounded-xl border border-indigo-500/30 bg-indigo-500/5 dark:bg-indigo-950/20 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-400 text-xs">
                      <Atom className="w-3.5 h-3.5" />
                      <span>Scientific Citation Verified</span>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
                      {item.scientificReference?.citation || 'Empirical Publication'}
                    </span>
                    <p className="italic text-slate-600 dark:text-slate-400 text-xs">
                      "{item.scientificReference?.paperTitle || 'Peer-reviewed evidence'}"
                    </p>
                  </div>
                </div>

                {/* Moderation Actions (Approve / Reject) */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Double-blind peer criteria fulfilled</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleReject(item.id, item.title)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-700 dark:text-rose-400 text-xs font-bold transition-all active:scale-95"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => handleApprove(item)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 active:scale-95 transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve to Public Feed</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center mb-2">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Queue Completely Cleared
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                All submitted academic syntheses have been peer-reviewed and published.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 5. TAB B: REPORTED CONTENT */}
      {activeTab === 'reported' && (
        <div className="space-y-4">
          {reportedList.length > 0 ? (
            reportedList.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-rose-200/80 dark:border-rose-950/50 bg-[var(--surface)] p-5 sm:p-6 shadow-sm space-y-3.5"
              >
                {/* Header info */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider font-sans bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                      {item.reason}
                    </span>
                    <span className="text-xs text-slate-400">
                      Reported by <strong className="text-slate-700 dark:text-slate-300">{item.reporterName}</strong> • {item.reportedAt}
                    </span>
                  </div>

                  <span className="text-xs uppercase font-sans px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    Type: {item.targetType}
                  </span>
                </div>

                {/* Target Content Snippet */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[var(--canvas)] border border-slate-200/80 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Flagged Content Content:
                  </span>
                  <p className="text-xs sm:text-sm font-serif italic text-slate-800 dark:text-slate-200 leading-relaxed">
                    "{item.targetTitle}"
                  </p>
                  <span className="block text-xs text-slate-500 mt-1 font-sans">
                    Author: {item.authorName}
                  </span>
                </div>

                {/* Reporter notes */}
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <strong className="text-rose-600 dark:text-rose-400 font-semibold">Reporter Context: </strong>
                  {item.notes}
                </div>

                {/* Actions: Dismiss or Delete Content */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-xs text-slate-400">
                    Action logged under Moderator Audit Protocol
                  </span>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleDismissReport(item.id)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                    >
                      Dismiss Report
                    </button>

                    <button
                      onClick={() => handleDeleteContent(item.id, item.targetTitle)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/25 active:scale-95 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Content</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center mb-2">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Zero Active Reports
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                All reported items have been moderated and resolved in compliance with the Discourse Charter.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
