import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  BookOpen, 
  Atom, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  Building2, 
  GraduationCap, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  Quote, 
  Compass,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, setUser, showToast } = useAuth();
  const { isDark } = useTheme();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('tariq.almansoor@physics.ox.ac.uk');
  const [loginPassword, setLoginPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regInstitution, setRegInstitution] = useState('');
  const [regDiscipline, setRegDiscipline] = useState('Astrophysics & Cosmology');
  const [regPassword, setRegPassword] = useState('');
  const [agreeCharter, setAgreeCharter] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      showToast('Welcome back, Dr. Al-Mansoor! Fellowship session active.');
      navigate('/');
    }, 600);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!agreeCharter) {
      alert('Please agree to the FaithNova Academic Discourse Charter to register.');
      return;
    }
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setUser(prev => ({
        ...prev,
        name: regName || 'Scholar Fellow',
        institution: regInstitution || 'Cambridge University',
        title: `${regDiscipline} Researcher`,
      }));
      showToast('Fellowship registration submitted! Welcome to FaithNova.');
      navigate('/profile');
    }, 700);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc] dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* 1. Left Side: Cosmic Branding, Quote & Academic Identity (Hidden on small mobile if desired, or top on mobile) */}
      <div className="w-full md:w-1/2 lg:w-5/12 p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-[#070b14] text-white border-b md:border-b-0 md:border-r border-indigo-500/20">
        
        {/* Subtle cosmic background glow effects */}
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-indigo-600/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
        
        {/* Top Logo */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-amber-400 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full rounded-[11px] bg-slate-950 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight font-heading">
                Faith<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">Nova</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-mono tracking-wider">
                ACADEMIA & SYNTHESIS
              </span>
            </div>
          </Link>

          <Link to="/" className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 font-medium transition-colors">
            <span>Explore Feed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Center Quote & Visual Metaphor */}
        <div className="relative z-10 my-8 sm:my-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold font-mono">
            <Atom className="w-3.5 h-3.5 text-amber-400" />
            <span>The Harmony of Faith & Reason</span>
          </div>

          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative">
              <Quote className="w-6 h-6 text-amber-400/50 absolute top-3 right-3" />
              <p className="text-sm sm:text-base font-serif italic text-slate-200 leading-relaxed mb-3">
                "Science without religion is lame, religion without science is blind."
              </p>
              <div className="text-xs font-mono text-amber-300 font-semibold">
                — Albert Einstein (Science, Philosophy and Religion, 1941)
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md relative">
              <Quote className="w-6 h-6 text-amber-400/50 absolute top-3 right-3" />
              <p className="text-sm sm:text-base font-serif italic text-slate-200 leading-relaxed mb-3">
                "Indeed, in the creation of the heavens and the earth and the alternation of the night and the day are signs for those of understanding."
              </p>
              <div className="text-xs font-mono text-amber-300 font-semibold">
                — The Holy Qur'an, Surah Ali 'Imran (3:190)
              </div>
            </div>
          </div>

          {/* 3 Academic Pillars */}
          <div className="grid grid-cols-1 gap-2.5 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span>Peer-reviewed scientific DOI citations required</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span>Rigorous classical hermeneutics and contextual exegesis</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span>Academic ethics charter against ad hominem discourse</span>
            </div>
          </div>
        </div>

        {/* Bottom Testimonial */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
            alt="Prof. Amina El-Khatib"
            className="w-9 h-9 rounded-full object-cover ring-1 ring-amber-400"
          />
          <div>
            <span className="text-xs font-bold block text-white">Prof. Amina El-Khatib</span>
            <span className="text-[11px] text-slate-400">Chair of Biophysics, Cambridge Fellow</span>
          </div>
        </div>

      </div>

      {/* 2. Right Side: Login / Sign-up Forms */}
      <div className="w-full md:w-1/2 lg:w-7/12 p-6 sm:p-10 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          
          {/* Form Header & Mode Toggle */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white">
                {mode === 'login' ? 'Scholar Fellowship Sign In' : 'Apply for Academic Fellowship'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {mode === 'login' 
                ? 'Access your research syntheses, peer reviews, and academic archives.'
                : 'Join a cross-disciplinary collective of scientists, theologians, and philosophers.'
              }
            </p>

            {/* Mode Switch Tabs */}
            <div className="flex p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300/60 dark:border-slate-800 mt-5">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Register Fellowship
              </button>
            </div>
          </div>

          {/* Quick Demo Login Preset Button */}
          {mode === 'login' && (
            <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Testing? Use pre-configured Scholar Fellow credentials
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLoginEmail('tariq.almansoor@physics.ox.ac.uk');
                  setLoginPassword('quantumCosmo2026!');
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold hover:bg-amber-500/30 transition-colors flex-shrink-0"
              >
                Autofill
              </button>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Institutional Email / Scholar Handle
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="scholar@university.edu"
                    className="w-full py-2.5 pl-9 pr-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to registered email.'); }} className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter fellowship password"
                    className="w-full py-2.5 pl-9 pr-10 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Keep fellowship active</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Fellowship</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name & Academic Title
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Dr. Amina El-Khatib, PhD"
                    className="w-full py-2.5 pl-9 pr-3 text-xs rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Institutional Email (.edu, .ac.uk, or research address)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="scholar@university.edu"
                    className="w-full py-2.5 pl-9 pr-3 text-xs rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Discipline
                  </label>
                  <select
                    value={regDiscipline}
                    onChange={(e) => setRegDiscipline(e.target.value)}
                    className="w-full py-2.5 px-3 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  >
                    <option value="Astrophysics & Cosmology">Astrophysics & Cosmology</option>
                    <option value="Quantum Physics">Quantum Physics</option>
                    <option value="Molecular Biophysics">Molecular Biophysics</option>
                    <option value="Medical Embryology">Medical Embryology</option>
                    <option value="Classical Kalam & Theology">Classical Kalam & Theology</option>
                    <option value="Philosophy of Science">Philosophy of Science</option>
                    <option value="Cognitive Neuroscience">Cognitive Neuroscience</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Institution
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={regInstitution}
                      onChange={(e) => setRegInstitution(e.target.value)}
                      placeholder="e.g. Oxford, MIT, Al-Azhar"
                      className="w-full py-2.5 pl-9 pr-3 text-xs rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Choose Fellowship Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full py-2.5 pl-9 pr-3 text-xs rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/20">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    required
                    checked={agreeCharter}
                    onChange={(e) => setAgreeCharter(e.target.checked)}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-slate-700 dark:text-slate-300 leading-normal text-[11px]">
                    I pledge adherence to the <strong className="text-amber-600 dark:text-amber-400">FaithNova Academic Discourse Charter</strong>: to support claims with peer-reviewed research, respect scriptural context, and avoid ad hominem polemics.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Registering Scholar Fellow...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Fellowship Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>

    </div>
  );
}
