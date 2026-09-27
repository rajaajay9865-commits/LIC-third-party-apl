import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  CheckCircle2,
  KeyRound,
  Check,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { UserRole } from '../types/insurance';

interface LoginPageProps {
  onLogin: (role: UserRole, userEmail: string, userName: string) => void;
  onContinueAsGuest?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onContinueAsGuest }) => {
  const [emailOrPhone, setEmailOrPhone] = useState('rahul.sharma@clic.enterprise');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('claims_analyst');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const demoAccounts: { role: UserRole; name: string; email: string; title: string; badge: string }[] = [
    {
      role: 'claims_analyst',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@clic.enterprise',
      title: 'Claims Operations & Triage',
      badge: 'Analyst',
    },
    {
      role: 'risk_analyst',
      name: 'Priya Nair',
      email: 'priya.nair@clic.enterprise',
      title: 'Risk & Fraud Model Specialist',
      badge: 'Risk SIU',
    },
    {
      role: 'admin',
      name: 'Arun Kumar',
      email: 'arun.kumar@clic.enterprise',
      title: 'Chief Risk Officer & Admin',
      badge: 'Executive',
    },
  ];

  const handleSelectDemoAccount = (acc: typeof demoAccounts[0]) => {
    setEmailOrPhone(acc.email);
    setPassword('••••••••••••');
    setSelectedRole(acc.role);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      setErrorMessage('Please enter your email or mobile number.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      const matched = demoAccounts.find(
        (a) => a.email.toLowerCase() === emailOrPhone.toLowerCase()
      );
      const name = matched ? matched.name : emailOrPhone.split('@')[0] || 'Rahul Sharma';
      const role = matched ? matched.role : selectedRole;
      onLogin(role, emailOrPhone, name);
    }, 450);
  };

  return (
    <div className="min-h-screen w-full bg-[#050A18] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans select-none">
      
      {/* ======================================================== */}
      {/* LUXURY AMBIENT BACKGROUND WITH MULTI-LAYERED GLASS GLOW */}
      {/* ======================================================== */}
      {/* Centered primary radiance that illuminates the glass card from behind */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[580px] bg-gradient-to-tr from-blue-600/18 via-indigo-500/14 to-cyan-400/16 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-12 -right-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-12 -left-24 w-80 h-80 bg-blue-700/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Subtle fine dot grid pattern for depth */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(#93c5fd 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} 
      />

      {/* ======================================================== */}
      {/* CENTERED VIEWPORT CONTAINER */}
      {/* ======================================================== */}
      <div className="relative z-10 w-full max-w-[480px] mx-auto flex flex-col items-center justify-center my-auto space-y-4">
        
        {/* BRAND IDENTITY: Minimalist & High-End */}
        <div className="text-center space-y-2 mb-1">
          <div className="flex items-center justify-center gap-3">
            <div className="relative flex items-center justify-center w-12 h-12">
              <svg className="w-12 h-12 drop-shadow-[0_0_16px_rgba(56,189,248,0.45)]" viewBox="0 0 100 100" fill="none">
                <path
                  d="M 68 25 C 40 18, 18 35, 18 60 C 18 82, 38 92, 68 85"
                  stroke="url(#clicGradGlass)"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <circle cx="50" cy="54" r="8.5" fill="#38BDF8" />
                <defs>
                  <linearGradient id="clicGradGlass" x1="10%" y1="20%" x2="90%" y2="80%">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#2563EB" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2">
              <span>CLI</span>
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                CONNECTION
              </span>
            </h1>
          </div>

          <div className="flex items-center justify-center gap-2.5 text-[10px] font-mono tracking-widest uppercase text-cyan-400/90 font-semibold">
            <span>Connect</span>
            <span className="text-slate-600">·</span>
            <span>Manage</span>
            <span className="text-slate-600">·</span>
            <span>Grow</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* HIGH-END GLASSMORPHISM LOGIN CARD */}
        {/* ======================================================== */}
        <div className="w-full relative backdrop-blur-2xl bg-white/[0.04] border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.18)] space-y-5 transition-all">
          
          {/* Subtle top interior highlight */}
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

          {/* Heading */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight">
              Welcome <span className="bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent">Back</span>
            </h2>
            <p className="text-xs text-slate-400">
              Sign in to your private enterprise CLI account
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs text-center backdrop-blur-md">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Input 1: Email or Mobile */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block pl-1">
                Email or Mobile Number
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-slate-400 pointer-events-none">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="Enter email or mobile number"
                  className="w-full bg-white/[0.03] border border-white/[0.1] hover:border-white/[0.2] focus:border-cyan-400/80 focus:bg-white/[0.06] rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 backdrop-blur-md transition"
                />
              </div>
            </div>

            {/* Input 2: Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block pl-1">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-white/[0.03] border border-white/[0.1] hover:border-white/[0.2] focus:border-cyan-400/80 focus:bg-white/[0.06] rounded-2xl py-3 pl-11 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 backdrop-blur-md transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 hover:text-white transition cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-500"
                />
                <span className="text-slate-400 hover:text-slate-300 transition">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-cyan-400 hover:text-cyan-300 font-medium transition cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Glowing Glass Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 border border-cyan-400/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>{isLoading ? 'Authenticating with CLI...' : 'Login →'}</span>
            </button>
          </form>

          {/* Quick Demo Role Selector: Subtle Glass Chips */}
          <div className="pt-3 border-t border-white/[0.08] space-y-2">
            <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block text-center">
              1-Click Demo Profiles:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleSelectDemoAccount(acc)}
                  className={`p-2.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between backdrop-blur-md ${
                    emailOrPhone === acc.email
                      ? 'bg-blue-600/20 border-cyan-400/80 text-white shadow-md ring-1 ring-cyan-400/40'
                      : 'bg-white/[0.02] border-white/[0.08] text-slate-300 hover:bg-white/[0.05] hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{acc.name}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/80">
                      {acc.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 truncate">{acc.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Trust & Encryption Badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1 border-t border-white/[0.08]">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-slate-300 font-medium">Secure Login</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">256-Bit Enterprise SSL Encryption</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SUBTLE, TYPOGRAPHIC SLOGAN ELEMENT (Refined Visual Hierarchy) */}
        {/* ======================================================== */}
        <div className="text-center space-y-1.5 pt-2 max-w-sm mx-auto">
          <p className="text-xs sm:text-[13px] font-medium tracking-wide text-slate-400/90 font-sans">
            Better connection for a smarter tomorrow
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] font-mono tracking-widest uppercase text-slate-500">
            <span>CLI CONNECTION</span>
            <span>·</span>
            <span>Private Enterprise</span>
            <span>·</span>
            <span>Direct Approvals</span>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* FORGOT PASSWORD MODAL (Matching Glassmorphic Style) */}
      {/* ======================================================== */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B132B]/95 border border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl text-white space-y-4 backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-blue-950/80 text-cyan-400 border border-blue-800/80">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset Account Password</h3>
                <p className="text-xs text-slate-400">Enter your registered email to receive a recovery link</p>
              </div>
            </div>

            {resetSent ? (
              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Recovery Link Dispatched!</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  A temporary password reset token has been sent to <strong>{emailOrPhone}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => { setForgotModalOpen(false); setResetSent(false); }}
                  className="w-full mt-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="email"
                  defaultValue={emailOrPhone}
                  placeholder="name@company.com"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetSent(true)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white transition cursor-pointer shadow-md"
                  >
                    Send Reset Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
