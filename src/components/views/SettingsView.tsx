import React, { useState } from 'react';
import { Settings, RotateCcw, CheckCircle2, ShieldCheck, Cpu, Database } from 'lucide-react';

interface SettingsViewProps {
  refreshInterval: number;
  cpuThreshold: number;
  ramThreshold: number;
  diskThreshold: number;
  retentionDays: number;
  sustainedDuration: number;
  cooldownSeconds: number;
  onChangeInterval: (val: number) => void;
  onChangeCpuThreshold: (val: number) => void;
  onChangeRamThreshold: (val: number) => void;
  onChangeDiskThreshold: (val: number) => void;
  onChangeRetentionDays: (val: number) => void;
  onChangeSustainedDuration: (val: number) => void;
  onChangeCooldown: (val: number) => void;
  onResetDefaults: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  refreshInterval,
  retentionDays,
  onChangeInterval,
  onChangeRetentionDays,
  onResetDefaults,
}) => {
  const [saveToast, setSaveToast] = useState(false);

  const handleReset = () => {
    onResetDefaults();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="bg-[#121215] border border-[#27272a] rounded p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#38bdf8]" />
            <h2 className="text-base font-bold text-[#fafafa]">
              System Configuration & Limits
            </h2>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1">
            Persisted locally in settings.json. Automatically validated with corruption recovery.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#18181b] hover:bg-[#27272a] text-[#f4f4f5] border border-[#27272a] text-xs font-medium transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#71717a]" />
          <span>Restore Safe Factory Defaults</span>
        </button>
      </div>

      {saveToast && (
        <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
          <span>Operational settings restored to factory defaults.</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Hardware Sampling Section */}
        <div className="bg-[#121215] border border-[#27272a] rounded p-4 space-y-3">
          <div className="flex items-center gap-2 font-bold text-[#fafafa] pb-2 border-b border-[#27272a]">
            <Cpu className="w-4 h-4 text-[#38bdf8]" />
            <span>Hardware Sampling Interval</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-[#a1a1aa]">Telemetry Polling Frequency</span>
              <span className="text-[#38bdf8] font-mono">{refreshInterval}s</span>
            </div>
            <select
              value={refreshInterval}
              onChange={(e) => onChangeInterval(parseFloat(e.target.value))}
              aria-label="Telemetry Polling Frequency"
              className="w-full bg-[#09090b] border border-[#27272a] text-[#f4f4f5] rounded p-2 outline-none cursor-pointer font-sans"
            >
              <option value="0.5">0.5 Seconds (High Frequency)</option>
              <option value="1.0">1.0 Second (Recommended Standard)</option>
              <option value="2.0">2.0 Seconds (Balanced Background)</option>
              <option value="5.0">5.0 Seconds (Low Power / Battery)</option>
            </select>
            <div className="text-[11px] text-[#71717a]">
              Configures timer resolution for hardware delta calculations.
            </div>
          </div>
        </div>

        {/* Database & Retention Section */}
        <div className="bg-[#121215] border border-[#27272a] rounded p-4 space-y-3">
          <div className="flex items-center gap-2 font-bold text-[#fafafa] pb-2 border-b border-[#27272a]">
            <Database className="w-4 h-4 text-[#a855f7]" />
            <span>SQLite Auto-Prune Retention</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-[#a1a1aa]">Retention Window</span>
              <span className="text-[#a855f7] font-mono">{retentionDays} Days</span>
            </div>
            <input
              type="range"
              min="1"
              max="90"
              value={retentionDays}
              onChange={(e) => onChangeRetentionDays(parseInt(e.target.value))}
              aria-label="Retention Window"
              className="w-full accent-[#a855f7] cursor-pointer"
            />
            <div className="text-[11px] text-[#71717a]">
              Limits local storage footprint. Samples older than {retentionDays} days are pruned.
            </div>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-[#121215] border border-[#27272a] rounded p-3.5 text-xs text-[#d4d4d8] flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-[#fafafa]">Settings Resilience & Integrity Assurance</div>
          <div className="text-[#a1a1aa] mt-0.5 leading-relaxed">
            All user settings are clamped to safe operational ranges. In the event of file corruption or sudden power
            outage, Windows X-Ray creates a backup and falls back to validated defaults without crashing.
          </div>
        </div>
      </div>
    </div>
  );
};
