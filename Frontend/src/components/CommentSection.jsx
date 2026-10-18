import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MessageSquare, 
  ThumbsUp, 
  Reply, 
  Flag, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  CornerDownRight, 
  AlertCircle, 
  BookOpen, 
  Atom, 
  Info,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ReportModal from './ReportModal';

// Recursive / Nested Single Comment Item Component
function CommentItem({ 
  comment, 
  depth = 0, 
  onAddReply, 
  onReport 
}) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(comment.likes || 0);
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(true);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => (isLiked ? prev - 1 : prev + 1));
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    onAddReply(comment.id, {
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      author: {
        name: user.name,
        handle: user.handle,
        roleBadge: 'Verified Scholar',
        badgeType: 'science',
        institution: user.institution,
        avatar: user.avatar,
        isVerified: true,
      },
      timestamp: 'Just now',
      text: replyText.trim(),
      likes: 0,
      isLiked: false,
      replies: [],
    });

    setReplyText('');
    setIsReplying(false);
    setShowReplies(true);
  };

  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className={`group/item ${depth > 0 ? 'mt-3 pl-3 sm:pl-5 border-l-2 border-indigo-200/60 dark:border-indigo-900/50' : 'pt-4'}`}>
      
      {/* Comment Card */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-colors hover:border-slate-300 dark:hover:border-slate-700">
        
        {/* Comment Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={comment.author.avatar}
              alt={comment.author.name}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-1 ring-amber-400/50 flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {comment.author.name}
                </span>
                {comment.author.roleBadge && (
                  <span className="px-1.5 py-0.2 text-[9px] font-semibold rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 font-mono">
                    {comment.author.roleBadge}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {comment.author.institution}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-slate-400 flex-shrink-0">
            <Clock className="w-3 h-3" />
            <span>{comment.timestamp}</span>
          </div>
        </div>

        {/* Comment Body */}
        <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed pl-9 sm:pl-10">
          {comment.text}
        </p>

        {/* Action Bar: Like, Reply, Report */}
        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800/60 pl-9 sm:pl-10 text-xs">
          <div className="flex items-center gap-3">
            
            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-colors ${
                isLiked
                  ? 'text-rose-600 dark:text-rose-400 font-semibold'
                  : 'text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-[11px] font-mono">{likes}</span>
            </button>

            {/* Reply Toggle */}
            <button
              onClick={() => setIsReplying(!isReplying)}
              className={`flex items-center gap-1 transition-colors ${
                isReplying
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400'
              }`}
            >
              <Reply className="w-3.5 h-3.5" />
              <span className="text-[11px]">Reply</span>
            </button>

          </div>

          <div className="flex items-center gap-2">
            {/* Report */}
            <button
              onClick={() => onReport(comment)}
              title="Report comment for charter breach"
              className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors"
            >
              <Flag className="w-3 h-3" />
            </button>

            {/* Collapse/Expand Replies Toggle */}
            {hasReplies && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 hover:underline ml-1"
              >
                <span>{comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
                {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>

        {/* Inline Reply Input Form */}
        {isReplying && (
          <form onSubmit={handleReplySubmit} className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-amber-400 flex-shrink-0 mt-0.5"
              />
              <div className="flex-1 min-w-0 space-y-2">
                <textarea
                  rows={2}
                  autoFocus
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Replying to ${comment.author.name.split(' ')[0]} with respectful peer reasoning...`}
                  className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 resize-none"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsReplying(false);
                      setReplyText('');
                    }}
                    className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <Send className="w-3 h-3" />
                    <span>Post Reply</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

      </div>

      {/* Recursive Nested Replies Rendering (Level 1 & Level 2) */}
      {hasReplies && showReplies && (
        <div className="space-y-1">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onAddReply={onAddReply}
              onReport={onReport}
            />
          ))}
        </div>
      )}

    </div>
  );
}

export default function CommentSection({ comments = [], onAddComment }) {
  const { user } = useAuth();
  const [commentList, setCommentList] = useState(comments);
  const [newComment, setNewComment] = useState('');
  const [reportTarget, setReportTarget] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Add top-level comment
  const handleTopLevelSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const created = {
      id: `comm-${Date.now()}`,
      author: {
        name: user.name,
        handle: user.handle,
        roleBadge: 'Verified Scholar',
        badgeType: 'science',
        institution: user.institution,
        avatar: user.avatar,
        isVerified: true,
      },
      timestamp: 'Just now',
      text: newComment.trim(),
      likes: 0,
      isLiked: false,
      replies: [],
    };

    setCommentList([created, ...commentList]);
    setNewComment('');
    if (onAddComment) onAddComment(created);
  };

  // Add nested reply to any comment at any depth
  const handleAddReply = (targetCommentId, newReply) => {
    const insertReplyRecursively = (items) => {
      return items.map((item) => {
        if (item.id === targetCommentId) {
          return {
            ...item,
            replies: [...(item.replies || []), newReply],
          };
        }
        if (item.replies && item.replies.length > 0) {
          return {
            ...item,
            replies: insertReplyRecursively(item.replies),
          };
        }
        return item;
      });
    };

    setCommentList(prev => insertReplyRecursively(prev));
  };

  // Trigger Report Modal for a comment
  const handleOpenReport = (comment) => {
    setReportTarget(comment);
    setIsReportOpen(true);
  };

  return (
    <div className="space-y-5">
      
      {/* 1. Respectful Discussion Reminder Banner (Mandatory Requirement) */}
      <div className="p-3.5 sm:p-4 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-50 to-indigo-500/10 dark:from-amber-950/25 dark:via-slate-900/50 dark:to-indigo-950/25 dark:border-amber-500/30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-mono">
                Academic Discourse Charter
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
              "Remember to keep discussions respectful and backed by knowledge."
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
              Support scientific assertions with peer-reviewed literature, approach scriptural exegesis with context, and avoid ad hominem.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Top-Level Comment Submission Form */}
      <div className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Peer Review & Inquiries ({commentList.length})
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Markdown & DOI Supported
          </span>
        </div>

        <form onSubmit={handleTopLevelSubmit} className="space-y-3">
          <div className="flex items-start gap-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-400 flex-shrink-0"
            />
            <textarea
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Contribute a scholarly peer inquiry, exegesis critique, or empirical verification..."
              className="w-full p-3 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 resize-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="hover:text-indigo-500 cursor-pointer">+ Cite Verse</span>
              <span>•</span>
              <span className="hover:text-indigo-500 cursor-pointer">+ Add DOI Link</span>
            </div>

            <button
              type="submit"
              disabled={!newComment.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-indigo-600/25 active:scale-95 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Inquiry</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Nested Comments List */}
      <div className="space-y-3">
        {commentList.length > 0 ? (
          commentList.map((comm) => (
            <CommentItem
              key={comm.id}
              comment={comm}
              depth={0}
              onAddReply={handleAddReply}
              onReport={handleOpenReport}
            />
          ))
        ) : (
          <div className="text-center py-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            No scholarly inquiries yet. Be the first fellow to contribute to this synthesis!
          </div>
        )}
      </div>

      {/* 4. Report Modal for Comments */}
      {reportTarget && (
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => {
            setIsReportOpen(false);
            setReportTarget(null);
          }}
          targetType="comment"
          targetTitle={reportTarget.text}
          onSubmitReport={(data) => {
            console.log('Reported comment:', data);
          }}
        />
      )}

    </div>
  );
}
