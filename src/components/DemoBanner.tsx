import React from 'react';
import { AlertCircle, CheckCircle2, ArrowRightCircle, Play } from 'lucide-react';

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
      <div className="bg-[#1c1917] border-b border-[#ca8a04]/40 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-[#fef08a]">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#eab308] shrink-0" />
          <span className="font-bold tracking-wide">
            DEMO MODE ACTIVE:
          </span>
          <span className="text-[#fef08a]/80 hidden sm:inline">
            Displaying simulated Windows 11 high-workload telemetry. Live hardware sensors are paused.
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 sm:mt-0">
          <button
            onClick={onReturnToLive}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#ca8a04] hover:bg-[#eab308] text-[#09090b] font-bold rounded transition-colors shadow-sm cursor-pointer"
          >
            <span>Switch to Live Hardware Sensors</span>
            <ArrowRightCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#121215] border-b border-[#27272a] px-4 py-1.5 flex flex-wrap items-center justify-between text-xs text-[#d4d4d8]">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
        <span className="font-semibold text-[#86efac]">LIVE SENSORS ACTIVE:</span>
        <span className="text-[#a1a1aa]">
          Sampling host CPU threads, memory allocation, storage quota, and network interface deltas.
        </span>
      </div>
      <div className="flex items-center gap-2 mt-1 sm:mt-0">
        <button
          onClick={onSwitchToDemo}
          className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#18181b] hover:bg-[#27272a] text-[#fde047] border border-[#713f12] font-medium transition-colors cursor-pointer"
        >
          <Play className="w-3 h-3 text-[#eab308]" />
          <span>Simulate Windows 11 Stress Demo</span>
        </button>
      </div>
    </div>
  );
};
