import React from 'react';
import { HardDrive, ArrowDownToLine, ArrowUpFromLine, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  TelemetrySnapshot,
  formatBytesDecimal,
} from '../../logic/metrics';

interface DiskViewProps {
  snapshot: TelemetrySnapshot;
  diskThreshold: number;
}

export const DiskView: React.FC<DiskViewProps> = ({ snapshot, diskThreshold }) => {
  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-slate-100">
              Storage Drives & Real-Time I/O Throughput
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Storage capacity utilization, file systems, mount points, and active disk read/write bandwidth.
          </p>
        </div>

        {/* Global Active I/O Counter */}
        <div className="flex items-center gap-4 text-xs bg-[#0b1220] px-3 py-1.5 rounded border border-[#1f293d]">
          <div className="flex items-center gap-1.5 text-blue-400 font-mono">
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Read: {(snapshot.diskReadKbps / 1024).toFixed(1)} MB/s</span>
          </div>
          <div className="flex items-center gap-1.5 text-indigo-400 font-mono">
            <ArrowUpFromLine className="w-3.5 h-3.5" />
            <span>Write: {(snapshot.diskWriteKbps / 1024).toFixed(1)} MB/s</span>
          </div>
        </div>
      </div>

      {/* Partitions List */}
      <div className="space-y-3">
        {snapshot.disks.map((disk) => {
          const isWarning = disk.percent >= diskThreshold;
          const isCritical = disk.percent >= 95.0;

          return (
            <div
              key={disk.mount}
              className="bg-[#10172a] border border-[#1f293d] rounded-lg p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                    {disk.mount[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100">
                        Local Disk ({disk.mount})
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        [{disk.label || 'Volume'}]
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {disk.fs}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Status: <span className="text-emerald-400 font-medium">Healthy</span> • BitLocker Ready
                    </div>
                  </div>
                </div>

                {/* Storage Numbers */}
                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-slate-200">
                    {formatBytesDecimal(disk.freeBytes, 1)} free of {formatBytesDecimal(disk.totalBytes, 1)}
                  </div>
                  <div
                    className={`text-xs font-semibold ${
                      isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  >
                    {disk.percent.toFixed(1)}% Used
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#0b1220] h-2.5 rounded-full overflow-hidden border border-[#1a253a]">
                <div
                  className={`h-full transition-all duration-300 ${
                    isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-purple-500'
                  }`}
                  style={{ width: `${Math.min(100, disk.percent)}%` }}
                />
              </div>

              {/* Read/Write Throughput for this drive */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-[#1a253a]">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-slate-300">
                    <ArrowDownToLine className="w-3 h-3 text-blue-400" />
                    Read: {(disk.readSpeedBps / (1024 * 1024)).toFixed(1)} MB/s
                  </span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <ArrowUpFromLine className="w-3 h-3 text-indigo-400" />
                    Write: {(disk.writeSpeedBps / (1024 * 1024)).toFixed(1)} MB/s
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fixed NTFS Storage</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
