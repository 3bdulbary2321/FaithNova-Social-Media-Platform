import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  Atom, 
  Clock, 
  ShieldCheck, 
  ThumbsUp, 
  Lightbulb, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Flag, 
  FileText, 
  Download, 
  Play, 
  Pause, 
  Check, 
  ExternalLink, 
  Quote, 
  Calendar, 
  Eye, 
  Share, 
  ChevronRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';
import { useEffect } from 'react';
import ReportModal from '../components/ReportModal';
import api from '../api/axios';
import { normalizePost } from '../api/normalizer';

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { posts, bookmarkedIds, toggleBookmark, toggleReaction, showToast, user } = useAuth();

  // Find post in memory or fallback
  const initialPost = posts.find((p) => String(p.id) === String(postId)) || posts[0];
  const [post, setPost] = useState(initialPost);
  const [commentsList, setCommentsList] = useState(initialPost?.comments || []);

  // Post Actions State
  const [likes, setLikes] = useState(post?.stats?.likes ?? post?.stats?.likes_count ?? 342);
  const [isLiked, setIsLiked] = useState(post?.user_reaction === 'like');
  const [insightfuls, setInsightfuls] = useState(post?.stats?.insightfuls ?? post?.stats?.insightfuls_count ?? 215);
  const [isInsightful, setIsInsightful] = useState(post?.user_reaction === 'insightful');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch full post and nested comments from API
  useEffect(() => {
    if (!postId) return;
    const fetchFullPost = async () => {
      try {
        const res = await api.get(`/posts/${postId}`);
        if (res.data && res.data.data) {
          const normalized = normalizePost(res.data.data);
          setPost(normalized);
          setLikes(normalized.stats.likes);
          setInsightfuls(normalized.stats.insightfuls);
          setIsLiked(normalized.user_reaction === 'like');
          setIsInsightful(normalized.user_reaction === 'insightful');
          if (normalized.comments && normalized.comments.length > 0) {
            setCommentsList(normalized.comments);
          }
        }
      } catch (err) {
        console.warn('Could not fetch post from API, using cached state.', err);
      }
    };

    fetchFullPost();
  }, [postId]);

  if (!post) {
    return (
      <div className="py-12 text-center space-y-3">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Synthesis Not Found</h2>
        <Link to="/" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          Return to Home Feed
        </Link>
      </div>
    );
  }

  const isBookmarked = bookmarkedIds.includes(post.id);

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

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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
    <div className="space-y-6">
      
      {/* 1. Top Breadcrumbs & Back Navigation */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </button>

        <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px]">
          <Link to="/" className="hover:underline">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span>{post.category}</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
            {post.title}
          </span>
        </div>
      </div>

      {/* 2. Main Full Post Article Card */}
      <article className="rounded-3xl border transition-all duration-200 bg-white border-slate-200/90 dark:bg-slate-900/60 dark:border-slate-800/80 shadow-sm overflow-hidden">
        
        {/* Author Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/30"
              />
              {post.author.isVerified && (
                <ShieldCheck className="w-4 h-4 text-amber-500 fill-amber-500/20 absolute -bottom-1 -right-1" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {post.author.name}
                </h3>
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border font-mono ${getBadgeStyle(post.author.badgeType)}`}>
                  {post.author.roleBadge}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {post.author.institution}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-1">
                <span>{post.timestamp}</span>
                <span>•</span>
                <span>Peer-Reviewed Synthesis</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isFollowing
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
            }`}
          >
            {isFollowing ? 'Following Fellow' : '+ Follow Scholar'}
          </button>
        </div>

        {/* Title & Core Content */}
        <div className="p-5 sm:p-6 space-y-4">
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight font-heading">
            {post.title}
          </h1>

          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Core Thesis Callout Box */}
          {post.thesis && (
            <div className="p-4 rounded-2xl border-l-4 border-amber-500 bg-amber-500/5 dark:bg-amber-950/20 border-r border-t border-b border-amber-500/30">
              <div className="flex items-start gap-2.5">
                <Quote className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                    Central Scholarly Thesis
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic font-serif leading-relaxed">
                    "{post.thesis}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Full Article Content */}
          <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3">
            <p>{post.content}</p>
          </div>

          {/* 3. Two Highlight Boxes in Full Detail */}
          <div className="space-y-4 pt-2">
            
            {/* a) Religious Reference Box */}
            {post.religiousReference && (
              <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/[0.08] via-amber-500/[0.03] to-transparent dark:from-amber-950/30 dark:via-amber-950/10 dark:to-transparent p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 font-mono">
                      Religious Reference & Exegetical Commentary
                    </span>
                  </div>
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400 italic">
                    {post.religiousReference.tradition}
                  </span>
                </div>

                <div className="pl-3 border-l-2 border-amber-500/80 my-2">
                  <p className="text-xs sm:text-sm font-serif italic text-slate-900 dark:text-slate-100 leading-relaxed">
                    "{post.religiousReference.scripture}"
                  </p>
                  <span className="block text-xs font-bold text-amber-800 dark:text-amber-300 mt-1.5">
                    — {post.religiousReference.source}
                  </span>
                </div>

                {post.religiousReference.exegesis && (
                  <div className="pt-2 border-t border-amber-500/20 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <strong className="text-amber-700 dark:text-amber-400 font-semibold block mb-0.5">
                      Scholarly Tafsir Analysis:
                    </strong>
                    {post.religiousReference.exegesis}
                  </div>
                )}
              </div>
            )}

            {/* b) Scientific Explanation Box */}
            {post.scientificReference && (
              <div className="rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-indigo-500/[0.08] via-indigo-500/[0.03] to-transparent dark:from-indigo-950/30 dark:via-indigo-950/10 dark:to-transparent p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                      <Atom className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 font-mono">
                      Scientific Evidence & Empirical Study
                    </span>
                  </div>
                  <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    {post.scientificReference.field}
                  </span>
                </div>

                <div className="pl-3 border-l-2 border-indigo-500/80 my-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <span>{post.scientificReference.citation}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-500 cursor-pointer" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-0.5">
                    "{post.scientificReference.paperTitle}"
                  </p>
                </div>

                <div className="pt-2 border-t border-indigo-500/20 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong className="text-indigo-700 dark:text-indigo-400 font-semibold block mb-0.5">
                    Empirical Methodology & Findings:
                  </strong>
                  {post.scientificReference.explanation}
                </div>
              </div>
            )}

          </div>

          {/* 4. Multimedia Showcase */}
          {post.media && (
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Attached Research Media
              </h4>

              {/* Images */}
              {post.media.type === 'image' && (
                <div className="space-y-2">
                  <div className={`grid gap-3 rounded-2xl overflow-hidden ${
                    post.media.items.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
                  }`}>
                    {post.media.items.map((item, idx) => (
                      <div key={idx} className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-950 group">
                        <img
                          src={item.url}
                          alt={item.alt}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                          <p className="text-xs text-white/90">{item.caption}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Player */}
              {post.media.type === 'video' && post.media.video && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 group aspect-[16/9] shadow-md">
                  <img
                    src={post.media.video.poster}
                    alt={post.media.video.title}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isVideoPlaying ? 'opacity-30' : 'opacity-85'}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-between p-5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-white text-xs font-mono">
                        Colloquium Presentation
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-black/70 text-amber-400 text-xs font-mono font-bold">
                        {post.media.video.duration}
                      </span>
                    </div>

                    <div className="text-center">
                      <button
                        onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                        className="w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center mx-auto shadow-2xl hover:scale-110 active:scale-95 transition-transform"
                      >
                        {isVideoPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
                      </button>
                    </div>

                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-white">
                        {post.media.video.title}
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {post.media.video.speaker} • {post.media.video.views}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PDF Document */}
              {post.media.type === 'pdf' && post.media.document && (
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {post.media.document.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {post.media.document.description}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span>{post.media.document.fileSize}</span>
                        <span>•</span>
                        <span>{post.media.document.pagesCount} Pages</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => alert(`Downloading manuscript ${post.media.document.title}...`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all flex-shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* 5. Post Interactive Action Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            
            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors ${
                isLiked
                  ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likes}</span>
            </button>

            {/* Insightful */}
            <button
              onClick={handleInsightful}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${
                isInsightful
                  ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-500/30 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-500 hover:bg-amber-50/60 dark:hover:bg-amber-950/20'
              }`}
            >
              <Lightbulb className={`w-4 h-4 ${isInsightful ? 'fill-amber-400 text-amber-500' : ''}`} />
              <span>{insightfuls} Insightful</span>
            </button>

            {/* Inquiries */}
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 px-2 py-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>{post.comments ? post.comments.length : 0} Inquiries</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-slate-800 transition-colors relative"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              {copiedLink && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap">
                  Link Copied!
                </span>
              )}
            </button>

            {/* Bookmark */}
            <button
              onClick={() => toggleBookmark(post.id)}
              className={`p-2 rounded-xl transition-colors ${
                isBookmarked
                  ? 'text-amber-500 bg-amber-500/10'
                  : 'text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Report Post */}
            <button
              onClick={() => setIsReportOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>

      </article>

      {/* 6. Respectful Discussion & Nested Comments Section */}
      <CommentSection 
        comments={commentsList} 
        onAddComment={async (newComm) => {
          setCommentsList((prev) => [...prev, newComm]);
          try {
            await api.post(`/posts/${post.id}/comments`, {
              content: newComm.text || newComm.content,
              parent_id: newComm.parentId || null,
            });
          } catch (err) {
            console.warn('Comment stored locally.', err);
          }
        }}
      />

      {/* Report Modal for the Post */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="post"
        targetTitle={post.title}
        onSubmitReport={async (data) => {
          try {
            await api.post('/reports', {
              reportable_type: 'post',
              reportable_id: post.id,
              reason: data?.reason || 'Disrespectful behavior',
              notes: data?.notes || null,
            });
            showToast?.('Report submitted for peer review moderation.');
          } catch (err) {
            console.warn('Report submitted locally.', err);
          }
        }}
      />

    </div>
  );
}
