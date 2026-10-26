import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Trash2,
  FileCode,
  CheckCircle2,
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
      <tr style="border-bottom: 1px solid #27272a;">
        <td style="padding: 10px; font-weight: bold; color: #f4f4f5;">
          <span style="display:inline-block; padding: 2px 6px; border-radius: 3px; font-size: 10px; background: ${
            d.severity === 'critical' ? '#ef4444' : d.severity === 'warning' ? '#eab308' : '#22c55e'
          }; color: #000; margin-right: 6px;">${d.severity.toUpperCase()}</span>
          ${d.title}
        </td>
        <td style="padding: 10px; color: #d4d4d8;">${d.evidence}</td>
        <td style="padding: 10px; color: #a1a1aa; font-size: 11px;">${d.threshold}</td>
        <td style="padding: 10px; color: #38bdf8;">${d.practicalStep}</td>
      </tr>
    `
      )
      .join('');

    const procRows = topProcesses
      .slice(0, 10)
      .map(
        (p) => `
      <tr style="border-bottom: 1px solid #27272a; font-family: monospace;">
        <td style="padding: 8px; color: #71717a;">${p.pid}</td>
        <td style="padding: 8px; font-weight: bold; color: #f4f4f5; font-family: sans-serif;">${p.name}</td>
        <td style="padding: 8px; color: #38bdf8;">${p.cpuPercent.toFixed(1)}%</td>
        <td style="padding: 8px; color: #d4d4d8;">${(p.memoryBytes / (1024 * 1024)).toFixed(0)} MB</td>
        <td style="padding: 8px; color: #22c55e;">${p.status}</td>
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
    body { background: #09090b; color: #f4f4f5; font-family: -apple-system, Segoe UI, Roboto, sans-serif; padding: 25px; margin: 0; line-height: 1.5; }
    .box { background: #121215; border: 1px solid #27272a; border-radius: 6px; padding: 16px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #18181b; padding: 10px; text-align: left; color: #a1a1aa; border-bottom: 1px solid #27272a; }
  </style>
</head>
<body>
  <div style="max-width: 900px; margin: 0 auto;">
    <h1 style="color: #38bdf8; margin-bottom: 4px;">WINDOWS X-RAY</h1>
    <div style="color: #a1a1aa; font-size: 13px; margin-bottom: 20px;">Real-Time System Monitoring & Diagnostic Audit Report</div>

    <div class="box">
      <strong>Host Information:</strong> ${snapshot.osName} (${snapshot.osVersion}) | <strong>CPU:</strong> ${snapshot.cpuModel} | <strong>Mode:</strong> ${snapshot.isDemo ? 'DEMO' : 'LIVE'}
    </div>

    <h3 style="color: #f4f4f5;">Diagnostic Findings</h3>
    <div class="box">
      <table>
        <thead>
          <tr><th>Observation</th><th>Telemetry Evidence</th><th>Threshold</th><th>Practical Step</th></tr>
        </thead>
        <tbody>${diagRows}</tbody>
      </table>
    </div>

    <h3 style="color: #f4f4f5;">Top Active Workloads</h3>
    <div class="box">
      <table>
        <thead><tr><th>PID</th><th>Task Name</th><th>CPU</th><th>RAM</th><th>Status</th></tr></thead>
        <tbody>${procRows}</tbody>
      </table>
    </div>

    <div style="font-size: 11px; color: #71717a; margin-top: 30px;">
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
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="bg-[#121215] border border-[#27272a] rounded p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#22c55e]" />
            <h2 className="text-base font-bold text-[#fafafa]">
              Metrics History & Audit Reports
            </h2>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1">
            Bounded local metric log storage with automated pruning and zero telemetry leakage.
          </p>
        </div>

        {/* Action Buttons: Export CSV & HTML */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#18181b] hover:bg-[#27272a] text-[#86efac] border border-[#27272a] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportHTML}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#18181b] hover:bg-[#27272a] text-[#38bdf8] border border-[#27272a] text-xs font-semibold transition-colors cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Export HTML Report</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Retention Controls & Storage Status */}
      <div className="bg-[#121215] border border-[#27272a] rounded p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded bg-[#18181b] border border-[#27272a] space-y-2">
          <div className="flex items-center justify-between font-semibold">
            <span className="text-[#a1a1aa]">Bounded Retention Window</span>
            <span className="text-[#38bdf8] font-mono">{retentionDays} Days</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            value={retentionDays}
            onChange={(e) => onChangeRetentionDays(parseInt(e.target.value))}
            aria-label="Retention Days"
            className="w-full accent-[#38bdf8] cursor-pointer"
          />
          <div className="text-[11px] text-[#71717a]">
            Records older than {retentionDays} days are pruned automatically from local storage.
          </div>
        </div>

        <div className="p-3 rounded bg-[#18181b] border border-[#27272a] flex flex-col justify-between">
          <div>
            <div className="font-semibold text-[#fafafa]">Local Telemetry Store</div>
            <div className="text-[11px] text-[#a1a1aa] mt-0.5">
              Currently holding <span className="font-bold text-[#fafafa] font-mono">{historyEntries.length}</span> metric samples in memory / SQLite.
            </div>
          </div>
          <div className="pt-2">
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 text-[#ef4444] hover:text-[#f87171] font-medium text-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Logged History...</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[#ef4444] font-medium text-xs">Confirm wipe?</span>
                <button
                  onClick={() => {
                    onClearHistory();
                    setShowClearConfirm(false);
                  }}
                  className="px-2 py-0.5 rounded bg-[#b91c1c] text-white font-bold text-[11px] cursor-pointer"
                >
                  Yes, Clear
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2 py-0.5 rounded bg-[#27272a] text-[#a1a1aa] text-[11px] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historical Telemetry Table */}
      <div className="bg-[#121215] border border-[#27272a] rounded overflow-hidden">
        <div className="p-2.5 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between text-xs">
          <span className="font-bold text-[#fafafa]">Recent Telemetry Samples</span>
          <span className="text-[#71717a] font-mono">{historyEntries.length} samples logged</span>
        </div>
        <div className="overflow-x-auto max-h-64">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead className="bg-[#09090b] text-[#71717a] sticky top-0">
              <tr>
                <th className="py-2 px-3">Time</th>
                <th className="py-2 px-3">CPU %</th>
                <th className="py-2 px-3">RAM %</th>
                <th className="py-2 px-3">Disk %</th>
                <th className="py-2 px-3">Down KB/s</th>
                <th className="py-2 px-3">Up KB/s</th>
                <th className="py-2 px-3">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {historyEntries.slice(0, 25).map((row) => (
                <tr key={row.id} className="hover:bg-[#18181b]">
                  <td className="py-1.5 px-3 text-[#71717a]">
                    {new Date(row.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-1.5 px-3 text-[#38bdf8] font-semibold">{row.cpuPercent.toFixed(1)}%</td>
                  <td className="py-1.5 px-3 text-[#22c55e] font-semibold">{row.memoryPercent.toFixed(1)}%</td>
                  <td className="py-1.5 px-3 text-[#a855f7]">{row.diskPercent.toFixed(1)}%</td>
                  <td className="py-1.5 px-3 text-[#f4f4f5]">{row.netDownKbps.toFixed(1)}</td>
                  <td className="py-1.5 px-3 text-[#a1a1aa]">{row.netUpKbps.toFixed(1)}</td>
                  <td className="py-1.5 px-3 font-sans text-[11px]">
                    <span
                      className={`px-1 py-0.2 rounded font-semibold ${
                        row.isDemo
                          ? 'bg-[#ca8a04]/20 text-[#fde047]'
                          : 'bg-[#15803d]/20 text-[#86efac]'
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
