import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AuthUser } from '../../types';
import {
  GraduationCap,
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Trophy,
  Award,
  Users,
  Compass,
  ArrowLeft,
  Calendar,
  Zap,
} from 'lucide-react';

interface AuthPageProps {
  isOpen?: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  initialRole?: 'student' | 'staff';
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onClose,
  onLoginSuccess,
  initialRole = 'student',
}) => {
  const [roleType, setRoleType] = useState<'student' | 'staff'>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mouse cursor spotlight tracking
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCursorPos({ x, y });
  };

  // Password rules validation
  const hasMinLength = password.length >= 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

  const criteriaMetCount = [
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
  ].filter(Boolean).length;

  const isPasswordValid = criteriaMetCount === 5;

  const strengthLabels = ['Too Weak', 'Weak', 'Moderate', 'Good', 'Strong', 'Fortified (Compliant)'];
  const strengthColor =
    criteriaMetCount <= 1
      ? 'bg-red-500'
      : criteriaMetCount <= 3
      ? 'bg-amber-500'
      : criteriaMetCount === 4
      ? 'bg-blue-500'
      : 'bg-[var(--moss)]';

  const handleFillDemo = (type: 'student' | 'staff') => {
    setRoleType(type);
    setErrorMessage(null);
    if (type === 'student') {
      setEmail('student@campus.edu');
      setPassword('Student@Campus2026!');
    } else {
      setEmail('admin@campus.edu');
      setPassword('Admin@Campus2026!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both your university email and password.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage(
        'Password does not meet the 12-character security requirements (requires uppercase, lowercase, number, and special character).'
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.login(email.trim(), password, roleType);
      if (!res.success || !res.user) {
        throw new Error(res.error || 'Authentication rejected by security policy.');
      }
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      style={
        {
          '--cursor-x': `${cursorPos.x}px`,
          '--cursor-y': `${cursorPos.y}px`,
        } as React.CSSProperties
      }
      className="relative min-h-screen w-full bg-slate-900 flex items-center justify-center p-3 sm:p-6 lg:p-10 overflow-hidden cursor-glow-container selection:bg-[var(--marine)] selection:text-white"
    >
      {/* Background Ambient Orbs (Glassmorphism Light Base) */}
      <div className="absolute top-[-10%] left-[-5%] w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-[#0E5A6B] to-emerald-600/40 blur-[120px] opacity-70 animate-orb-1 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-cyan-600/30 via-[#0A4350] to-indigo-900/40 blur-[130px] opacity-70 animate-orb-2 pointer-events-none" />
      <div className="absolute top-[40%] right-[30%] w-[350px] h-[350px] rounded-full bg-amber-400/20 blur-[100px] opacity-50 animate-orb-3 pointer-events-none" />

      {/* Main Glassmorphic Container (2-Column Layout) */}
      <div className="relative z-10 w-full max-w-6xl rounded-[20px] glass-panel overflow-hidden border border-white/40 shadow-2xl flex flex-col lg:flex-row transition-all duration-300">
        
        {/* ==================================================== */}
        {/* LEFT SIDE: AUTHENTICATION FORM (STUDENT & STAFF)     */}
        {/* ==================================================== */}
        <div className="w-full lg:w-[48%] p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white/75 backdrop-blur-xl">
          <div>
            {/* Header with security badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[var(--moss)] animate-pulse" />
                <span className="text-[12px] font-sans font-semibold text-[var(--marine)] uppercase tracking-wide">
                  Official Campus Gateway
                </span>
              </div>

              <span className="text-[11px] font-semibold tracking-wider font-mono text-[var(--ink-soft)] bg-black/5 px-2.5 py-1 rounded-full uppercase">
                Single Sign-On SSO
              </span>
            </div>

            {/* University Crest & Title */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-[10px] bg-[var(--marine)] text-white flex items-center justify-center font-serif font-bold text-xl shadow-md">
                  A
                </div>
                <div>
                  <h1 className="font-serif text-[22px] font-bold text-[var(--ink)] leading-tight">
                    Apex University Portal
                  </h1>
                  <p className="text-[12px] text-[var(--ink-soft)] font-sans">
                    Secure Academic Gateway & Information Access
                  </p>
                </div>
              </div>
            </div>

            {/* Role Switcher Tabs (Student vs Staff) */}
            <div className="p-1 bg-slate-200/70 rounded-[8px] flex items-center mb-6 border border-white/60">
              <button
                type="button"
                onClick={() => {
                  setRoleType('student');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2.5 rounded-[6px] text-[13px] font-sans font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  roleType === 'student'
                    ? 'bg-white text-[var(--marine)] shadow-sm'
                    : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student Portal</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRoleType('staff');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2.5 rounded-[6px] text-[13px] font-sans font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  roleType === 'staff'
                    ? 'bg-white text-[var(--marine)] shadow-sm'
                    : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Staff & Admin</span>
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-4 p-3.5 bg-red-50/90 border border-red-200 rounded-[8px] flex items-start gap-2.5 text-[13px] text-[var(--brick)] font-sans animate-fade-in-answer">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-sans font-medium text-[var(--ink)] mb-1.5">
                  {roleType === 'student' ? 'Student University Email or Roll No.' : 'Faculty / Staff University Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--ink-soft)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={roleType === 'student' ? 'e.g., student@campus.edu' : 'e.g., admin@campus.edu'}
                    className="w-full pl-10 pr-4 py-2.5 text-[14px] font-sans rounded-[6px] glass-input text-[var(--ink)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[13px] font-sans font-medium text-[var(--ink)]">
                    Password
                  </label>
                  <span className="text-[11px] font-sans text-[var(--ink-soft)]">
                    Requires 12+ chars & complex rules
                  </span>
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--ink-soft)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full pl-10 pr-10 py-2.5 text-[14px] font-sans rounded-[6px] glass-input text-[var(--ink)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] hover:text-[var(--ink)] cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Progress Bar */}
                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-[11px] font-sans text-[var(--ink-soft)] mb-1">
                    <span>Password Strength:</span>
                    <span className="font-semibold text-[var(--ink)]">
                      {strengthLabels[criteriaMetCount]}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strengthColor}`}
                      style={{ width: `${(criteriaMetCount / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Live Password Criteria Checklist */}
                <div className="mt-3 p-3 bg-slate-50/80 rounded-[6px] border border-[var(--rule)] space-y-1.5">
                  <p className="text-[11px] font-sans font-semibold text-[var(--ink)] uppercase tracking-wider mb-1">
                    Required Security Specifications:
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[12px] font-sans">
                    <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-[var(--moss)] font-medium' : 'text-slate-500'}`}>
                      {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5 text-[var(--moss)]" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                      <span>At least 12 characters</span>
                    </div>

                    <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-[var(--moss)] font-medium' : 'text-slate-500'}`}>
                      {hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5 text-[var(--moss)]" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                      <span>Uppercase letter (A-Z)</span>
                    </div>

                    <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-[var(--moss)] font-medium' : 'text-slate-500'}`}>
                      {hasLowercase ? <CheckCircle2 className="w-3.5 h-3.5 text-[var(--moss)]" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                      <span>Lowercase letter (a-z)</span>
                    </div>

                    <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-[var(--moss)] font-medium' : 'text-slate-500'}`}>
                      {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5 text-[var(--moss)]" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                      <span>At least one number (0-9)</span>
                    </div>

                    <div className={`flex items-center gap-1.5 sm:col-span-2 ${hasSpecial ? 'text-[var(--moss)] font-medium' : 'text-slate-500'}`}>
                      {hasSpecial ? <CheckCircle2 className="w-3.5 h-3.5 text-[var(--moss)]" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                      <span>Special character (!@#$%^&*...)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remember Me & Help */}
              <div className="flex items-center justify-between text-[13px] font-sans pt-1">
                <label className="flex items-center gap-2 text-[var(--ink-soft)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[var(--rule)] text-[var(--marine)] focus:ring-[var(--marine)] cursor-pointer"
                  />
                  <span>Remember workstation</span>
                </label>

                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Please contact the campus IT Registrar helpdesk at registrar-support@campus.edu or visit Tech Block Room 102 for credential resets.');
                  }}
                  className="text-[var(--marine)] hover:underline"
                >
                  Need access help?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[var(--marine)] text-white rounded-[6px] font-sans font-semibold text-[14px] hover:bg-[var(--marine-deep)] active:scale-[0.99] transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </span>
                ) : (
                  <>
                    <span>Sign In to {roleType === 'student' ? 'Student Portal' : 'Staff Console'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Pre-Fill Helper */}
            <div className="mt-5 pt-4 border-t border-[var(--rule)]">
              <p className="text-[12px] font-sans text-[var(--ink-soft)] text-center mb-2">
                Fast Evaluation Demo Credentials:
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('student')}
                  className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-[var(--marine-wash)] text-[var(--marine)] border border-[var(--rule)] rounded-[4px] text-[12px] font-sans font-medium transition-colors cursor-pointer text-center"
                >
                  ⚡ Fill Student Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('staff')}
                  className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-[var(--marine-wash)] text-[var(--marine)] border border-[var(--rule)] rounded-[4px] text-[12px] font-sans font-medium transition-colors cursor-pointer text-center"
                >
                  ⚡ Fill Staff Demo
                </button>
              </div>
            </div>
          </div>

          {/* Security Policy Footer Note */}
          <div className="pt-4 text-center">
            <p className="text-[12px] font-sans text-[var(--ink-soft)]">
              🔒 Protected by 256-bit encryption & role-based campus access control.
            </p>
          </div>
        </div>

        {/* ==================================================== */}
        {/* RIGHT SIDE: COLLEGE ADVERTISEMENT & SHOWCASE         */}
        {/* ==================================================== */}
        <div className="w-full lg:w-[52%] glass-card-ad p-6 sm:p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative glow overlay */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Billboard Badge */}
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-white/20 backdrop-blur-md border border-white/30 text-white tracking-wide animate-badge-glow">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                ADMISSIONS OPEN · FALL 2026
              </span>

              <span className="text-[12px] font-medium text-cyan-200 border-b border-cyan-400/40 pb-0.5">
                NAAC A++ Accredited · NIRF Top 10
              </span>
            </div>

            <h2 className="font-serif text-[28px] sm:text-[32px] font-bold leading-tight tracking-tight text-white drop-shadow-sm">
              Where Tomorrow's Pioneers Innovate Today.
            </h2>

            <p className="text-[14px] sm:text-[15px] text-cyan-100/90 leading-relaxed font-sans max-w-lg">
              Empowering 12,000+ forward-thinking scholars with world-class faculty, AI-driven learning spaces, and over $2.5M in annual student research grants.
            </p>

            {/* Key Advertisement Highlight Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Highlight Card 1: Fest */}
              <div className="glass-subcard p-4 rounded-[12px] hover:border-white/40 transition-all group">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-[6px] bg-amber-400/20 text-yellow-300">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif text-[15px] font-semibold text-white">
                    Innovate 2026 Fest
                  </h3>
                </div>
                <p className="text-[12px] text-cyan-100 font-sans leading-relaxed">
                  National Hackathon with <strong>$10,000 cash pool</strong> on Oct 19. Registrations open on campus portal!
                </p>
              </div>

              {/* Highlight Card 2: Scholarships */}
              <div className="glass-subcard p-4 rounded-[12px] hover:border-white/40 transition-all group">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-[6px] bg-emerald-400/20 text-emerald-300">
                    <Award className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif text-[15px] font-semibold text-white">
                    50% Merit Waivers
                  </h3>
                </div>
                <p className="text-[12px] text-cyan-100 font-sans leading-relaxed">
                  Automatic tuition reduction for students entering with &gt;90% aggregate scores.
                </p>
              </div>

              {/* Highlight Card 3: Placements */}
              <div className="glass-subcard p-4 rounded-[12px] hover:border-white/40 transition-all group">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-[6px] bg-cyan-400/20 text-cyan-300">
                    <Zap className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif text-[15px] font-semibold text-white">
                    98.4% Placements
                  </h3>
                </div>
                <p className="text-[12px] text-cyan-100 font-sans leading-relaxed">
                  Highest package $145,000/yr with 280+ international tech & research recruiters.
                </p>
              </div>

              {/* Highlight Card 4: Smart Campus */}
              <div className="glass-subcard p-4 rounded-[12px] hover:border-white/40 transition-all group">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-[6px] bg-indigo-400/20 text-indigo-300">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif text-[15px] font-semibold text-white">
                    Smart Green Campus
                  </h3>
                </div>
                <p className="text-[12px] text-cyan-100 font-sans leading-relaxed">
                  45 acres of solar-powered facilities, 24/7 innovation lab, and modern residence halls.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Student Testimonial Quote */}
          <div className="relative z-10 pt-6 mt-4 border-t border-white/20">
            <div className="glass-subcard p-3.5 rounded-[10px] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-900 font-bold flex items-center justify-center shrink-0 text-sm shadow-inner">
                MC
              </div>
              <div className="min-w-0">
                <p className="text-[13px] text-white font-serif italic line-clamp-2">
                  "CampusAsk provided instant verified hall ticket eligibility and course credit transfer guidelines in seconds!"
                </p>
                <p className="text-[11px] text-cyan-200 font-sans font-medium mt-0.5">
                  — Maya Chen · B.Tech Computer Science '27
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-cyan-200/80 font-sans mt-3">
              <span>Campus Hotline: +1 (800) 555-APEX</span>
              <span>helpdesk@campus.edu</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
