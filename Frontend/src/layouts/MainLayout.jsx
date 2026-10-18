import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import MobileBottomBar from '../components/MobileBottomBar';
import CreatePostModal from '../components/CreatePostModal';
import { X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { isCreateModalOpen, closeCreateModal, toastMessage } = useAuth();

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
          
          {/* Column 1: Left Navigation Sidebar */}
          <div className="hidden md:block md:col-span-4 lg:col-span-3">
            <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden pr-2">
              <LeftSidebar />
            </div>
          </div>

          {/* Column 2: Center Content Area with Dynamic <Outlet /> */}
          <main className="col-span-12 md:col-span-8 lg:col-span-6 py-4 pb-20 md:pb-8 min-w-0">
            <Outlet />
          </main>

          {/* Column 3: Right Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden pl-1">
              <RightSidebar />
            </div>
          </div>

        </div>
      </div>

      {/* 3. Mobile Bottom Bar for quick navigation on mobile */}
      <MobileBottomBar />

      {/* 4. Global Create Post Modal (Phase 3) */}
      <CreatePostModal 
        isOpen={isCreateModalOpen} 
        onClose={closeCreateModal} 
      />

      {/* 5. Publication Success Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-5 duration-300">
          <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
