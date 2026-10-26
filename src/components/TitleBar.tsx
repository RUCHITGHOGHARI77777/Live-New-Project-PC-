import React from 'react';
import { Activity, Minus, Square, X, Download, LogOut, Shield } from 'lucide-react';

interface TitleBarProps {
  isDemo: boolean;
  currentUser: { username: string } | null;
  onToggleDemo: () => void;
  onDownloadZip: () => void;
  onLogout: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  isDemo,
  currentUser,
  onToggleDemo,
  onDownloadZip,
  onLogout,
}) => {
  return (
    <header className="h-9 bg-[#070709] border-b border-[#27272a] flex items-center justify-between px-3 select-none text-xs">
      {/* Left: App Icon & Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#e4e4e7]">
          <Activity className="w-3.5 h-3.5 text-[#38bdf8]" />
        </div>
        <span className="font-bold tracking-wider text-[#fafafa] uppercase">
          WINDOWS X-RAY
        </span>
        <span className="text-[#3f3f46] font-medium">|</span>
        <span className="text-[#a1a1aa] hidden sm:inline">
          System Monitoring & Diagnostic Utility v1.0.0
        </span>
      </div>

      {/* Middle: Live/Demo Mode Switcher & Download */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleDemo}
          className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
            isDemo
              ? 'bg-[#1c1917] border-[#ca8a04]/60 text-[#fde047]'
              : 'bg-[#052e16]/60 border-[#15803d]/60 text-[#86efac]'
          }`}
          title="Toggle between Live Hardware Telemetry and Simulated Windows 11 Desktop Data"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isDemo ? 'bg-[#eab308] animate-pulse' : 'bg-[#22c55e]'
            }`}
          />
          {isDemo ? 'DEMO MODE (Simulated)' : 'LIVE TELEMETRY (Hardware)'}
        </button>

        <button
          onClick={onDownloadZip}
          className="hidden md:flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium bg-[#18181b] border border-[#27272a] text-[#d4d4d8] hover:bg-[#27272a] transition-colors"
          title="Download the full GitHub-ready Windows Desktop package (main.py, .bat launcher, tests, requirements)"
        >
          <Download className="w-3 h-3 text-[#a1a1aa]" />
          <span>Download Package (.zip)</span>
        </button>

        {currentUser && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-[#ef4444] hover:border-[#7f1d1d] transition-colors"
            title="Log out of local profile and return to Login Gate"
          >
            <LogOut className="w-3 h-3" />
            <span>Lock / Logout</span>
          </button>
        )}
      </div>

      {/* Right: Windows Native Window Control Buttons (Cosmetic for simulation) */}
      <div className="flex items-center">
        <button
          className="w-8 h-8 flex items-center justify-center text-[#71717a] hover:bg-[#27272a] hover:text-[#f4f4f5] transition-colors"
          title="Minimize Window"
        >
          <Minus className="w-3 h-3" />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center text-[#71717a] hover:bg-[#27272a] hover:text-[#f4f4f5] transition-colors"
          title="Maximize / Restore"
        >
          <Square className="w-2.5 h-2.5" />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center text-[#71717a] hover:bg-[#b91c1c] hover:text-white transition-colors"
          title="Close Window"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
