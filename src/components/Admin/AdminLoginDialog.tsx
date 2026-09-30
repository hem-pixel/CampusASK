import React, { useState } from 'react';
import { Lock, ShieldCheck, X, Eye, EyeOff } from 'lucide-react';

interface AdminLoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginDialog: React.FC<AdminLoginDialogProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('admin@campus.edu');
  const [password, setPassword] = useState('Admin@Campus2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      if (data.token) {
        sessionStorage.setItem('admin_token', data.token);
      }
      onLoginSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-login-title"
    >
      <div className="bg-[var(--surface)] w-full max-w-md rounded-[10px] shadow-2xl border border-[var(--rule)] p-6 modal-dialog">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--rule)] mb-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[var(--marine-wash)] rounded-[4px]">
              <Lock className="w-5 h-5 text-[var(--marine)]" />
            </div>
            <div>
              <h2 id="admin-login-title" className="font-serif text-[20px] font-semibold text-[var(--ink)]">
                Admin Authentication
              </h2>
              <p className="text-[12px] text-[var(--ink-soft)] font-sans">
                College Staff & Knowledge Management
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close login dialog"
            className="text-[var(--ink-soft)] hover:text-[var(--ink)] p-1 rounded-sm cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-[var(--brick)] rounded-[4px] text-[13px] font-sans">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-[500] text-[var(--ink)] mb-1 font-sans">
              Staff Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-[14px] border border-[var(--rule)] rounded-[4px] bg-white text-[var(--ink)] font-sans focus:ring-2 focus:ring-[var(--marine)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[13px] font-[500] text-[var(--ink)] mb-1 font-sans">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-[14px] border border-[var(--rule)] rounded-[4px] bg-white text-[var(--ink)] font-sans focus:ring-2 focus:ring-[var(--marine)] focus:outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] hover:text-[var(--ink)]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-[var(--ink-soft)] mt-1.5 font-sans">
              Pre-seeded demo admin: <code className="bg-gray-100 px-1 py-0.5 rounded text-[var(--ink)]">admin@campus.edu</code>
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[var(--marine)] text-white rounded-[4px] font-[500] text-[14px] hover:bg-[var(--marine-deep)] transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isLoading ? 'Verifying Credentials...' : 'Sign In as Administrator'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
