import React from 'react';
import { Heart, Sparkles, Code2, Database } from 'lucide-react';

export default function Footer() {
  const techPills = [
    { name: 'React 19', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
    { name: 'Vite', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { name: 'Tailwind CSS', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
    { name: 'Lucide Icons', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { name: 'React Router v7', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
    { name: 'Laravel 12/13 API', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
    { name: 'MySQL Database', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  ];

  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/70 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-heading font-semibold text-slate-200 text-sm">
                FaithNova Social Media Platform
              </p>
              <p className="text-xs text-slate-500">
                Full-Stack Architecture • React Vite Frontend & Laravel MySQL Backend
              </p>
            </div>
          </div>

          {/* Tech Badges */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-xl">
            {techPills.map((tech) => (
              <span
                key={tech.name}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${tech.color}`}
              >
                {tech.name}
              </span>
            ))}
          </div>

        </div>
      </div>
    </footer>
  );
}
