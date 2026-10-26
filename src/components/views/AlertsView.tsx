import React from 'react';
import { Bell, AlertTriangle, CheckCircle2, Trash2, Sliders } from 'lucide-react';

export interface ActiveAlert {
  id: string;
  metricName: string;
  currentValue: number;
  thresholdValue: number;
  severity: 'warning' | 'critical';
  message: string;
  timestamp: number;
}

interface AlertsViewProps {
  alerts: ActiveAlert[];
  cpuThreshold: number;
  ramThreshold: number;
  diskThreshold: number;
  sustainedDuration: number;
  cooldownSeconds: number;
  onDismissAlert: (id: string) => void;
  onClearAllAlerts: () => void;
  onChangeCpuThreshold: (val: number) => void;
  onChangeRamThreshold: (val: number) => void;
  onChangeDiskThreshold: (val: number) => void;
  onChangeSustainedDuration: (val: number) => void;
  onChangeCooldown: (val: number) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  cpuThreshold,
  ramThreshold,
  diskThreshold,
  sustainedDuration,
  cooldownSeconds,
  onDismissAlert,
  onClearAllAlerts,
  onChangeCpuThreshold,
  onChangeRamThreshold,
  onChangeDiskThreshold,
  onChangeSustainedDuration,
  onChangeCooldown,
}) => {
  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="bg-[#121215] border border-[#27272a] rounded p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#eab308]" />
            <h2 className="text-base font-bold text-[#fafafa]">
              Alert Policies & Anti-Spam Cooldown
            </h2>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1">
            Configure sustained threshold filters to eliminate false-alarm spikes and notification noise.
          </p>
        </div>

        {alerts.length > 0 && (
          <button
            onClick={onClearAllAlerts}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#18181b] hover:bg-[#27272a] text-[#f4f4f5] border border-[#27272a] text-xs font-medium transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#a1a1aa]" />
            <span>Dismiss All Incidents</span>
          </button>
        )}
      </div>

      {/* Threshold & Sustained Duration Tuning Cards */}
      <div className="bg-[#121215] border border-[#27272a] rounded p-4">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-[#fafafa] uppercase tracking-wide">
          <Sliders className="w-4 h-4 text-[#38bdf8]" />
          <span>Configurable Threshold Controls</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* CPU Threshold */}
          <div className="p-3 rounded bg-[#18181b] border border-[#27272a] space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-[#a1a1aa]">CPU Load Trigger</span>
              <span className="text-[#38bdf8] font-mono">{cpuThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="98"
              value={cpuThreshold}
              onChange={(e) => onChangeCpuThreshold(parseInt(e.target.value))}
              aria-label="CPU Threshold"
              className="w-full accent-[#38bdf8] cursor-pointer"
            />
            <div className="text-[11px] text-[#71717a]">Triggers when total CPU &ge; {cpuThreshold}%</div>
          </div>

          {/* RAM Threshold */}
          <div className="p-3 rounded bg-[#18181b] border border-[#27272a] space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-[#a1a1aa]">RAM Pressure Trigger</span>
              <span className="text-[#10b981] font-mono">{ramThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="98"
              value={ramThreshold}
              onChange={(e) => onChangeRamThreshold(parseInt(e.target.value))}
              aria-label="RAM Threshold"
              className="w-full accent-[#10b981] cursor-pointer"
            />
            <div className="text-[11px] text-[#71717a]">Triggers when used RAM &ge; {ramThreshold}%</div>
          </div>

          {/* Disk Threshold */}
          <div className="p-3 rounded bg-[#18181b] border border-[#27272a] space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-[#a1a1aa]">Disk Capacity Trigger</span>
              <span className="text-[#a855f7] font-mono">{diskThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="98"
              value={diskThreshold}
              onChange={(e) => onChangeDiskThreshold(parseInt(e.target.value))}
              aria-label="Disk Capacity Threshold"
              className="w-full accent-[#a855f7] cursor-pointer"
            />
            <div className="text-[11px] text-[#71717a]">Triggers when volume used &ge; {diskThreshold}%</div>
          </div>
        </div>

        {/* Sustained Duration & Anti-Spam Cooldown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#27272a] text-xs">
          <div className="p-3 rounded bg-[#18181b] border border-[#27272a] space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-[#a1a1aa]">Sustained Duration (Anti-Spike)</span>
              <span className="text-[#eab308] font-mono">{sustainedDuration}s</span>
            </div>
            <input
              type="range"
              min="2"
              max="30"
              value={sustainedDuration}
              onChange={(e) => onChangeSustainedDuration(parseInt(e.target.value))}
              aria-label="Sustained Requirement Duration"
              className="w-full accent-[#eab308] cursor-pointer"
            />
            <div className="text-[11px] text-[#71717a]">Condition must remain high for {sustainedDuration}s continuously</div>
          </div>

          <div className="p-3 rounded bg-[#18181b] border border-[#27272a] space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-[#a1a1aa]">Anti-Spam Cooldown Window</span>
              <span className="text-[#38bdf8] font-mono">{cooldownSeconds}s</span>
            </div>
            <input
              type="range"
              min="15"
              max="300"
              step="15"
              value={cooldownSeconds}
              onChange={(e) => onChangeCooldown(parseInt(e.target.value))}
              aria-label="Notification Cooldown Window"
              className="w-full accent-[#38bdf8] cursor-pointer"
            />
            <div className="text-[11px] text-[#71717a]">Suppresses repeated alerts for {cooldownSeconds}s</div>
          </div>
        </div>
      </div>

      {/* Active Alerts List */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold text-[#fafafa] uppercase tracking-wide">
          Active Alert Incidents ({alerts.length})
        </div>

        {alerts.length === 0 ? (
          <div className="bg-[#121215] border border-[#27272a] rounded p-6 text-center text-xs text-[#a1a1aa] space-y-1.5">
            <CheckCircle2 className="w-6 h-6 text-[#22c55e] mx-auto" />
            <div className="font-semibold text-[#fafafa]">No Active Alert Conditions</div>
            <p className="text-[#71717a] max-w-sm mx-auto">
              All monitored metrics are operating below configured alert thresholds.
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded border flex items-center justify-between gap-3 text-xs ${
                alert.severity === 'critical'
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : 'bg-amber-950/20 border-amber-500/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle
                  className={`w-4 h-4 shrink-0 ${
                    alert.severity === 'critical' ? 'text-[#ef4444]' : 'text-[#eab308]'
                  }`}
                />
                <div>
                  <div className="font-bold text-[#fafafa] flex items-center gap-2">
                    <span>{alert.metricName}</span>
                    <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-[#18181b] border border-[#27272a] text-[#a1a1aa]">
                      {alert.severity}
                    </span>
                  </div>
                  <div className="text-[#d4d4d8] mt-0.5">{alert.message}</div>
                  <div className="text-[10px] text-[#71717a] mt-0.5 font-mono">
                    Logged at {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onDismissAlert(alert.id)}
                className="px-2.5 py-1 rounded bg-[#18181b] hover:bg-[#27272a] text-[#f4f4f5] border border-[#27272a] font-medium transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
