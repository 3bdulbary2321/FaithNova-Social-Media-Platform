import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import MobileBottomBar from '../components/MobileBottomBar';
import { X } from 'lucide-react';

export default function MainLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col cosmic-bg transition-colors duration-200">
      
      {/* 1. Top Navbar */}
      <TopNavbar 
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)} 
        isMobileNavOpen={isMobileNavOpen} 
      />

      {/* Mobile Slide-Over Drawer for full navigation */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setIsMobileNavOpen(false)}
          />
          {/* Drawer content */}
          <div className="relative w-4/5 max-w-xs h-full bg-white dark:bg-[#070b14] p-4 overflow-y-auto shadow-2xl border-r border-slate-200 dark:border-slate-800 z-10 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-2">
              <span className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                FaithNova Navigation
              </span>
              <button 
                onClick={() => setIsMobileNavOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <LeftSidebar onItemClick={() => setIsMobileNavOpen(false)} />
          </div>
        </div>
      )}

      {/* 2. Main 3-Column Responsive Grid Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-5 xl:gap-8 min-h-[calc(100vh-4rem)]">
          
          {/* Column 1: Left Navigation Sidebar (Hidden on mobile, col-span-4 on tablet, col-span-3 on desktop) */}
          <div className="hidden md:block md:col-span-4 lg:col-span-3">
            <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden pr-2">
              <LeftSidebar />
            </div>
          </div>

          {/* Column 2: Center Content Area with Dynamic <Outlet /> (col-span-12 on mobile, col-span-8 on tablet, col-span-6 on desktop) */}
          <main className="col-span-12 md:col-span-8 lg:col-span-6 py-4 pb-20 md:pb-8 min-w-0">
            <Outlet />
          </main>

          {/* Column 3: Right Sidebar (Hidden on mobile & tablet, visible on lg+ screens: col-span-3) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden pl-1">
              <RightSidebar />
            </div>
          </div>

        </div>
      </div>

      {/* 3. Mobile Bottom Bar for quick navigation on mobile */}
      <MobileBottomBar />

    </div>
  );
}
