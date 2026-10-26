import React, { useState } from 'react';
import { Settings, RotateCcw, CheckCircle2, ShieldCheck, Palette, Cpu, Database } from 'lucide-react';

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
  cpuThreshold,
  ramThreshold,
  diskThreshold,
  retentionDays,
  sustainedDuration,
  cooldownSeconds,
  onChangeInterval,
  onChangeCpuThreshold,
  onChangeRamThreshold,
  onChangeDiskThreshold,
  onChangeRetentionDays,
  onChangeSustainedDuration,
  onChangeCooldown,
  onResetDefaults,
}) => {
  const [saveToast, setSaveToast] = useState(false);

  const handleReset = () => {
    onResetDefaults();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-slate-100">
              Application Configuration & Operational Limits
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Persisted locally in settings.json. Automatically validated with corruption recovery.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Restore Safe Defaults</span>
        </button>
      </div>

      {saveToast && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Settings reset to certified default operational values.</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Hardware Sampling Section */}
        <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-200 pb-2 border-b border-[#1f293d]">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>Hardware Sampling Engine</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">Telemetry Refresh Rate</span>
              <span className="text-blue-400 font-mono">{refreshInterval}s</span>
            </div>
            <select
              value={refreshInterval}
              onChange={(e) => onChangeInterval(parseFloat(e.target.value))}
              aria-label="Telemetry Refresh Rate"
              className="w-full bg-[#0b1220] border border-[#1f293d] text-slate-200 rounded p-2 outline-none cursor-pointer"
            >
              <option value="0.5">0.5 Seconds (High Precision / Debugging)</option>
              <option value="1.0">1.0 Second (Recommended Standard)</option>
              <option value="2.0">2.0 Seconds (Balanced Background)</option>
              <option value="5.0">5.0 Seconds (Low Power / Battery Saver)</option>
            </select>
            <div className="text-[11px] text-slate-500">
              Controls the timer interval for hardware delta sampling and UI graphs.
            </div>
          </div>
        </div>

        {/* Database & Retention Section */}
        <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-200 pb-2 border-b border-[#1f293d]">
            <Database className="w-4 h-4 text-purple-400" />
            <span>Storage Retention Safeguards</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">Auto-Prune Retention Limit</span>
              <span className="text-purple-400 font-mono">{retentionDays} Days</span>
            </div>
            <input
              type="range"
              min="1"
              max="90"
              value={retentionDays}
              onChange={(e) => onChangeRetentionDays(parseInt(e.target.value))}
              aria-label="Auto-Prune Retention Limit"
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="text-[11px] text-slate-500">
              Restricts SQLite database growth. Prunes entries older than {retentionDays} days automatically.
            </div>
          </div>
        </div>
      </div>

      {/* Safety & Integrity Notice */}
      <div className="bg-[#0b1324] border border-[#1f293d] rounded-lg p-4 text-xs text-slate-300 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-blue-300">Settings Safety & Resilience Policy</div>
          <div className="text-slate-400 mt-1 leading-relaxed">
            All user settings are clamped to safe minimum and maximum operational bounds. If the local settings.json file
            is ever malformed, edited with invalid keys, or corrupted by a power loss, the application preserves a backup
            copy and safely resets in-memory variables to factory defaults without crashing or hanging.
          </div>
        </div>
      </div>
    </div>
  );
};
