import React from 'react';
import { AlertCircle, CheckCircle2, ArrowRightCircle, Sparkles } from 'lucide-react';

interface DemoBannerProps {
  isDemo: boolean;
  onReturnToLive: () => void;
  onSwitchToDemo: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({
  isDemo,
  onReturnToLive,
  onSwitchToDemo,
}) => {
  if (isDemo) {
    return (
      <div className="bg-amber-950/60 border-b border-amber-500/40 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-bold tracking-wide">
            DEMO MODE ACTIVE — SIMULATED READINGS ONLY:
          </span>
          <span className="text-amber-300/90 hidden sm:inline">
            You are viewing a synthetic Windows 11 high-load scenario. Live hardware metrics are paused.
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 sm:mt-0">
          <button
            onClick={onReturnToLive}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded transition-colors shadow-sm"
          >
            <span>Return to Live Hardware Data</span>
            <ArrowRightCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0b1325] border-b border-blue-900/30 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs text-slate-300">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="font-semibold text-emerald-300">LIVE SENSORS ACTIVE:</span>
        <span className="text-slate-400">
          Reading real host CPU cores, memory limits, storage quota, and network interface status.
        </span>
      </div>
      <div className="flex items-center gap-2 mt-1 sm:mt-0">
        <button
          onClick={onSwitchToDemo}
          className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium transition-colors"
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Switch to Simulated Windows 11 Stress Demo</span>
        </button>
      </div>
    </div>
  );
};
