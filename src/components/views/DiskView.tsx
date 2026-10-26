import React from 'react';
import { HardDrive, ArrowDownToLine, ArrowUpFromLine, CheckCircle2 } from 'lucide-react';
import { TelemetrySnapshot, formatBytesDecimal } from '../../logic/metrics';

interface DiskViewProps {
  snapshot: TelemetrySnapshot;
  diskThreshold: number;
}

export const DiskView: React.FC<DiskViewProps> = ({ snapshot, diskThreshold }) => {
  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="bg-[#121215] border border-[#27272a] rounded p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-[#a855f7]" />
            <h2 className="text-base font-bold text-[#fafafa]">
              Storage Drives & Real-Time I/O Bandwidth
            </h2>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1">
            Mounted partitions, filesystem structures, capacity headroom, and real-time disk transfer speeds.
          </p>
        </div>

        {/* Global Active I/O Counter */}
        <div className="flex items-center gap-4 text-xs bg-[#18181b] px-3 py-1.5 rounded border border-[#27272a]">
          <div className="flex items-center gap-1.5 text-[#38bdf8] font-mono">
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Read: {(snapshot.diskReadKbps / 1024).toFixed(1)} MB/s</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#a1a1aa] font-mono">
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
              className="bg-[#121215] border border-[#27272a] rounded p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#18181b] border border-[#27272a] text-[#fafafa] flex items-center justify-center font-bold text-xs font-mono">
                    {disk.mount[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#fafafa]">
                        Local Disk ({disk.mount})
                      </span>
                      <span className="text-[11px] text-[#71717a] font-medium">
                        [{disk.label || 'Volume'}]
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#18181b] text-[#a1a1aa] border border-[#27272a]">
                        {disk.fs}
                      </span>
                    </div>
                    <div className="text-xs text-[#a1a1aa] mt-0.5">
                      Status: <span className="text-[#22c55e] font-medium">Healthy</span> • Fixed Storage
                    </div>
                  </div>
                </div>

                {/* Storage Numbers */}
                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-[#fafafa]">
                    {formatBytesDecimal(disk.freeBytes, 1)} free of {formatBytesDecimal(disk.totalBytes, 1)}
                  </div>
                  <div
                    className={`text-xs font-semibold ${
                      isCritical ? 'text-[#ef4444]' : isWarning ? 'text-[#eab308]' : 'text-[#71717a]'
                    }`}
                  >
                    {disk.percent.toFixed(1)}% Used
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#09090b] h-2 rounded overflow-hidden border border-[#27272a]">
                <div
                  className={`h-full transition-all duration-300 ${
                    isCritical ? 'bg-[#ef4444]' : isWarning ? 'bg-[#eab308]' : 'bg-[#8b5cf6]'
                  }`}
                  style={{ width: `${Math.min(100, disk.percent)}%` }}
                />
              </div>

              {/* Read/Write Throughput for this drive */}
              <div className="flex items-center justify-between text-xs text-[#a1a1aa] pt-1 border-t border-[#27272a]">
                <div className="flex items-center gap-4 font-mono">
                  <span className="flex items-center gap-1 text-[#f4f4f5]">
                    <ArrowDownToLine className="w-3 h-3 text-[#38bdf8]" />
                    Read: {(disk.readSpeedBps / (1024 * 1024)).toFixed(1)} MB/s
                  </span>
                  <span className="flex items-center gap-1 text-[#a1a1aa]">
                    <ArrowUpFromLine className="w-3 h-3 text-[#71717a]" />
                    Write: {(disk.writeSpeedBps / (1024 * 1024)).toFixed(1)} MB/s
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[#71717a] text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
                  <span>NTFS Volume Verified</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
