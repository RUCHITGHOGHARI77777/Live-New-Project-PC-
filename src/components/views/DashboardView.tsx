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
  onNavigateTab,
}) => {
  const topProcesses = processes.slice(0, 4);
  const primaryDisk = snapshot.disks[0];

  return (
    <div className="space-y-4 pb-6">
      {/* Top Machine Specs Bar */}
      <div className="bg-[#121215] border border-[#27272a] rounded p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-[#18181b] border border-[#27272a] text-[#a1a1aa]">
            <Server className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#fafafa] text-sm">{snapshot.osName}</span>
              <span className="text-[11px] text-[#71717a]">({snapshot.osVersion})</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#18181b] text-[#a1a1aa] border border-[#27272a]">
                v1.0.0
              </span>
            </div>
            <div className="text-xs text-[#a1a1aa] mt-0.5">
              Processor: <span className="text-[#f4f4f5] font-medium">{snapshot.cpuModel}</span> • {snapshot.physicalCores} Physical / {snapshot.logicalCores} Logical Threads
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-[#a1a1aa]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#71717a]" />
            <div>
              <div className="text-[10px] uppercase text-[#71717a]">System Uptime</div>
              <div className="font-semibold font-mono text-[#f4f4f5]">{formatUptime(snapshot.uptimeSeconds)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#22c55e]" />
            <div>
              <div className="text-[10px] uppercase text-[#71717a]">Security Mode</div>
              <div className="font-semibold text-[#86efac]">Non-Elevated Read-Only</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* CPU Card */}
        <div
          onClick={() => onNavigateTab('cpu')}
          className="bg-[#121215] border border-[#27272a] hover:border-[#3f3f46] rounded p-3.5 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-[#a1a1aa]">
            <span className="font-medium">Processor Load</span>
            <Cpu className="w-3.5 h-3.5 text-[#a1a1aa]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-[#fafafa]">
              {snapshot.cpuOverallPercent.toFixed(1)}%
            </div>
            <span className="text-[11px] text-[#71717a] font-mono">
              {snapshot.logicalCores} Threads
            </span>
          </div>
          <div className="mt-2.5 bg-[#18181b] h-1.5 rounded-xs overflow-hidden border border-[#27272a]">
            <div
              className={`h-full transition-all duration-300 ${
                snapshot.cpuOverallPercent >= 90
                  ? 'bg-[#ef4444]'
                  : snapshot.cpuOverallPercent >= 75
                  ? 'bg-[#eab308]'
                  : 'bg-[#38bdf8]'
              }`}
              style={{ width: `${Math.min(100, snapshot.cpuOverallPercent)}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-[#71717a] flex justify-between">
            <span>Utilization Meter</span>
            <span className="text-[#a1a1aa] hover:text-[#fafafa]">View CPU &rarr;</span>
          </div>
        </div>

        {/* RAM Card */}
        <div
          onClick={() => onNavigateTab('memory')}
          className="bg-[#121215] border border-[#27272a] hover:border-[#3f3f46] rounded p-3.5 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-[#a1a1aa]">
            <span className="font-medium">Physical Memory</span>
            <CircuitBoard className="w-3.5 h-3.5 text-[#a1a1aa]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-[#fafafa]">
              {snapshot.memoryPercent.toFixed(1)}%
            </div>
            <span className="text-[11px] text-[#71717a] font-mono">
              {formatBytesBinary(snapshot.memoryUsedBytes, 1)} / {formatBytesBinary(snapshot.memoryTotalBytes, 1)}
            </span>
          </div>
          <div className="mt-2.5 bg-[#18181b] h-1.5 rounded-xs overflow-hidden border border-[#27272a]">
            <div
              className={`h-full transition-all duration-300 ${
                snapshot.memoryPercent >= 90
                  ? 'bg-[#ef4444]'
                  : snapshot.memoryPercent >= 80
                  ? 'bg-[#eab308]'
                  : 'bg-[#10b981]'
              }`}
              style={{ width: `${Math.min(100, snapshot.memoryPercent)}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-[#71717a] flex justify-between">
            <span>Free: {formatBytesBinary(snapshot.memoryAvailableBytes, 1)}</span>
            <span className="text-[#a1a1aa] hover:text-[#fafafa]">View Memory &rarr;</span>
          </div>
        </div>

        {/* Disk Card */}
        <div
          onClick={() => onNavigateTab('disk')}
          className="bg-[#121215] border border-[#27272a] hover:border-[#3f3f46] rounded p-3.5 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-[#a1a1aa]">
            <span className="font-medium">Storage ({primaryDisk ? primaryDisk.mount : 'C:'})</span>
            <HardDrive className="w-3.5 h-3.5 text-[#a1a1aa]" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-[#fafafa]">
              {primaryDisk ? primaryDisk.percent.toFixed(1) : '0.0'}%
            </div>
            <span className="text-[11px] text-[#71717a] font-mono">
              {primaryDisk ? formatBytesDecimal(primaryDisk.freeBytes, 0) : '0 GB'} Free
            </span>
          </div>
          <div className="mt-2.5 bg-[#18181b] h-1.5 rounded-xs overflow-hidden border border-[#27272a]">
            <div
              className={`h-full transition-all duration-300 ${
                primaryDisk && primaryDisk.percent >= 90
                  ? 'bg-[#ef4444]'
                  : primaryDisk && primaryDisk.percent >= 80
                  ? 'bg-[#eab308]'
                  : 'bg-[#8b5cf6]'
              }`}
              style={{ width: `${primaryDisk ? primaryDisk.percent : 0}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-[#71717a] flex justify-between">
            <span>I/O: {(snapshot.diskReadKbps / 1024).toFixed(1)} MB/s</span>
            <span className="text-[#a1a1aa] hover:text-[#fafafa]">View Disks &rarr;</span>
          </div>
        </div>

        {/* Network Card */}
        <div
          onClick={() => onNavigateTab('network')}
          className="bg-[#121215] border border-[#27272a] hover:border-[#3f3f46] rounded p-3.5 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-[#a1a1aa]">
            <span className="font-medium">Network I/O Rate</span>
            <Activity className="w-3.5 h-3.5 text-[#a1a1aa]" />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#38bdf8] text-sm font-bold font-mono">
              <ArrowDown className="w-3.5 h-3.5" />
              <span>{snapshot.netDownloadKbps.toFixed(1)} KB/s</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#a1a1aa] text-xs font-medium font-mono">
              <ArrowUp className="w-3 h-3" />
              <span>{snapshot.netUploadKbps.toFixed(1)} KB/s</span>
            </div>
          </div>
          <div className="mt-2.5 bg-[#18181b] h-1.5 rounded-xs overflow-hidden border border-[#27272a]">
            <div
              className="h-full bg-[#38bdf8] transition-all duration-300"
              style={{ width: `${Math.min(100, (snapshot.netDownloadKbps / 5000) * 100)}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-[#71717a] flex justify-between">
            <span>Hardware Delta</span>
            <span className="text-[#a1a1aa] hover:text-[#fafafa]">View Network &rarr;</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Diagnostic Health + Top Processes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Diagnostic Snapshot Box */}
        <div className="bg-[#121215] border border-[#27272a] rounded p-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#27272a]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#a1a1aa]" />
              <span className="text-xs font-bold text-[#fafafa] uppercase tracking-wide">
                Hardware Health Observations
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('diagnostics')}
              className="text-xs text-[#38bdf8] hover:text-[#7dd3fc] font-medium"
            >
              Full Diagnostics &rarr;
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {diagnostics.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded bg-[#18181b] border border-[#27272a] flex items-start gap-2.5 text-xs"
              >
                <div className="mt-0.5">
                  {item.severity === 'critical' ? (
                    <AlertTriangle className="w-4 h-4 text-[#ef4444]" />
                  ) : item.severity === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-[#eab308]" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-[#22c55e]" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[#f4f4f5]">{item.title}</div>
                  <div className="text-[#a1a1aa] text-[11px] mt-0.5 font-mono">{item.evidence}</div>
                  <div className="text-[#38bdf8] text-[11px] mt-1 font-medium">
                    Recommendation: {item.practicalStep}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Active Processes Box */}
        <div className="bg-[#121215] border border-[#27272a] rounded p-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#27272a]">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#a1a1aa]" />
              <span className="text-xs font-bold text-[#fafafa] uppercase tracking-wide">
                Top Active Workloads
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('processes')}
              className="text-xs text-[#38bdf8] hover:text-[#7dd3fc] font-medium"
            >
              Task Manager &rarr;
            </button>
          </div>
          <div className="mt-2 divide-y divide-[#27272a]">
            {topProcesses.map((p) => (
              <div key={p.pid} className="py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[#71717a] w-12">{p.pid}</span>
                  <span className="font-medium text-[#f4f4f5]">{p.name}</span>
                </div>
                <div className="flex items-center gap-4 font-mono text-[11px]">
                  <span className="text-[#38bdf8] font-bold">{p.cpuPercent.toFixed(1)}% CPU</span>
                  <span className="text-[#a1a1aa]">
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
