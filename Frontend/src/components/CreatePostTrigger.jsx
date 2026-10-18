import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Atom, 
  Paperclip, 
  Image as ImageIcon, 
  FileText, 
  X, 
  Send, 
  ShieldCheck,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from './CategoryPills';

export default function CreatePostTrigger({ onPostCreated }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Astronomy');
  const [includeReligious, setIncludeReligious] = useState(true);
  const [religiousSource, setReligiousSource] = useState('The Holy Qur\'an — Surah Al-Anbiya (21:30)');
  const [religiousText, setReligiousText] = useState('Do not the disbelievers see that the heavens and the earth were a closed-up mass...');
  const [includeScientific, setIncludeScientific] = useState(true);
  const [scientificCitation, setScientificCitation] = useState('Nature Physics (2025) — DOI: 10.1038/s41567-025-0012');
  const [scientificExplanation, setScientificExplanation] = useState('Cosmological metric expansion verified across CMB anisotropy frequencies.');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newPost = {
      id: `post-${Date.now()}`,
      category,
      author: {
        name: user.name,
        handle: user.handle,
        roleBadge: user.role === 'Verified Scholar' ? 'Astrophysicist' : 'Fellow',
        badgeType: 'science',
        institution: user.institution,
        avatar: user.avatar,
        isVerified: true,
      },
      timestamp: 'Just now',
      title: title.trim(),
      content: content.trim(),
      tags: [category, 'AcademicSynthesis', 'PeerReviewed'],
      religiousReference: includeReligious ? {
        source: religiousSource,
        scripture: religiousText,
        exegesis: 'Author commentary provided in synthesis submission.',
        tradition: 'Classical Exegesis',
      } : null,
      scientificReference: includeScientific ? {
        field: `${category} & Empirical Methodology`,
        citation: scientificCitation,
        paperTitle: 'Empirical Verification and Analysis',
        explanation: scientificExplanation,
      } : null,
      media: null,
      stats: {
        likes: 1,
        insightfuls: 1,
        commentsCount: 0,
        shares: 0,
      },
      comments: [],
    };

    onPostCreated(newPost);
    setTitle('');
    setContent('');
    setIsOpen(false);
  };

  return (
    <>
      {/* 1. Quick Collapsed Trigger Box */}
      <div className="rounded-2xl p-4 border transition-all bg-white border-slate-200/90 hover:border-indigo-400/50 dark:bg-slate-900/60 dark:border-slate-800/80 dark:hover:border-indigo-500/40 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400/50 flex-shrink-0"
          />
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex-1 text-left py-2.5 px-4 rounded-xl text-xs sm:text-sm bg-slate-100 hover:bg-slate-200/80 text-slate-500 dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
          >
            Start a synthesis connecting scripture & scientific inquiry, {user.name.split(' ')[1]}...
          </button>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setIncludeReligious(true);
                setIsOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors text-[11px] font-medium"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>Cite Scripture</span>
            </button>
            <button
              onClick={() => {
                setIncludeScientific(true);
                setIsOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/20 transition-colors text-[11px] font-medium"
            >
              <Atom className="w-3.5 h-3.5 text-indigo-500" />
              <span>Attach Science DOI</span>
            </button>
            <button
              onClick={() => setIsOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-[11px] font-medium"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>Add PDF / Image</span>
            </button>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-sm hover:scale-105 active:scale-95 transition-all"
          >
            Compose
          </button>
        </div>
      </div>

      {/* 2. Full Academic Synthesis Composer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#0b101e] border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-gradient-to-tr from-amber-500 to-indigo-600 text-white shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading">
                    Publish Academic Synthesis
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Dual-referenced scholarship for the FaithNova research community
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Category Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Discipline:</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="py-1 px-3 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
                >
                  {CATEGORIES.filter(c => c.id !== 'All').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Title input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Synthesis Title / Core Hypothesis
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Non-Equilibrium Thermodynamics and the Order of Living Systems..."
                  className="w-full py-2 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Content textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Scholarly Analysis & Argumentation
                </label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Detail the theoretical bridge, mathematical grounding, or historical alignment..."
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:border-indigo-500 text-slate-900 dark:text-white resize-none"
                />
              </div>

              {/* Highlight Box 1: Religious Reference Config */}
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                      Religious Reference Box
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeReligious}
                    onChange={(e) => setIncludeReligious(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                </div>

                {includeReligious && (
                  <div className="space-y-2 pt-1 text-xs">
                    <input
                      type="text"
                      value={religiousSource}
                      onChange={(e) => setReligiousSource(e.target.value)}
                      placeholder="Scripture Source (e.g. Surah Al-Mulk 67:3)"
                      className="w-full py-1.5 px-2.5 rounded-lg border border-amber-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                    />
                    <textarea
                      rows={2}
                      value={religiousText}
                      onChange={(e) => setReligiousText(e.target.value)}
                      placeholder="Scripture text / classical quotation..."
                      className="w-full py-1.5 px-2.5 rounded-lg border border-amber-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none resize-none font-serif italic"
                    />
                  </div>
                )}
              </div>

              {/* Highlight Box 2: Scientific Reference Config */}
              <div className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/5 dark:bg-indigo-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Atom className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
                      Scientific Explanation Box
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeScientific}
                    onChange={(e) => setIncludeScientific(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                {includeScientific && (
                  <div className="space-y-2 pt-1 text-xs">
                    <input
                      type="text"
                      value={scientificCitation}
                      onChange={(e) => setScientificCitation(e.target.value)}
                      placeholder="Peer-Reviewed Journal & DOI citation"
                      className="w-full py-1.5 px-2.5 rounded-lg border border-indigo-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                    />
                    <textarea
                      rows={2}
                      value={scientificExplanation}
                      onChange={(e) => setScientificExplanation(e.target.value)}
                      placeholder="Empirical finding summary..."
                      className="w-full py-1.5 px-2.5 rounded-lg border border-indigo-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Peer Review Moderation Charter Applied
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-3.5 py-2 text-xs rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold shadow-md shadow-indigo-600/30 active:scale-95 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish to Feed</span>
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}
