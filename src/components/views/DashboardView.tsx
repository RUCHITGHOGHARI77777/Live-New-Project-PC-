import React from 'react';
import {
  Cpu,
  CircuitBoard,
  HardDrive,
  Activity,
  Clock,
  Server,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';
import {
  TelemetrySnapshot,
  ProcessItem,
  formatBytesBinary,
  formatBytesDecimal,
  formatUptime,
} from '../../logic/metrics';
import { DiagnosticItem } from '../../logic/diagnostics';

interface DashboardViewProps {
  snapshot: TelemetrySnapshot;
  processes: ProcessItem[];
  diagnostics: DiagnosticItem[];
  historyCpu: number[];
  historyRam: number[];
  onNavigateTab: (tabId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  snapshot,
  processes,
  diagnostics,
  historyCpu,
  historyRam,
  onNavigateTab,
}) => {
  const topProcesses = processes.slice(0, 4);
  const primaryDisk = snapshot.disks[0];

  return (
    <div className="space-y-5 pb-6">
      {/* Top Banner / Machine Specs Bar */}
      <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm">{snapshot.osName}</span>
              <span className="text-[11px] text-slate-400">({snapshot.osVersion})</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/20">
                v1.0.0
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Processor: <span className="text-slate-200 font-medium">{snapshot.cpuModel}</span> • {snapshot.physicalCores} Physical / {snapshot.logicalCores} Logical Threads
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <div>
              <div className="text-[10px] uppercase text-slate-400">System Uptime</div>
              <div className="font-semibold text-slate-200">{formatUptime(snapshot.uptimeSeconds)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] uppercase text-slate-400">Security / Read-Only</div>
              <div className="font-semibold text-emerald-400">No Elevation Req.</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Card */}
        <div
          onClick={() => onNavigateTab('cpu')}
          className="bg-[#10172a] border border-[#1f293d] hover:border-blue-500/40 rounded-lg p-4 cursor-pointer transition-all hover:bg-[#131c33]"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Processor Load</span>
            <Cpu className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-100">
              {snapshot.cpuOverallPercent.toFixed(1)}%
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {snapshot.logicalCores} Cores Active
            </span>
          </div>
          <div className="mt-3 bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                snapshot.cpuOverallPercent >= 90
                  ? 'bg-rose-500'
                  : snapshot.cpuOverallPercent >= 75
                  ? 'bg-amber-400'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, snapshot.cpuOverallPercent)}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
            <span>Mini History</span>
            <span className="text-blue-400">View CPU &rarr;</span>
          </div>
        </div>

        {/* RAM Card */}
        <div
          onClick={() => onNavigateTab('memory')}
          className="bg-[#10172a] border border-[#1f293d] hover:border-blue-500/40 rounded-lg p-4 cursor-pointer transition-all hover:bg-[#131c33]"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">RAM Allocation</span>
            <CircuitBoard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-100">
              {snapshot.memoryPercent.toFixed(1)}%
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {formatBytesBinary(snapshot.memoryUsedBytes, 1)} / {formatBytesBinary(snapshot.memoryTotalBytes, 1)}
            </span>
          </div>
          <div className="mt-3 bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                snapshot.memoryPercent >= 90
                  ? 'bg-rose-500'
                  : snapshot.memoryPercent >= 80
                  ? 'bg-amber-400'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, snapshot.memoryPercent)}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
            <span>Available: {formatBytesBinary(snapshot.memoryAvailableBytes, 1)}</span>
            <span className="text-emerald-400">View Memory &rarr;</span>
          </div>
        </div>

        {/* Disk Card */}
        <div
          onClick={() => onNavigateTab('disk')}
          className="bg-[#10172a] border border-[#1f293d] hover:border-blue-500/40 rounded-lg p-4 cursor-pointer transition-all hover:bg-[#131c33]"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Drive {primaryDisk ? primaryDisk.mount : 'C:'}</span>
            <HardDrive className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-100">
              {primaryDisk ? primaryDisk.percent.toFixed(1) : '0.0'}%
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {primaryDisk ? formatBytesDecimal(primaryDisk.freeBytes, 0) : '0 GB'} Free
            </span>
          </div>
          <div className="mt-3 bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                primaryDisk && primaryDisk.percent >= 90
                  ? 'bg-rose-500'
                  : primaryDisk && primaryDisk.percent >= 80
                  ? 'bg-amber-400'
                  : 'bg-purple-500'
              }`}
              style={{ width: `${primaryDisk ? primaryDisk.percent : 0}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
            <span>I/O: {(snapshot.diskReadKbps / 1024).toFixed(1)} MB/s</span>
            <span className="text-purple-400">View Disks &rarr;</span>
          </div>
        </div>

        {/* Network Card */}
        <div
          onClick={() => onNavigateTab('network')}
          className="bg-[#10172a] border border-[#1f293d] hover:border-blue-500/40 rounded-lg p-4 cursor-pointer transition-all hover:bg-[#131c33]"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Network Throughput</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-cyan-400 text-sm font-bold font-mono">
              <ArrowDown className="w-3.5 h-3.5" />
              <span>{snapshot.netDownloadKbps.toFixed(1)} KB/s</span>
            </div>
            <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-medium font-mono">
              <ArrowUp className="w-3 h-3" />
              <span>{snapshot.netUploadKbps.toFixed(1)} KB/s</span>
            </div>
          </div>
          <div className="mt-3 bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all duration-300"
              style={{ width: `${Math.min(100, (snapshot.netDownloadKbps / 5000) * 100)}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
            <span>Traffic Delta</span>
            <span className="text-cyan-400">View Network &rarr;</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Diagnostic Health + Top Processes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Diagnostic Snapshot Box */}
        <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1f293d]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-bold text-slate-100">Live Diagnostic Observations</span>
            </div>
            <button
              onClick={() => onNavigateTab('diagnostics')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              Full Audit &rarr;
            </button>
          </div>
          <div className="mt-3 space-y-2.5">
            {diagnostics.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded bg-[#0b1220] border border-[#1c263c] flex items-start gap-2.5 text-xs"
              >
                <div className="mt-0.5">
                  {item.severity === 'critical' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  ) : item.severity === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-200">{item.title}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">{item.evidence}</div>
                  <div className="text-blue-400 text-[11px] mt-1 font-medium">
                    Next step: {item.practicalStep}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Active Processes Box */}
        <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1f293d]">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-slate-100">Active Tasks Snapshot</span>
            </div>
            <button
              onClick={() => onNavigateTab('processes')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              Process Manager &rarr;
            </button>
          </div>
          <div className="mt-3 divide-y divide-[#1f293d]">
            {topProcesses.map((p) => (
              <div key={p.pid} className="py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-slate-500 w-12">{p.pid}</span>
                  <span className="font-medium text-slate-200">{p.name}</span>
                </div>
                <div className="flex items-center gap-4 font-mono text-[11px]">
                  <span className="text-blue-400 font-semibold">{p.cpuPercent.toFixed(1)}% CPU</span>
                  <span className="text-slate-400">
                    {(p.memoryBytes / (1024 * 1024)).toFixed(0)} MB
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
