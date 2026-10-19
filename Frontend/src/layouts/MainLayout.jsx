import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
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
  const { pathname, hash } = useLocation();
  const drawerRef = useRef(null);
  const widePage = /\/(profile|moderation|peer-review)/.test(pathname);
  useEffect(() => { setIsMobileNavOpen(false); if (!hash) window.scrollTo(0, 0); }, [pathname, hash]);
  useEffect(() => {
    if (isMobileNavOpen) drawerRef.current?.showModal();
    else drawerRef.current?.close();
  }, [isMobileNavOpen]);
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <TopNavbar onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)} isMobileNavOpen={isMobileNavOpen} />
      <dialog className="navigation-drawer" ref={drawerRef} onCancel={() => setIsMobileNavOpen(false)} onClick={event => { if (event.target === drawerRef.current) setIsMobileNavOpen(false); }} aria-label="Navigation">
        <div className="drawer-inner"><div className="drawer-heading"><strong>Explore FaithNova</strong><button className="icon-button" aria-label="Close navigation" onClick={() => setIsMobileNavOpen(false)}><X size={20} /></button></div><LeftSidebar onItemClick={() => setIsMobileNavOpen(false)} /></div>
      </dialog>
      <div className={`workspace-grid ${widePage ? 'wide-page' : ''}`}>
        <div className="desktop-sidebar"><LeftSidebar /></div>
        <main id="main-content" tabIndex={-1} className="main-content"><Outlet /></main>
        {!widePage && <RightSidebar />}
      </div>
      <MobileBottomBar />
      <CreatePostModal isOpen={isCreateModalOpen} onClose={closeCreateModal} />
      {toastMessage && <div className="toast" role="status"><CheckCircle2 size={19} /><span>{toastMessage}</span></div>}
    </div>
  );
}
