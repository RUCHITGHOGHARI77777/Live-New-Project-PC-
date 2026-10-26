import React from 'react';
import { Bell, AlertTriangle, CheckCircle2, Trash2, Sliders, Volume2, VolumeX } from 'lucide-react';

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
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-slate-100">
              Active Alerts & Threshold Management
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure sustained threshold filters to prevent transient noise and notification spam.
          </p>
        </div>

        {alerts.length > 0 && (
          <button
            onClick={onClearAllAlerts}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Dismiss All Active</span>
          </button>
        )}
      </div>

      {/* Threshold & Sustained Duration Tuning Cards */}
      <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-200 uppercase tracking-wide">
          <Sliders className="w-4 h-4 text-blue-400" />
          <span>Configurable Alert Trigger Policies</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* CPU Threshold */}
          <div className="p-3 rounded bg-[#0b1220] border border-[#1a253a] space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">CPU Load Alert</span>
              <span className="text-blue-400 font-mono">{cpuThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="98"
              value={cpuThreshold}
              onChange={(e) => onChangeCpuThreshold(parseInt(e.target.value))}
              aria-label="CPU Threshold"
              className="w-full accent-blue-500 cursor-pointer"
            />
            <div className="text-[11px] text-slate-500">Triggers when total CPU &ge; {cpuThreshold}%</div>
          </div>

          {/* RAM Threshold */}
          <div className="p-3 rounded bg-[#0b1220] border border-[#1a253a] space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">RAM Pressure Alert</span>
              <span className="text-emerald-400 font-mono">{ramThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="98"
              value={ramThreshold}
              onChange={(e) => onChangeRamThreshold(parseInt(e.target.value))}
              aria-label="RAM Threshold"
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="text-[11px] text-slate-500">Triggers when used RAM &ge; {ramThreshold}%</div>
          </div>

          {/* Disk Threshold */}
          <div className="p-3 rounded bg-[#0b1220] border border-[#1a253a] space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">Disk Capacity Alert</span>
              <span className="text-purple-400 font-mono">{diskThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="98"
              value={diskThreshold}
              onChange={(e) => onChangeDiskThreshold(parseInt(e.target.value))}
              aria-label="Disk Capacity Threshold"
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="text-[11px] text-slate-500">Triggers when volume used &ge; {diskThreshold}%</div>
          </div>
        </div>

        {/* Sustained Duration & Anti-Spam Cooldown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#1a253a] text-xs">
          <div className="p-3 rounded bg-[#0b1220] border border-[#1a253a] space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">Sustained Requirement (Anti-Spike)</span>
              <span className="text-amber-400 font-mono">{sustainedDuration}s</span>
            </div>
            <input
              type="range"
              min="2"
              max="30"
              value={sustainedDuration}
              onChange={(e) => onChangeSustainedDuration(parseInt(e.target.value))}
              aria-label="Sustained Requirement Duration"
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="text-[11px] text-slate-500">Condition must remain high for {sustainedDuration}s continuously</div>
          </div>

          <div className="p-3 rounded bg-[#0b1220] border border-[#1a253a] space-y-2">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-300">Notification Cooldown Window</span>
              <span className="text-cyan-400 font-mono">{cooldownSeconds}s</span>
            </div>
            <input
              type="range"
              min="15"
              max="300"
              step="15"
              value={cooldownSeconds}
              onChange={(e) => onChangeCooldown(parseInt(e.target.value))}
              aria-label="Notification Cooldown Window"
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="text-[11px] text-slate-500">Suppresses repeated notifications for {cooldownSeconds}s</div>
          </div>
        </div>
      </div>

      {/* Active Alerts List */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wide">
          Active Alert Incidents ({alerts.length})
        </div>

        {alerts.length === 0 ? (
          <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-8 text-center text-xs text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="font-semibold text-slate-200 text-sm">No Active Alert Incidents</div>
            <p className="text-slate-400 max-w-md mx-auto">
              Hardware readings are operating within normal operational envelopes. If a metric breaches your configured threshold for more than {sustainedDuration} seconds, an alert will be logged here.
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3.5 rounded-lg border flex items-center justify-between gap-3 text-xs ${
                alert.severity === 'critical'
                  ? 'bg-rose-950/30 border-rose-500/40'
                  : 'bg-amber-950/30 border-amber-500/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle
                  className={`w-5 h-5 shrink-0 ${
                    alert.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'
                  }`}
                />
                <div>
                  <div className="font-bold text-slate-100 flex items-center gap-2">
                    <span>{alert.metricName}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-900/60 border border-slate-700 text-slate-300">
                      {alert.severity}
                    </span>
                  </div>
                  <div className="text-slate-300 mt-0.5">{alert.message}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    Logged at {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onDismissAlert(alert.id)}
                className="px-2.5 py-1 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium transition-colors"
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
