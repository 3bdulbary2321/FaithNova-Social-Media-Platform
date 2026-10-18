import React, { useRef } from 'react';
import { 
  Sparkles, 
  Compass, 
  HeartPulse, 
  Atom, 
  Dna, 
  Scroll, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

export const CATEGORIES = [
  { id: 'All', name: 'All Syntheses', icon: Sparkles, count: 18 },
  { id: 'Astronomy', name: 'Astronomy', icon: Compass, count: 5 },
  { id: 'Medicine', name: 'Medicine', icon: HeartPulse, count: 4 },
  { id: 'Physics', name: 'Physics', icon: Atom, count: 3 },
  { id: 'Biology', name: 'Biology', icon: Dna, count: 4 },
  { id: 'History', name: 'History of Science', icon: Scroll, count: 2 },
];

export default function CategoryPills({ selectedCategory, onSelectCategory }) {
  const scrollContainerRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full group py-1 select-none">
      {/* Scroll Left Button */}
      <button
        type="button"
        onClick={() => handleScroll('left')}
        aria-label="Scroll categories left"
        className="hidden md:flex absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full items-center justify-center bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105 active:scale-95"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Scrollable Pills Container */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2 overflow-x-auto scroll-smooth py-1 px-0.5 no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-500/30 dark:ring-amber-400/40'
                  : 'bg-white/80 hover:bg-slate-100 text-slate-700 border border-slate-200/90 dark:bg-slate-900/70 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300 animate-pulse' : 'text-indigo-500 dark:text-indigo-400'}`} />
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      <button
        type="button"
        onClick={() => handleScroll('right')}
        aria-label="Scroll categories right"
        className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full items-center justify-center bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105 active:scale-95"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
