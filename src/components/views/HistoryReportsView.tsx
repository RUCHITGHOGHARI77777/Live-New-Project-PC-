import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Trash2,
  Calendar,
  FileCode,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { TelemetrySnapshot, ProcessItem } from '../../logic/metrics';
import { DiagnosticItem } from '../../logic/diagnostics';

export interface HistoryMetricEntry {
  id: string;
  timestamp: number;
  cpuPercent: number;
  memoryPercent: number;
  diskPercent: number;
  netDownKbps: number;
  netUpKbps: number;
  isDemo: boolean;
}

interface HistoryReportsViewProps {
  snapshot: TelemetrySnapshot;
  historyEntries: HistoryMetricEntry[];
  diagnostics: DiagnosticItem[];
  topProcesses: ProcessItem[];
  retentionDays: number;
  onChangeRetentionDays: (days: number) => void;
  onClearHistory: () => void;
}

export const HistoryReportsView: React.FC<HistoryReportsViewProps> = ({
  snapshot,
  historyEntries,
  diagnostics,
  topProcesses,
  retentionDays,
  onChangeRetentionDays,
  onClearHistory,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Trigger real CSV Download
  const handleExportCSV = () => {
    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
    const headerLines = [
      `# WINDOWS X-RAY v1.0.0 Performance & Diagnostics Metric Export`,
      `# Export Timestamp: ${new Date().toISOString()}`,
      `# Host Machine OS: ${snapshot.osName} (${snapshot.osVersion})`,
      `# Hardware CPU: ${snapshot.cpuModel} (${snapshot.logicalCores} Threads)`,
      `# Mode: ${snapshot.isDemo ? 'DEMO_SIMULATED' : 'LIVE_HARDWARE'}`,
      `# Units: Percent (%), Kilobytes per second (KB/s)`,
      ``,
      `Timestamp_ISO,CPU_Load_Percent,Memory_Used_Percent,Disk_Max_Percent,Network_Download_KBps,Network_Upload_KBps,Mode_Is_Demo`,
    ];

    const rows = historyEntries.map((e) =>
      [
        new Date(e.timestamp).toISOString(),
        e.cpuPercent.toFixed(1),
        e.memoryPercent.toFixed(1),
        e.diskPercent.toFixed(1),
        e.netDownKbps.toFixed(1),
        e.netUpKbps.toFixed(1),
        e.isDemo ? '1' : '0',
      ].join(',')
    );

    const csvContent = [...headerLines, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WindowsXRay_Metrics_${timestampStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotice(`Exported CSV with ${historyEntries.length} telemetry records.`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  // Trigger real Standalone HTML Diagnostic Audit Report Download
  const handleExportHTML = () => {
    const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
    const diagRows = diagnostics
      .map(
        (d) => `
      <tr style="border-bottom: 1px solid #1f293d;">
        <td style="padding: 10px; font-weight: bold; color: #f1f5f9;">
          <span style="display:inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; background: ${
            d.severity === 'critical' ? '#ef4444' : d.severity === 'warning' ? '#f59e0b' : '#10b981'
          }; color: #000; margin-right: 6px;">${d.severity.toUpperCase()}</span>
          ${d.title}
        </td>
        <td style="padding: 10px; color: #cbd5e1;">${d.evidence}</td>
        <td style="padding: 10px; color: #94a3b8; font-size: 11px;">${d.threshold}</td>
        <td style="padding: 10px; color: #60a5fa;">${d.practicalStep}</td>
      </tr>
    `
      )
      .join('');

    const procRows = topProcesses
      .slice(0, 10)
      .map(
        (p) => `
      <tr style="border-bottom: 1px solid #1f293d; font-family: monospace;">
        <td style="padding: 8px; color: #94a3b8;">${p.pid}</td>
        <td style="padding: 8px; font-weight: bold; color: #f1f5f9; font-family: sans-serif;">${p.name}</td>
        <td style="padding: 8px; color: #60a5fa;">${p.cpuPercent.toFixed(1)}%</td>
        <td style="padding: 8px; color: #cbd5e1;">${(p.memoryBytes / (1024 * 1024)).toFixed(0)} MB</td>
        <td style="padding: 8px; color: #10b981;">${p.status}</td>
      </tr>
    `
      )
      .join('');

    const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Windows X-Ray Diagnostic Report</title>
  <style>
    body { background: #0a0f1d; color: #f1f5f9; font-family: -apple-system, Segoe UI, Roboto, sans-serif; padding: 25px; margin: 0; line-height: 1.5; }
    .box { background: #111827; border: 1px solid #1f293d; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #162032; padding: 10px; text-align: left; color: #94a3b8; border-bottom: 1px solid #1f293d; }
  </style>
</head>
<body>
  <div style="max-width: 900px; margin: 0 auto;">
    <h1 style="color: #3b82f6; margin-bottom: 4px;">WINDOWS X-RAY</h1>
    <div style="color: #94a3b8; font-size: 13px; margin-bottom: 20px;">Real-Time System Monitoring & Diagnostic Audit Report</div>

    <div class="box">
      <strong>Host Information:</strong> ${snapshot.osName} (${snapshot.osVersion}) | <strong>CPU:</strong> ${snapshot.cpuModel} | <strong>Mode:</strong> ${snapshot.isDemo ? 'DEMO' : 'LIVE'}
    </div>

    <h3 style="color: #cbd5e1;">Diagnostic Findings</h3>
    <div class="box">
      <table>
        <thead>
          <tr><th>Observation</th><th>Telemetry Evidence</th><th>Threshold</th><th>Practical Step</th></tr>
        </thead>
        <tbody>${diagRows}</tbody>
      </table>
    </div>

    <h3 style="color: #cbd5e1;">Top Active Workloads</h3>
    <div class="box">
      <table>
        <thead><tr><th>PID</th><th>Task Name</th><th>CPU</th><th>RAM</th><th>Status</th></tr></thead>
        <tbody>${procRows}</tbody>
      </table>
    </div>

    <div style="font-size: 11px; color: #64748b; margin-top: 30px;">
      Privacy Pledge: No passwords, private documents, or sensitive data are included. Findings are advisory rule evaluations.
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WindowsXRay_DiagnosticReport_${timestampStr}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotice('Generated self-contained HTML Diagnostic Report.');
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">
              Metrics History & Audit Reports Export
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Bounded local metric log storage with automated pruning and zero telemetry leakage.
          </p>
        </div>

        {/* Action Buttons: Export CSV & HTML */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportHTML}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Export HTML Report</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Retention Controls & Storage Status */}
      <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-3 rounded bg-[#0b1220] border border-[#1a253a] space-y-2">
          <div className="flex items-center justify-between font-semibold">
            <span className="text-slate-300">Bounded Retention Window</span>
            <span className="text-blue-400 font-mono">{retentionDays} Days</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            value={retentionDays}
            onChange={(e) => onChangeRetentionDays(parseInt(e.target.value))}
            aria-label="Retention Days"
            className="w-full accent-blue-500 cursor-pointer"
          />
          <div className="text-[11px] text-slate-500">
            Records older than {retentionDays} days are pruned automatically from local SQLite storage.
          </div>
        </div>

        <div className="p-3 rounded bg-[#0b1220] border border-[#1a253a] flex flex-col justify-between">
          <div>
            <div className="font-semibold text-slate-300">Local Telemetry Store</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Currently holding <span className="font-bold text-slate-200">{historyEntries.length}</span> metric samples in local storage.
            </div>
          </div>
          <div className="pt-2">
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-medium text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Logged History...</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-rose-300 font-medium text-xs">Confirm wipe?</span>
                <button
                  onClick={() => {
                    onClearHistory();
                    setShowClearConfirm(false);
                  }}
                  className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[11px]"
                >
                  Yes, Clear
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historical Telemetry Table */}
      <div className="bg-[#10172a] border border-[#1f293d] rounded-lg overflow-hidden">
        <div className="p-3 bg-[#141e36] border-b border-[#1f293d] flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200">Recent Telemetry Samples</span>
          <span className="text-slate-400 font-mono">Total {historyEntries.length} samples</span>
        </div>
        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead className="bg-[#0b1220] text-slate-400 sticky top-0">
              <tr>
                <th className="py-2.5 px-4">Time</th>
                <th className="py-2.5 px-4">CPU %</th>
                <th className="py-2.5 px-4">RAM %</th>
                <th className="py-2.5 px-4">Disk %</th>
                <th className="py-2.5 px-4">Down KB/s</th>
                <th className="py-2.5 px-4">Up KB/s</th>
                <th className="py-2.5 px-4">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f293d]">
              {historyEntries.slice(0, 30).map((row) => (
                <tr key={row.id} className="hover:bg-[#15203b]">
                  <td className="py-2 px-4 text-slate-400">
                    {new Date(row.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2 px-4 text-blue-400 font-semibold">{row.cpuPercent.toFixed(1)}%</td>
                  <td className="py-2 px-4 text-emerald-400 font-semibold">{row.memoryPercent.toFixed(1)}%</td>
                  <td className="py-2 px-4 text-purple-400">{row.diskPercent.toFixed(1)}%</td>
                  <td className="py-2 px-4 text-cyan-400">{row.netDownKbps.toFixed(1)}</td>
                  <td className="py-2 px-4 text-indigo-300">{row.netUpKbps.toFixed(1)}</td>
                  <td className="py-2 px-4 font-sans text-[11px]">
                    <span
                      className={`px-1.5 py-0.2 rounded font-semibold ${
                        row.isDemo
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-emerald-500/15 text-emerald-400'
                      }`}
                    >
                      {row.isDemo ? 'DEMO' : 'LIVE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
