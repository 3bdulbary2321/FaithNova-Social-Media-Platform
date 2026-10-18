import React, { useState } from 'react';
import { 
  X, 
  Flag, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  Send 
} from 'lucide-react';

const REPORT_REASONS = [
  {
    id: 'disrespect',
    label: 'Disrespectful behavior / Ad Hominem',
    description: 'Hostile discourse, personal attacks on faith or scientific integrity, or violation of civil dialogue.',
  },
  {
    id: 'misinformation',
    label: 'Misinformation / Fabricated Citations',
    description: 'Falsified journal DOIs, fabricated empirical data, or deliberately distorted scriptural exegesis.',
  },
  {
    id: 'offtopic',
    label: 'Off-topic / Non-academic content',
    description: 'Polemics, political debates, or content unrelated to the synthesis of religious and scientific knowledge.',
  },
  {
    id: 'spam',
    label: 'Spam or Solicitation',
    description: 'Duplicate posting, automated bots, commercial promotion, or irrelevant external links.',
  },
];

export default function ReportModal({ 
  isOpen, 
  onClose, 
  targetType = 'post', 
  targetTitle = '', 
  onSubmitReport 
}) {
  const [selectedReason, setSelectedReason] = useState('disrespect');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      if (onSubmitReport) {
        onSubmitReport({
          reason: selectedReason,
          notes: notes.trim(),
          targetType,
        });
      }
      setTimeout(() => {
        setIsSubmitted(false);
        setNotes('');
        onClose();
      }, 1500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Modal Dialog Card */}
      <div 
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#090e1b] border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading">
                Report {targetType === 'comment' ? 'Scholarly Comment' : 'Academic Synthesis'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                FaithNova Discourse Charter & Peer Review Moderation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {isSubmitted ? (
          <div className="py-8 text-center space-y-2 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Report Submitted to Moderation Board
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Thank you for upholding academic integrity and civil dialogue on FaithNova.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Target Snippet Preview */}
            {targetTitle && (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Item Under Review:
                </span>
                <p className="text-slate-700 dark:text-slate-300 font-medium italic line-clamp-2">
                  "{targetTitle}"
                </p>
              </div>
            )}

            {/* Radio Reasons List */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Select Charter Violation Reason <span className="text-rose-500">*</span>
              </label>

              {REPORT_REASONS.map((reason) => {
                const isSelected = selectedReason === reason.id;
                return (
                  <label
                    key={reason.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-rose-500/60 bg-rose-50/50 dark:bg-rose-950/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason.id}
                      checked={isSelected}
                      onChange={() => setSelectedReason(reason.id)}
                      className="mt-0.5 text-rose-600 focus:ring-rose-500"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {reason.label}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                        {reason.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Optional Notes Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Additional Details & Context (Optional)
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {notes.length}/300
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={300}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Include specific timestamps, DOI discrepancies, or relevant context for the ethics committee..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500 resize-none placeholder:text-slate-400"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/25 active:scale-95 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Transmitting...</span>
                  </>
                ) : (
                  <>
                    <Flag className="w-3.5 h-3.5" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>

    </div>
  );
}
