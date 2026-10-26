import React from 'react';
import { Activity, Minus, Square, X, Download } from 'lucide-react';

interface TitleBarProps {
  isDemo: boolean;
  onToggleDemo: () => void;
  onDownloadZip: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({ isDemo, onToggleDemo, onDownloadZip }) => {
  return (
    <header className="h-10 bg-[#070b14] border-b border-[#1f293d] flex items-center justify-between px-3 select-none text-xs">
      {/* Left: App Icon & Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
          <Activity className="w-3.5 h-3.5" />
        </div>
        <span className="font-bold tracking-wider text-slate-100 uppercase">
          WINDOWS X-RAY
        </span>
        <span className="text-slate-500 font-medium">|</span>
        <span className="text-slate-400 hidden sm:inline">
          Real-Time System Monitoring & Diagnostic Tool v1.0.0
        </span>
      </div>

      {/* Middle: Live/Demo Mode Switcher & Download */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleDemo}
          className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
            isDemo
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
              : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
          }`}
          title="Click to toggle between Live Host Telemetry and Simulated Windows 10/11 Desktop Data"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isDemo ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
            }`}
          />
          {isDemo ? 'DEMO MODE (Simulated)' : 'LIVE TELEMETRY (Hardware)'}
        </button>

        <button
          onClick={onDownloadZip}
          className="hidden md:flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 transition-colors"
          title="Download the full GitHub-ready Windows Desktop package (main.py, .bat launcher, tests, requirements)"
        >
          <Download className="w-3 h-3" />
          <span>Download Windows Source (.zip)</span>
        </button>
      </div>

      {/* Right: Windows Native Window Control Buttons (Cosmetic for simulation) */}
      <div className="flex items-center">
        <button
          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          title="Minimize Window"
        >
          <Minus className="w-3 h-3" />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          title="Maximize / Restore"
        >
          <Square className="w-2.5 h-2.5" />
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-rose-600 hover:text-white transition-colors"
          title="Close Window"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
