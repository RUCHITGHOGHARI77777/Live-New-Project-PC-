import React, { useState } from 'react';
import { User, Lock, X, CheckCircle2, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { username: string }) => void;
  onStartDemo: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onStartDemo,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanUser = username.trim();
    if (!cleanUser) {
      setError('Please provide a username.');
      return;
    }
    if (cleanUser.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    // Local account persistence using localStorage (offline on this PC)
    const storedUsersJson = localStorage.getItem('windows_xray_local_users') || '{}';
    const users = JSON.parse(storedUsersJson);

    if (isSignUp) {
      if (users[cleanUser.toLowerCase()]) {
        setError(`Local account '${cleanUser}' already exists on this machine.`);
        return;
      }
      // Store user record locally
      users[cleanUser.toLowerCase()] = {
        username: cleanUser,
        createdAt: Date.now(),
      };
      localStorage.setItem('windows_xray_local_users', JSON.stringify(users));
      setSuccessMsg('Local account registered successfully!');
      setTimeout(() => {
        onLoginSuccess({ username: cleanUser });
        onClose();
      }, 700);
    } else {
      // Login check
      const record = users[cleanUser.toLowerCase()];
      if (!record) {
        // Automatically allow creating or logging in
        users[cleanUser.toLowerCase()] = {
          username: cleanUser,
          createdAt: Date.now(),
        };
        localStorage.setItem('windows_xray_local_users', JSON.stringify(users));
      }
      setSuccessMsg(`Welcome, ${cleanUser}!`);
      setTimeout(() => {
        onLoginSuccess({ username: cleanUser });
        onClose();
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-[#2a3854] rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#1f293d]">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
            <User className="w-5 h-5 text-blue-400" />
            <span>{isSignUp ? 'Create Local Machine Account' : 'Sign In to Local Profile'}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Local Scope Notice */}
        <div className="p-3 rounded bg-blue-950/30 border border-blue-800/30 text-[11px] text-slate-300 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-blue-300">Offline Local Account:</span>{' '}
            <span>
              Profiles are saved locally on this machine only with no external cloud server, ensuring full data privacy.
            </span>
          </div>
        </div>

        {error && (
          <div className="p-2.5 rounded bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Local Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. system_admin or student"
              className="w-full bg-[#0b1220] border border-[#1f293d] rounded p-2 text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Local Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full bg-[#0b1220] border border-[#1f293d] rounded p-2 text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-blue-400 hover:text-blue-300 text-xs font-medium"
            >
              {isSignUp ? 'Already registered? Sign In' : 'Need an account? Register locally'}
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-sm"
            >
              {isSignUp ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        </form>

        {/* Demo Mode Direct Link */}
        <div className="pt-3 border-t border-[#1f293d] flex items-center justify-between text-xs text-slate-400">
          <span>Just exploring?</span>
          <button
            onClick={() => {
              onStartDemo();
              onClose();
            }}
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Demo Mode (No Login Required)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
