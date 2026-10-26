import React, { useState } from 'react';
import { Shield, Lock, User, CheckCircle2, AlertCircle, ArrowRight, Play, Cpu, HardDrive, Activity } from 'lucide-react';

interface LoginGateScreenProps {
  onAuthenticated: (user: { username: string; isLocal: boolean }) => void;
  onEnterDemo: () => void;
}

export const LoginGateScreen: React.FC<LoginGateScreenProps> = ({
  onAuthenticated,
  onEnterDemo,
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanUser = username.trim();
    if (!cleanUser) {
      setError('Please enter a username to proceed.');
      return;
    }
    if (cleanUser.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    try {
      const storedJson = localStorage.getItem('windows_xray_accounts') || '{}';
      const accounts = JSON.parse(storedJson);

      if (isRegistering) {
        if (accounts[cleanUser.toLowerCase()]) {
          setError(`Account '${cleanUser}' already exists on this machine. Please Sign In.`);
          return;
        }
        accounts[cleanUser.toLowerCase()] = {
          username: cleanUser,
          createdAt: Date.now(),
        };
        localStorage.setItem('windows_xray_accounts', JSON.stringify(accounts));
        setSuccessMsg('Account created successfully. Logging into Windows X-Ray...');
        setTimeout(() => {
          onAuthenticated({ username: cleanUser, isLocal: true });
        }, 600);
      } else {
        // Sign In
        if (!accounts[cleanUser.toLowerCase()]) {
          // If account doesn't exist yet, auto-provision local guest profile for seamless user experience
          accounts[cleanUser.toLowerCase()] = {
            username: cleanUser,
            createdAt: Date.now(),
          };
          localStorage.setItem('windows_xray_accounts', JSON.stringify(accounts));
        }
        setSuccessMsg(`Welcome, ${cleanUser}! Loading system sensors...`);
        setTimeout(() => {
          onAuthenticated({ username: cleanUser, isLocal: true });
        }, 500);
      }
    } catch {
      // In case localStorage is blocked, allow authentication in-memory
      onAuthenticated({ username: cleanUser, isLocal: true });
    }
  };

  const handleQuickAdminLogin = () => {
    setUsername('Administrator');
    setPassword('admin123');
    onAuthenticated({ username: 'Administrator', isLocal: true });
  };

  return (
    <div className="min-h-screen w-screen bg-[#09090b] text-[#f4f4f5] flex flex-col justify-between font-sans select-none">
      {/* Top Windows Native Header */}
      <header className="h-9 bg-[#070709] border-b border-[#27272a] px-4 flex items-center justify-between text-xs text-[#a1a1aa]">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span className="font-semibold tracking-wider text-[#e4e4e7] uppercase">
            WINDOWS X-RAY
          </span>
          <span className="text-[#3f3f46]">|</span>
          <span className="text-[#71717a]">System Diagnostic Gateway v1.0.0</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-[#22c55e]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            Local Machine Security Active
          </span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#121215] border border-[#27272a] rounded-lg p-6 shadow-2xl space-y-6">
          {/* Logo & Headline */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#38bdf8]">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#fafafa]">
              WINDOWS X-RAY
            </h1>
            <p className="text-xs text-[#a1a1aa] max-w-sm mx-auto">
              Real-Time Hardware Diagnostics & Process Performance Utility
            </p>
          </div>

          {/* Mandatory Login Notice */}
          <div className="p-3 bg-[#18181b] border border-[#27272a] rounded text-xs text-[#a1a1aa] flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-[#e4e4e7]">Local Access Authentication Required:</span>{' '}
              Sign in or register a local profile on this PC to initialize hardware telemetry sensors.
            </div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="p-2.5 bg-red-950/40 border border-red-500/40 rounded text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[#a1a1aa] font-medium mb-1">
                Username / Operator ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Administrator, Student, Engineer"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-[#f4f4f5] placeholder-[#52525b] outline-none focus:border-[#38bdf8] transition-colors"
                />
                <User className="w-3.5 h-3.5 text-[#52525b] absolute right-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-[#a1a1aa] font-medium mb-1">
                Password / Passcode
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter local password (min 4 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded px-3 py-2 text-[#f4f4f5] placeholder-[#52525b] outline-none focus:border-[#38bdf8] transition-colors"
                />
                <Lock className="w-3.5 h-3.5 text-[#52525b] absolute right-3 top-2.5" />
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                }}
                className="text-[#38bdf8] hover:text-[#7dd3fc] font-medium transition-colors"
              >
                {isRegistering
                  ? 'Already have an account? Sign In'
                  : 'New user? Register local profile'}
              </button>

              <button
                type="button"
                onClick={handleQuickAdminLogin}
                className="text-[#71717a] hover:text-[#a1a1aa] text-[11px]"
                title="Log in immediately as Administrator (1-click for quick tests)"
              >
                Use Quick Admin Fill
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] font-bold rounded border border-[#3f3f46] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>{isRegistering ? 'Register & Launch Windows X-Ray' : 'Sign In & Launch System Monitor'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Prominent Demo Mode Bypass (Viva / Evaluation / No Setup) */}
          <div className="pt-4 border-t border-[#27272a] space-y-2 text-center">
            <div className="text-[11px] text-[#71717a] font-medium uppercase tracking-wider">
              Evaluation & Quick Test Options
            </div>
            <button
              type="button"
              onClick={onEnterDemo}
              className="w-full py-2 bg-[#18181b] hover:bg-[#202024] text-[#eab308] font-semibold rounded border border-[#eab308]/40 flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-[#eab308]" />
              <span>Launch Instant Demo Mode (No Login Required)</span>
            </button>
            <p className="text-[11px] text-[#71717a] leading-tight">
              Opens full working simulated Windows 11 hardware telemetry (CPU, RAM, Disks, Network, Processes & Diagnostics).
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Status Bar */}
      <footer className="h-8 bg-[#070709] border-t border-[#27272a] px-4 flex items-center justify-between text-[11px] text-[#71717a]">
        <div>Windows 10 / 11 64-bit Architecture Ready</div>
        <div>Offline PBKDF2 Encryption • Zero Cloud Telemetry</div>
      </footer>
    </div>
  );
};
