import React, { useState, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  Atom, 
  UploadCloud, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Trash2, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Bold, 
  Italic, 
  Quote, 
  List, 
  Link2, 
  Code, 
  ChevronDown, 
  ChevronUp, 
  Compass, 
  HeartPulse, 
  Dna, 
  Scroll, 
  Brain,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DISCIPLINE_OPTIONS = [
  { id: 'Astronomy', name: 'Astronomy & Cosmology', icon: Compass, color: 'indigo' },
  { id: 'Medicine', name: 'Medicine & Embryology', icon: HeartPulse, color: 'rose' },
  { id: 'Physics', name: 'Quantum Physics & Reality', icon: Atom, color: 'blue' },
  { id: 'Biology', name: 'Biology & Evolution', icon: Dna, color: 'emerald' },
  { id: 'History', name: 'History of Science', icon: Scroll, color: 'amber' },
  { id: 'Philosophy', name: 'Philosophy & Kalam', icon: BookOpen, color: 'amber' },
  { id: 'Neurotheology', name: 'Neurotheology & Mind', icon: Brain, color: 'purple' },
];

export default function CreatePostModal({ isOpen, onClose }) {
  const { user, addPost } = useAuth();

  // Core Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Astronomy');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Collapsible Sections State
  const [isReligiousOpen, setIsReligiousOpen] = useState(true);
  const [hasReligiousRef, setHasReligiousRef] = useState(true);
  const [religiousSource, setReligiousSource] = useState('The Holy Qur\'an — Surah Al-Anbiya (21:30)');
  const [religiousScripture, setReligiousScripture] = useState('Do not the disbelievers see that the heavens and the earth were a closed-up mass, then We opened them out?');
  const [religiousExegesis, setReligiousExegesis] = useState('Classical lexicographers note that "ratq" signifies an impermeable fused mass, while "fatq" denotes deliberate cleaving apart.');
  const [religiousTradition, setReligiousTradition] = useState('Classical Exegesis & Semantics');

  const [isScientificOpen, setIsScientificOpen] = useState(true);
  const [hasScientificRef, setHasScientificRef] = useState(true);
  const [scientificField, setScientificField] = useState('Physical Cosmology & Relativistic Mechanics');
  const [scientificCitation, setScientificCitation] = useState('Physical Review Letters (2025) — DOI: 10.1103/PhysRevLett.134.021101');
  const [scientificPaperTitle, setScientificPaperTitle] = useState('Observational Constraints on Metric Space Perturbations in Early Epochs');
  const [scientificExplanation, setScientificExplanation] = useState('CMB radiation frequency analysis verifies primordial metric expansion from a hot dense boundary state.');

  // Multimedia Upload State
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const contentTextareaRef = useRef(null);

  // Form Validation & Submitting States
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Insert Rich-Text formatting tag helper
  const insertFormatting = (prefix, suffix = '') => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = textarea.value;
    const selectedText = previousText.substring(start, end) || 'sample text';
    const replacement = `${prefix}${selectedText}${suffix}`;

    setContent(
      previousText.substring(0, start) + replacement + previousText.substring(end)
    );

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 50);
  };

  // Handle Drag & Drop Files
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (newFiles) => {
    const processed = newFiles.map((file) => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

      return {
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: isImage ? 'image' : isVideo ? 'video' : isPdf ? 'pdf' : 'document',
        url: isImage || isVideo ? URL.createObjectURL(file) : null,
        file,
      };
    });

    setUploadedFiles((prev) => [...prev, ...processed]);
  };

  // Remove individual file from list
  const removeFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Quick Preset Sample Files for Easy Testing
  const addPresetSample = (type) => {
    if (type === 'image') {
      setUploadedFiles((prev) => [
        ...prev,
        {
          id: `sample-img-${Date.now()}`,
          name: 'JWST_Carina_Nebula_Infrared.jpg',
          size: '3.40 MB',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1000&auto=format&fit=crop&q=80',
          caption: 'Infrared Spectral Reconstruction of Cosmic Molecular Cloud',
        },
      ]);
    } else if (type === 'video') {
      setUploadedFiles((prev) => [
        ...prev,
        {
          id: `sample-vid-${Date.now()}`,
          name: 'Quantum_Decoherence_Colloquium.mp4',
          size: '48.10 MB',
          type: 'video',
          url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1000&auto=format&fit=crop&q=80',
          duration: '14:20',
          caption: 'Presentation on Bell Inequality Tests & Non-Locality',
        },
      ]);
    } else if (type === 'pdf') {
      setUploadedFiles((prev) => [
        ...prev,
        {
          id: `sample-pdf-${Date.now()}`,
          name: 'Comparative_Morphogenesis_Carnegie_Stages.pdf',
          size: '4.85 MB',
          type: 'pdf',
          pagesCount: 32,
          caption: 'Peer-reviewed comparative histology analysis',
        },
      ]);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required.';
    } else if (title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters.';
    }

    if (!content.trim()) {
      newErrors.content = 'Main thesis content is required.';
    } else if (content.trim().length < 20) {
      newErrors.content = 'Please provide an academic discussion of at least 20 characters.';
    }

    if (hasReligiousRef && !religiousSource.trim()) {
      newErrors.religiousSource = 'Scriptural or historical source citation is required.';
    }

    if (hasScientificRef && !scientificCitation.trim()) {
      newErrors.scientificCitation = 'Journal citation or DOI is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ title: true, content: true, religiousSource: true, scientificCitation: true });

    if (!validateForm()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      // Build multimedia object for PostCard
      let mediaPayload = null;
      if (uploadedFiles.length > 0) {
        const imageFiles = uploadedFiles.filter((f) => f.type === 'image');
        const videoFiles = uploadedFiles.filter((f) => f.type === 'video');
        const pdfFiles = uploadedFiles.filter((f) => f.type === 'pdf');

        if (imageFiles.length > 0) {
          mediaPayload = {
            type: 'image',
            items: imageFiles.map((f) => ({
              url: f.url,
              caption: f.caption || f.name,
              alt: f.name,
            })),
          };
        } else if (videoFiles.length > 0) {
          mediaPayload = {
            type: 'video',
            video: {
              title: title,
              duration: videoFiles[0].duration || '12:00',
              poster: videoFiles[0].url,
              views: '1.2k views',
              speaker: user.name,
            },
          };
        } else if (pdfFiles.length > 0) {
          mediaPayload = {
            type: 'pdf',
            document: {
              title: pdfFiles[0].name,
              fileSize: pdfFiles[0].size,
              pagesCount: pdfFiles[0].pagesCount || 18,
              description: 'Supplementary academic manuscript and empirical data attachment.',
              downloadUrl: '#',
            },
          };
        }
      }

      // Generate tags array
      const tags = tagsInput
        ? tagsInput.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean)
        : [category, 'AcademicSynthesis', 'PeerReviewed'];

      const newPost = {
        id: `post-${Date.now()}`,
        category,
        author: {
          name: user.name,
          handle: user.handle,
          roleBadge: category === 'Philosophy' ? 'Theologian' : 'Astrophysicist',
          badgeType: category === 'Philosophy' || category === 'History' ? 'theology' : 'science',
          institution: user.institution,
          avatar: user.avatar,
          isVerified: true,
        },
        timestamp: 'Just now',
        title: title.trim(),
        content: content.trim(),
        tags,
        religiousReference: hasReligiousRef
          ? {
              source: religiousSource.trim(),
              scripture: religiousScripture.trim(),
              exegesis: religiousExegesis.trim(),
              tradition: religiousTradition,
            }
          : null,
        scientificReference: hasScientificRef
          ? {
              field: scientificField,
              citation: scientificCitation.trim(),
              paperTitle: scientificPaperTitle.trim() || 'Empirical Investigation and Synthesis',
              explanation: scientificExplanation.trim(),
            }
          : null,
        media: mediaPayload,
        stats: {
          likes: 1,
          insightfuls: 1,
          commentsCount: 0,
          shares: 0,
        },
        comments: [],
      };

      addPost(newPost);
      setIsSubmitting(false);
      onClose();
    }, 700);
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      
      {/* Modal Card */}
      <div 
        className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#090e1b] border border-slate-200 dark:border-slate-800 shadow-2xl transition-all my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* 1. Header with Scholar Identity */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 sm:p-6 pb-4 border-b bg-white/95 dark:bg-[#090e1b]/95 backdrop-blur-md border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-400"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-heading">
                  Publish Academic Synthesis
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono">
                  Peer Review Charter
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Posting as <strong className="text-slate-800 dark:text-slate-200">{user.name}</strong> • {user.institution}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Main Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          
          {/* A. Title & Category Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Category Dropdown */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Discipline Category <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full py-2.5 pl-3 pr-8 rounded-xl text-xs font-semibold appearance-none bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  {DISCIPLINE_OPTIONS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Post Title Input */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Synthesis Title / Thesis <span className="text-rose-500">*</span>
                </label>
                <span className={`text-[10px] font-mono ${
                  title.length > 110 ? 'text-rose-500' : 'text-slate-400'
                }`}>
                  {title.length}/120
                </span>
              </div>
              <input
                type="text"
                maxLength={120}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
                placeholder="e.g. Metric Expansion of Spacetime and 7th-Century Cosmological Exegesis..."
                className={`w-full py-2.5 px-3.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border outline-none transition-colors text-slate-900 dark:text-white placeholder:text-slate-400 ${
                  errors.title && touched.title
                    ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500'
                }`}
              />
              {errors.title && touched.title && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.title}
                </p>
              )}
            </div>

          </div>

          {/* B. Rich-Text Style Main Discussion Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Main Scholarly Argumentation <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>~{estimatedReadTime} min read</span>
              </div>
            </div>

            {/* Rich-Text Formatting Toolbar */}
            <div className="flex items-center gap-1 p-1.5 border border-b-0 rounded-t-xl bg-slate-50 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 flex-wrap text-slate-600 dark:text-slate-300">
              <button
                type="button"
                onClick={() => insertFormatting('**', '**')}
                title="Bold (**text**)"
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-xs transition-colors"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('*', '*')}
                title="Italic (*text*)"
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-xs transition-colors"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <span className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
              <button
                type="button"
                onClick={() => insertFormatting('> ')}
                title="Blockquote (> text)"
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-xs transition-colors"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('- ')}
                title="Bullet List (- item)"
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-xs transition-colors"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('`doi:', '`')}
                title="Inline DOI / Code (`code`)"
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-xs transition-colors font-mono"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('[Paper Title](', ')')}
                title="Hyperlink [Title](URL)"
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-xs transition-colors"
              >
                <Link2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Textarea */}
            <textarea
              ref={contentTextareaRef}
              rows={5}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content) setErrors((prev) => ({ ...prev, content: null }));
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, content: true }))}
              placeholder="Detail your synthesis connecting empirical research with philosophical/religious traditions. Provide clear methodology and reasoning..."
              className={`w-full p-3.5 rounded-b-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border outline-none transition-colors text-slate-900 dark:text-white placeholder:text-slate-400 resize-y ${
                errors.content && touched.content
                  ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500'
              }`}
            />
            {errors.content && touched.content && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.content}
              </p>
            )}
          </div>

          {/* C. Two Dedicated Collapsible Highlight Sections */}
          <div className="space-y-3 pt-1">
            
            {/* Section 1: Religious Reference (Warm Amber / Gold Theme) */}
            <div className="rounded-2xl border transition-all border-amber-500/30 bg-gradient-to-br from-amber-500/[0.06] via-amber-500/[0.02] to-transparent dark:from-amber-950/20 dark:via-amber-950/05 dark:to-transparent overflow-hidden">
              <div 
                className="flex items-center justify-between p-3.5 cursor-pointer select-none bg-amber-500/10 hover:bg-amber-500/15 dark:bg-amber-950/30 dark:hover:bg-amber-950/40 transition-colors"
                onClick={() => setIsReligiousOpen(!isReligiousOpen)}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded-md bg-amber-500 text-slate-950">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider font-mono">
                      Add Religious Reference / Sacred Text
                    </span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                      Include scriptural passages, exegesis, or classical treatises
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={hasReligiousRef}
                      onChange={(e) => setHasReligiousRef(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-semibold text-[11px]">Include Box</span>
                  </label>
                  {isReligiousOpen ? <ChevronUp className="w-4 h-4 text-amber-600" /> : <ChevronDown className="w-4 h-4 text-amber-600" />}
                </div>
              </div>

              {isReligiousOpen && hasReligiousRef && (
                <div className="p-4 space-y-3 pt-3 text-xs animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Scriptural Source / Citation <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={religiousSource}
                        onChange={(e) => setReligiousSource(e.target.value)}
                        placeholder="e.g. The Holy Qur'an — Surah Al-Mulk (67:3–4)"
                        className="w-full py-2 px-3 rounded-xl border border-amber-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-amber-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Hermeneutical Tradition / Exegete
                      </label>
                      <input
                        type="text"
                        value={religiousTradition}
                        onChange={(e) => setReligiousTradition(e.target.value)}
                        placeholder="e.g. Classical Kalam / Fakhr al-Din al-Razi"
                        className="w-full py-2 px-3 rounded-xl border border-amber-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-amber-500 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Sacred Scripture / Quote Text
                    </label>
                    <textarea
                      rows={2}
                      value={religiousScripture}
                      onChange={(e) => setReligiousScripture(e.target.value)}
                      placeholder="Insert the exact translation or quotation..."
                      className="w-full p-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-amber-500 text-xs font-serif italic resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tafsir / Contextual Exegesis Commentary
                    </label>
                    <textarea
                      rows={2}
                      value={religiousExegesis}
                      onChange={(e) => setReligiousExegesis(e.target.value)}
                      placeholder="Linguistic derivation, historical revelation context, or classical commentary notes..."
                      className="w-full p-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-amber-500 text-xs resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Scientific Explanation / Study (Cosmic Indigo Theme) */}
            <div className="rounded-2xl border transition-all border-indigo-500/30 bg-gradient-to-br from-indigo-500/[0.06] via-indigo-500/[0.02] to-transparent dark:from-indigo-950/20 dark:via-indigo-950/05 dark:to-transparent overflow-hidden">
              <div 
                className="flex items-center justify-between p-3.5 cursor-pointer select-none bg-indigo-500/10 hover:bg-indigo-500/15 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/40 transition-colors"
                onClick={() => setIsScientificOpen(!isScientificOpen)}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded-md bg-indigo-600 text-white">
                    <Atom className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider font-mono">
                      Add Scientific Evidence / Study Reference
                    </span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                      Peer-reviewed empirical research, journal DOI, and findings
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-indigo-700 dark:text-indigo-400 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={hasScientificRef}
                      onChange={(e) => setHasScientificRef(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-semibold text-[11px]">Include Box</span>
                  </label>
                  {isScientificOpen ? <ChevronUp className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4 text-indigo-600" />}
                </div>
              </div>

              {isScientificOpen && hasScientificRef && (
                <div className="p-4 space-y-3 pt-3 text-xs animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Journal Citation & DOI Link <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={scientificCitation}
                        onChange={(e) => setScientificCitation(e.target.value)}
                        placeholder="e.g. Nature Physics (2025) — DOI: 10.1038/s41567-..."
                        className="w-full py-2 px-3 rounded-xl border border-indigo-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Field of Study
                      </label>
                      <input
                        type="text"
                        value={scientificField}
                        onChange={(e) => setScientificField(e.target.value)}
                        placeholder="e.g. Molecular Biophysics & Cryo-EM"
                        className="w-full py-2 px-3 rounded-xl border border-indigo-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Paper Title / Research Abstract
                    </label>
                    <input
                      type="text"
                      value={scientificPaperTitle}
                      onChange={(e) => setScientificPaperTitle(e.target.value)}
                      placeholder="Title of published study..."
                      className="w-full py-2 px-3 rounded-xl border border-indigo-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Empirical Findings & Mathematical Model Summary
                    </label>
                    <textarea
                      rows={2}
                      value={scientificExplanation}
                      onChange={(e) => setScientificExplanation(e.target.value)}
                      placeholder="Explain the empirical mechanism, data points, or equations supporting the synthesis..."
                      className="w-full p-2.5 rounded-xl border border-indigo-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500 text-xs resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* D. Multimedia Drag-and-Drop Upload Zone */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Multimedia Attachments (Images, Videos, Manuscripts)
                </label>
                <p className="text-[10px] text-slate-400">
                  Drag and drop files or choose one of the quick test presets below
                </p>
              </div>

              {/* Quick Sample Presets Buttons */}
              <div className="hidden sm:flex items-center gap-1.5 text-[10px]">
                <span className="text-slate-400 font-medium">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => addPresetSample('image')}
                  className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                >
                  + Image
                </button>
                <button
                  type="button"
                  onClick={() => addPresetSample('video')}
                  className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 hover:bg-amber-100 transition-colors"
                >
                  + Video
                </button>
                <button
                  type="button"
                  onClick={() => addPresetSample('pdf')}
                  className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                >
                  + PDF
                </button>
              </div>
            </div>

            {/* Drop Zone Box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
                  : 'border-slate-300 dark:border-slate-800 hover:border-indigo-400/60 bg-slate-50/50 dark:bg-slate-900/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.docx"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-2.5">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Drag and drop research media here, or <span className="text-indigo-600 dark:text-indigo-400 underline">browse files</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports High-Res Images (PNG, JPG), Colloquium Videos (MP4), and PDF Manuscripts up to 50MB
              </p>
            </div>

            {/* Live Uploaded Files Preview Grid with Remove (X) Button */}
            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {uploadedFiles.map((item) => (
                  <div
                    key={item.id}
                    className="relative group rounded-xl p-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm flex items-center gap-3 overflow-hidden"
                  >
                    {/* Thumbnail / Icon */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 flex items-center justify-center text-white">
                      {item.type === 'image' && item.url ? (
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                      ) : item.type === 'video' ? (
                        <div className="relative w-full h-full flex items-center justify-center bg-indigo-950">
                          <Video className="w-5 h-5 text-indigo-400" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-rose-950/80 text-rose-400">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0 pr-6">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span className="uppercase">{item.type}</span>
                        <span>•</span>
                        <span>{item.size}</span>
                      </div>
                    </div>

                    {/* Remove (X) Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(item.id);
                      }}
                      title="Remove file"
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/80 dark:hover:text-rose-400 text-slate-400 flex items-center justify-center transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* E. Tags Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Scholarly Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Cosmology, Inflation, Exegesis, SurahAlAnbiya"
              className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />
          </div>

          {/* 3. Footer Actions & Form Validation Status */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Checked against FaithNova Discourse Charter v2.4</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                Save as Draft
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 active:scale-95 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Validating & Publishing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Synthesis</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>

    </div>
  );
}
