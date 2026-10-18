import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  MapPin, 
  Calendar, 
  Globe, 
  Mail, 
  Edit3, 
  Share2, 
  Bookmark, 
  Award, 
  FileText, 
  Video, 
  Image as ImageIcon, 
  Lightbulb, 
  MessageSquare, 
  Check, 
  X, 
  Camera, 
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';

export default function UserProfile() {
  const { user, setUser, posts, showToast } = useAuth();
  
  const [activeTab, setActiveTab] = useState('published'); // 'published', 'media', 'insightful'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit Profile Form State
  const [editName, setEditName] = useState(user.name);
  const [editTitle, setEditTitle] = useState(user.title);
  const [editInstitution, setEditInstitution] = useState(user.institution);
  const [editDepartment, setEditDepartment] = useState(user.department || '');
  const [editBio, setEditBio] = useState(user.bio || '');
  const [editLocation, setEditLocation] = useState(user.location || 'Oxford, UK');
  const [editWebsite, setEditWebsite] = useState(user.website || 'https://oxford.academia.edu');
  const [editAvatar, setEditAvatar] = useState(user.avatar);
  const [editCover, setEditCover] = useState(user.coverBanner || '');

  // Filter posts published by this author or match author name
  const userPublishedPosts = posts.filter(
    (p) => p.author.name === user.name || p.author.handle === user.handle
  );
  // If user hasn't published custom posts yet, display first 2 as showcase
  const displayedPosts = userPublishedPosts.length > 0 ? userPublishedPosts : posts.slice(0, 2);

  // Collect all media from posts for the "Media" tab
  const mediaItems = posts.flatMap(p => {
    if (!p.media) return [];
    if (p.media.type === 'image') {
      return p.media.items.map(img => ({ ...img, type: 'image', postTitle: p.title, postId: p.id }));
    }
    if (p.media.type === 'video') {
      return [{ ...p.media.video, type: 'video', postTitle: p.title, postId: p.id }];
    }
    if (p.media.type === 'pdf') {
      return [{ ...p.media.document, type: 'pdf', postTitle: p.title, postId: p.id }];
    }
    return [];
  });

  const handleShareProfile = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUser(prev => ({
      ...prev,
      name: editName,
      title: editTitle,
      institution: editInstitution,
      department: editDepartment,
      bio: editBio,
      location: editLocation,
      website: editWebsite,
      avatar: editAvatar,
      coverBanner: editCover,
    }));
    setIsEditModalOpen(false);
    showToast('Academic profile updated successfully!');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Profile Hero Banner & Header Card */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 overflow-hidden shadow-sm">
        
        {/* Cover Banner */}
        <div className="relative h-44 sm:h-56 w-full bg-slate-950 overflow-hidden">
          <img
            src={user.coverBanner || 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1400&auto=format&fit=crop&q=80'}
            alt="Profile Cover"
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
          
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-transform active:scale-95"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit Banner</span>
          </button>
        </div>

        {/* Profile Info Row */}
        <div className="px-5 sm:px-8 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-14 sm:-mt-16 gap-4 mb-4">
            
            {/* Avatar with status ring */}
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl bg-slate-800"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleShareProfile}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                {copiedLink && (
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap">
                    Link Copied!
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 active:scale-95 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Academic Profile</span>
              </button>
            </div>
          </div>

          {/* Scholar Names & Titles */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white">
                  {user.name}
                </h1>
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {user.handle}
              </p>
            </div>

            {/* Academic Position */}
            <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 flex-wrap">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{user.title}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {user.institution}
              </span>
            </div>

            {/* Bio */}
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
              {user.bio}
            </p>

            {/* Meta Tags: Location, Date, Website */}
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap pt-1">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.location || 'Oxford, UK'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.joinedDate || 'Fellow since 2024'}</span>
              </div>
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Academic Repository</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>

            {/* Specialties Badges */}
            {user.specialties && (
              <div className="flex items-center gap-1.5 flex-wrap pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Research Specializations:
                </span>
                {user.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            )}

            {/* Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Reputation
                </span>
                <span className="text-sm sm:text-base font-bold text-amber-500 font-mono flex items-center justify-center gap-1 mt-0.5">
                  <Award className="w-4 h-4" />
                  {user.reputation}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Peer Reviews
                </span>
                <span className="text-sm sm:text-base font-bold text-indigo-500 dark:text-indigo-400 font-mono mt-0.5 block">
                  {user.peerReviews}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Followers
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5 block">
                  {user.followersCount}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Saved Syntheses
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5 block">
                  {user.savedPostsCount}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 2. Tabs Navigation: Published Posts, Media, Insightful Reactions */}
      <div className="flex p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          onClick={() => setActiveTab('published')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'published'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Published Syntheses ({displayedPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'media'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Research Media & Figures ({mediaItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('insightful')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'insightful'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>Insightful Endorsements</span>
        </button>
      </div>

      {/* 3. Tab Content */}
      {activeTab === 'published' && (
        <div className="space-y-5">
          {displayedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {activeTab === 'media' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mediaItems.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 overflow-hidden shadow-sm group hover:border-indigo-400/50 transition-all"
            >
              <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
                {item.type === 'image' && (
                  <img
                    src={item.url}
                    alt={item.caption || item.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                {item.type === 'video' && (
                  <div className="relative w-full h-full">
                    <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Video className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                )}
                {item.type === 'pdf' && (
                  <div className="p-6 text-center space-y-1">
                    <FileText className="w-10 h-10 text-rose-500 mx-auto" />
                    <span className="text-[10px] text-slate-400 font-mono block">PDF Manuscript</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <span className="text-[10px] uppercase font-bold text-indigo-500 dark:text-indigo-400 font-mono">
                  {item.type} attachment
                </span>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                  {item.title || item.caption || item.name}
                </h4>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  From: {item.postTitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'insightful' && (
        <div className="space-y-5">
          <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/20 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2.5">
            <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>
              Showing syntheses awarded the highest academic insight score by fellow researchers and peer-review committees.
            </span>
          </div>
          {posts.slice(0, 3).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* 4. Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div 
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#090e1b] border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading">
                  Edit Academic Profile
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Academic Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Institution</label>
                  <input
                    type="text"
                    value={editInstitution}
                    onChange={(e) => setEditInstitution(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Scholarly Bio / Research Focus</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Website / ORCID Repository</label>
                  <input
                    type="text"
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500 text-xs font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/30 active:scale-95 transition-all"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
