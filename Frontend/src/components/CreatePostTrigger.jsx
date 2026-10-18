import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Atom, 
  Paperclip, 
  PlusCircle, 
  Send,
  UploadCloud,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CreatePostTrigger() {
  const { user, openCreateModal } = useAuth();

  return (
    <div className="rounded-2xl p-4 border transition-all bg-white border-slate-200/90 hover:border-indigo-400/50 dark:bg-slate-900/60 dark:border-slate-800/80 dark:hover:border-indigo-500/40 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400/50"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="flex-1 text-left py-2.5 px-4 rounded-xl text-xs sm:text-sm bg-slate-100 hover:bg-slate-200/80 text-slate-500 dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors cursor-pointer"
        >
          Synthesize scriptural insights & empirical research, {user.name.split(' ')[1]}...
        </button>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors text-[11px] font-medium cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>Cite Scripture</span>
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/20 transition-colors text-[11px] font-medium cursor-pointer"
          >
            <Atom className="w-3.5 h-3.5 text-indigo-500" />
            <span>Attach Science DOI</span>
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-[11px] font-medium cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
            <span>Upload Media / PDF</span>
          </button>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Compose</span>
        </button>
      </div>
    </div>
  );
}
