import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Atom, 
  Microscope, 
  Scroll, 
  ThumbsUp, 
  Lightbulb, 
  MessageSquare, 
  Share2, 
  Flag, 
  Bookmark, 
  Clock, 
  ShieldCheck, 
  FileText, 
  Download, 
  Play, 
  Pause, 
  Check, 
  MoreHorizontal, 
  ExternalLink,
  Quote,
  Send,
  AlertCircle,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ReportModal from './ReportModal';
import api from '../api/axios';

export default function PostCard({ post }) {
  const { user, bookmarkedIds, toggleBookmark, toggleReaction, showToast } = useAuth();

  // Local state for interactive reactions
  const [likes, setLikes] = useState(post.stats?.likes ?? post.stats?.likes_count ?? 0);
  const [isLiked, setIsLiked] = useState(post.user_reaction === 'like');

  const [insightfuls, setInsightfuls] = useState(post.stats?.insightfuls ?? post.stats?.insightfuls_count ?? 0);
  const [isInsightful, setIsInsightful] = useState(post.user_reaction === 'insightful');

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newCommentText, setNewCommentText] = useState('');

  const [isReported, setIsReported] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('citation');

  const [copiedLink, setCopiedLink] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isBookmarked = bookmarkedIds.includes(post.id);

  // Toggle Like reaction
  const handleLike = async () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikes((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    if (isInsightful && nextState) {
      setIsInsightful(false);
      setInsightfuls((prev) => Math.max(0, prev - 1));
    }

    if (toggleReaction) {
      await toggleReaction(post.id, 'like');
    }
  };

  // Toggle "Insightful" reaction
  const handleInsightful = async () => {
    const nextState = !isInsightful;
    setIsInsightful(nextState);
    setInsightfuls((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    if (isLiked && nextState) {
      setIsLiked(false);
      setLikes((prev) => Math.max(0, prev - 1));
    }

    if (toggleReaction) {
      await toggleReaction(post.id, 'insightful');
    }
  };

  // Add Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const commentText = newCommentText.trim();
    const tempId = `comm-${Date.now()}`;

    const newComment = {
      id: tempId,
      author: {
        name: user?.name || 'Scholar Fellow',
        avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
        roleBadge: user?.role === 'admin' ? 'Curator' : 'Fellow',
        badgeType: 'science',
      },
      timestamp: 'Just now',
      text: commentText,
      likes: 0,
      replies: [],
    };

    setComments((prev) => [...prev, newComment]);
    setNewCommentText('');

    try {
      await api.post(`/posts/${post.id}/comments`, { content: commentText });
    } catch (err) {
      console.warn('Comment posted to local session.', err);
    }
  };

  // Copy Post Link
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Handle Report confirmation
  const handleConfirmReport = async (reportData) => {
    setIsReported(true);
    setShowReportModal(false);

    try {
      await api.post('/reports', {
        reportable_type: 'post',
        reportable_id: post.id,
        reason: reportData?.reason || 'Disrespectful behavior',
        notes: reportData?.notes || null,
      });
      showToast?.('Report submitted for peer review moderation.');
    } catch (err) {
      console.warn('Report recorded in session.', err);
    }
  };

  // Role Badge Styling
  const getBadgeStyle = (badgeType) => {
    switch (badgeType) {
      case 'science':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60';
      case 'theology':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60';
      case 'bio':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <article className="rounded-2xl border transition-all duration-200 bg-white border-slate-200/90 hover:border-slate-300/90 dark:bg-slate-900/60 dark:border-slate-800/80 dark:hover:border-slate-700/80 shadow-sm overflow-hidden">
      
      {/* 1. Post Header: Author info & Options */}
      <div className="p-4 sm:p-5 pb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/20"
            />
            {post.author.isVerified && (
              <ShieldCheck className="w-4 h-4 text-amber-500 fill-amber-500/20 absolute -bottom-1 -right-1" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {post.author.name}
              </h3>
              {/* Role Badge (e.g. Astrophysicist, Theologian) */}
              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border font-mono tracking-tight ${getBadgeStyle(post.author.badgeType)}`}>
                {post.author.roleBadge}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {post.author.institution}
            </p>
          </div>
        </div>

        {/* Timestamp and More Options */}
        <div className="flex items-center gap-2 flex-shrink-0 text-slate-400">
          <div className="flex items-center gap-1 text-[11px]">
            <Clock className="w-3 h-3" />
            <span>{post.timestamp}</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Post options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-44 rounded-xl border shadow-xl py-1 z-30 bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-xs">
                <button
                  onClick={() => {
                    handleShare();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => {
                    toggleBookmark(post.id);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  {isBookmarked ? 'Remove Bookmark' : 'Bookmark Synthesis'}
                </button>
                <button
                  onClick={() => {
                    setShowReportModal(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                >
                  Report to Board
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Post Title & Main Content */}
      <div className="px-4 sm:px-5">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug font-heading">
          <Link 
            to={`/post/${post.id}`}
            className="hover:text-indigo-600 dark:hover:text-amber-400 transition-colors"
          >
            {post.title}
          </Link>
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {post.content}
        </p>

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* 3. Two Distinct Highlight Boxes: Religious Reference & Scientific Explanation */}
      <div className="p-4 sm:p-5 pt-3.5 space-y-3">
        
        {/* a) Religious Reference Box (Warm amber/gold border with book/scroll icon) */}
        {post.religiousReference && (
          <div className="rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/[0.07] via-amber-500/[0.03] to-transparent dark:from-amber-950/25 dark:via-amber-950/10 dark:to-transparent p-3.5 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-amber-500/20 text-amber-500">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-mono">
                  Religious Reference & Exegesis
                </span>
              </div>
              <span className="text-[10px] font-medium text-amber-600/80 dark:text-amber-400/80 italic">
                {post.religiousReference.tradition}
              </span>
            </div>

            <div className="pl-2 border-l-2 border-amber-500/70 my-2">
              <p className="text-xs sm:text-[13px] font-serif italic text-slate-800 dark:text-slate-200 leading-relaxed">
                "{post.religiousReference.scripture}"
              </p>
              <span className="block text-[11px] font-semibold text-amber-800 dark:text-amber-300 mt-1">
                — {post.religiousReference.source}
              </span>
            </div>

            {post.religiousReference.exegesis && (
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed pt-1.5 border-t border-amber-500/20">
                <strong className="text-amber-700 dark:text-amber-400 font-semibold">Tafsir Context: </strong>
                {post.religiousReference.exegesis}
              </p>
            )}
          </div>
        )}

        {/* b) Scientific Explanation/Reference Box (Indigo/blue border with atom/microscope icon) */}
        {post.scientificReference && (
          <div className="rounded-xl border border-indigo-500/40 bg-gradient-to-br from-indigo-500/[0.07] via-indigo-500/[0.03] to-transparent dark:from-indigo-950/25 dark:via-indigo-950/10 dark:to-transparent p-3.5 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-500 dark:text-indigo-400">
                  <Atom className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 font-mono">
                  Scientific Explanation & Reference
                </span>
              </div>
              <span className="text-[10px] font-medium text-indigo-600/80 dark:text-indigo-400/80">
                {post.scientificReference.field}
              </span>
            </div>

            <div className="pl-2 border-l-2 border-indigo-500/70 my-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                <span>{post.scientificReference.citation}</span>
                <ExternalLink className="w-3 h-3 text-indigo-500 cursor-pointer" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                "{post.scientificReference.paperTitle}"
              </p>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed pt-1.5 border-t border-indigo-500/20">
              <strong className="text-indigo-700 dark:text-indigo-400 font-semibold">Empirical Finding: </strong>
              {post.scientificReference.explanation}
            </p>
          </div>
        )}

      </div>

      {/* 4. Multimedia Grid: Images, Video Player, or PDF Document Preview */}
      {post.media && (
        <div className="px-4 sm:px-5 pb-3">
          
          {/* A) Image Grid */}
          {post.media.type === 'image' && (
            <div className="space-y-2">
              <div className={`grid gap-2 rounded-xl overflow-hidden ${
                post.media.items.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
              }`}>
                {post.media.items.map((item, idx) => (
                  <div key={idx} className="relative group overflow-hidden bg-slate-950 aspect-[16/9] rounded-lg">
                    <img
                      src={item.url}
                      alt={item.alt || 'Attached research image'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                      <p className="text-[10px] text-white/90 line-clamp-1">{item.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
              {post.media.items[0]?.caption && (
                <p className="text-[10px] text-slate-400 dark:text-slate-400 italic text-center">
                  Figure: {post.media.items[0].caption}
                </p>
              )}
            </div>
          )}

          {/* B) Video Player Preview */}
          {post.media.type === 'video' && post.media.video && (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 group aspect-[16/9] shadow-md">
              <img
                src={post.media.video.poster}
                alt={post.media.video.title}
                className={`w-full h-full object-cover transition-opacity duration-300 ${isVideoPlaying ? 'opacity-30' : 'opacity-80'}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-between p-4">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono border border-white/10">
                    Academic Colloquium
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/60 text-amber-400 text-[10px] font-mono font-bold">
                    {post.media.video.duration}
                  </span>
                </div>

                <div className="text-center">
                  <button
                    onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                    aria-label={isVideoPlaying ? 'Pause presentation' : 'Play presentation'}
                    className="w-14 h-14 rounded-full bg-indigo-600/90 hover:bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl hover:scale-110 active:scale-95 transition-transform"
                  >
                    {isVideoPlaying ? (
                      <Pause className="w-6 h-6 fill-current" />
                    ) : (
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    )}
                  </button>
                  {isVideoPlaying && (
                    <span className="text-[11px] text-amber-300 mt-2 block animate-pulse">
                      Playing lecture preview stream...
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                    {post.media.video.title}
                  </h4>
                  <p className="text-[10px] text-slate-300 line-clamp-1 mt-0.5">
                    {post.media.video.speaker} • {post.media.video.views}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* C) PDF Document Preview */}
          {post.media.type === 'pdf' && post.media.document && (
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between gap-3 shadow-sm hover:border-indigo-400/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {post.media.document.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {post.media.document.description}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>PDF Manuscript</span>
                    <span>•</span>
                    <span>{post.media.document.fileSize}</span>
                    <span>•</span>
                    <span>{post.media.document.pagesCount} Pages</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => alert(`Downloading ${post.media.document.title}...`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm flex-shrink-0 transition-transform active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View PDF</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* 5. Action Bar at the bottom */}
      <div className="px-4 sm:px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between text-xs">
        
        {/* Left Actions: Like, Insightful, Comments */}
        <div className="flex items-center gap-1 sm:gap-4 flex-wrap">
          
          {/* Reaction 1: Like / Endorse */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
              isLiked
                ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likes}</span>
          </button>

          {/* Reaction 2: "Insightful" (Unique to FaithNova) */}
          <button
            onClick={handleInsightful}
            title="Mark as Academically Insightful"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
              isInsightful
                ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-500/30 font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-500 hover:bg-amber-50/60 dark:hover:bg-amber-950/20'
            }`}
          >
            <Lightbulb className={`w-4 h-4 ${isInsightful ? 'fill-amber-400 text-amber-500 animate-pulse' : ''}`} />
            <span className="hidden xs:inline">Insightful</span>
            <span>{insightfuls}</span>
          </button>

          {/* Comments Toggle */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
              showComments
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{comments.length}</span>
            {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

        </div>

        {/* Right Actions: Share, Bookmark, Report */}
        <div className="flex items-center gap-1">
          
          {/* Share with feedback toast */}
          <button
            onClick={handleShare}
            aria-label="Share post"
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-slate-800 transition-colors relative"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            {copiedLink && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow">
                Copied!
              </span>
            )}
          </button>

          {/* Bookmark */}
          <button
            onClick={() => toggleBookmark(post.id)}
            aria-label="Bookmark synthesis"
            className={`p-1.5 rounded-lg transition-colors ${
              isBookmarked
                ? 'text-amber-500 bg-amber-500/10'
                : 'text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Report Button for Moderation */}
          <button
            onClick={() => setShowReportModal(true)}
            aria-label="Report post for moderation"
            title="Report to Academic Ethics Committee"
            className={`p-1.5 rounded-lg transition-colors ${
              isReported
                ? 'text-rose-500 bg-rose-500/10'
                : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20'
            }`}
          >
            <Flag className={`w-4 h-4 ${isReported ? 'fill-rose-500' : ''}`} />
          </button>

        </div>
      </div>

      {/* Reported Status Banner */}
      {isReported && (
        <div className="px-4 py-2 bg-rose-50 dark:bg-rose-950/30 border-t border-rose-200 dark:border-rose-900 text-[11px] text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Report submitted to the Academic Moderation Board for review.</span>
        </div>
      )}

      {/* 6. Expandable Comments Section */}
      {showComments && (
        <div className="px-4 sm:px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span>Academic Peer Inquiries ({comments.length})</span>
            <span className="text-[10px] text-amber-500 font-mono">Discourse Charter Enforced</span>
          </div>

          {/* Comments List */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {comments.map((comment) => (
              <div key={comment.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
                    />
                    <span className="font-bold text-slate-900 dark:text-white">{comment.author}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {comment.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{comment.time}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed pl-7">
                  {comment.text}
                </p>
              </div>
            ))}
          </div>

          {/* New Comment Input */}
          <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-amber-400 flex-shrink-0"
            />
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Contribute scholarly peer feedback with citations..."
              className="flex-1 py-1.5 px-3 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!newCommentText.trim()}
              className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-opacity"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Moderation Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="post"
        targetTitle={post.title}
        onSubmitReport={() => setIsReported(true)}
      />

    </article>
  );
}
