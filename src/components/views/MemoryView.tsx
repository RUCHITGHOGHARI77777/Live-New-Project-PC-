import React, { useState } from 'react';
import { CircuitBoard, HelpCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import {
  TelemetrySnapshot,
  formatBytesBinary,
  formatBytesDecimal,
} from '../../logic/metrics';

interface MemoryViewProps {
  snapshot: TelemetrySnapshot;
  memoryThreshold: number;
}

export const MemoryView: React.FC<MemoryViewProps> = ({ snapshot, memoryThreshold }) => {
  const [unitMode, setUnitMode] = useState<'binary' | 'decimal'>('binary'); // Binary (GiB) vs Decimal (GB)

  const isPressure = snapshot.memoryPercent >= memoryThreshold;
  const isCritical = snapshot.memoryPercent >= 94.0;
  const cachedBytes = Math.floor(snapshot.memoryAvailableBytes * 0.45);

  return (
    <div className="space-y-4 pb-6">
      {/* Header with Unit Selector */}
      <div className="bg-[#121215] border border-[#27272a] rounded p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CircuitBoard className="w-5 h-5 text-[#10b981]" />
            <h2 className="text-base font-bold text-[#fafafa]">
              System RAM Allocation & Memory Pressure
            </h2>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1">
            Physical RAM usage, commit working set, and memory pressure warning triggers.
          </p>
        </div>

        {/* Unit Toggle: GiB (IEEE 1541) vs GB (Decimal) */}
        <div className="flex items-center gap-2 text-xs bg-[#18181b] px-3 py-1.5 rounded border border-[#27272a]">
          <span className="text-[#a1a1aa]">Unit Standard:</span>
          <div className="flex bg-[#121215] p-0.5 rounded border border-[#27272a]">
            <button
              onClick={() => setUnitMode('binary')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                unitMode === 'binary'
                  ? 'bg-[#27272a] text-[#fafafa]'
                  : 'text-[#71717a] hover:text-[#a1a1aa]'
              }`}
            >
              Binary (GiB / 1024)
            </button>
            <button
              onClick={() => setUnitMode('decimal')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                unitMode === 'decimal'
                  ? 'bg-[#27272a] text-[#fafafa]'
                  : 'text-[#71717a] hover:text-[#a1a1aa]'
              }`}
            >
              Decimal (GB / 1000)
            </button>
          </div>
        </div>
      </div>

      {/* Memory Pressure Status Alert */}
      <div
        className={`p-3 rounded border text-xs flex items-center justify-between gap-3 ${
          isCritical
            ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
            : isPressure
            ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
            : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {isPressure ? (
            <AlertTriangle className={`w-4 h-4 shrink-0 ${isCritical ? 'text-[#ef4444]' : 'text-[#eab308]'}`} />
          ) : (
            <ShieldCheck className="w-4 h-4 text-[#22c55e] shrink-0" />
          )}
          <div>
            <span className="font-bold">
              {isCritical
                ? 'CRITICAL MEMORY EXHAUSTION IMMINENT'
                : isPressure
                ? 'SUSTAINED MEMORY PRESSURE OBSERVED'
                : 'RAM ALLOCATION WITHIN NORMAL ENVELOPE'}
              :
            </span>{' '}
            <span className="text-[#d4d4d8]">
              {isPressure
                ? `System RAM is currently at ${snapshot.memoryPercent.toFixed(1)}%, breaching configured threshold (${memoryThreshold}%).`
                : `Allocation is currently ${snapshot.memoryPercent.toFixed(1)}% with ample free address space.`}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Stat Breakdown Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total RAM */}
        <div className="bg-[#121215] border border-[#27272a] rounded p-3.5">
          <div className="text-xs text-[#a1a1aa] font-medium">Installed Physical RAM</div>
          <div className="mt-1 text-2xl font-bold font-mono text-[#fafafa]">
            {unitMode === 'binary'
              ? formatBytesBinary(snapshot.memoryTotalBytes, 2)
              : formatBytesDecimal(snapshot.memoryTotalBytes, 2)}
          </div>
          <div className="mt-1.5 text-[11px] text-[#71717a]">Total hardware detected</div>
        </div>

        {/* Used RAM */}
        <div className="bg-[#121215] border border-[#27272a] rounded p-3.5">
          <div className="text-xs text-[#a1a1aa] font-medium">Committed Active</div>
          <div className="mt-1 text-2xl font-bold font-mono text-[#38bdf8]">
            {unitMode === 'binary'
              ? formatBytesBinary(snapshot.memoryUsedBytes, 2)
              : formatBytesDecimal(snapshot.memoryUsedBytes, 2)}
          </div>
          <div className="mt-1.5 text-[11px] text-[#71717a]">
            {snapshot.memoryPercent.toFixed(1)}% of total capacity
          </div>
        </div>

        {/* Available RAM */}
        <div className="bg-[#121215] border border-[#27272a] rounded p-3.5">
          <div className="text-xs text-[#a1a1aa] font-medium">Available Headroom</div>
          <div className="mt-1 text-2xl font-bold font-mono text-[#10b981]">
            {unitMode === 'binary'
              ? formatBytesBinary(snapshot.memoryAvailableBytes, 2)
              : formatBytesDecimal(snapshot.memoryAvailableBytes, 2)}
          </div>
          <div className="mt-1.5 text-[11px] text-[#71717a]">Free for immediate assignment</div>
        </div>

        {/* Standby / Cached */}
        <div className="bg-[#121215] border border-[#27272a] rounded p-3.5">
          <div className="text-xs text-[#a1a1aa] font-medium">Cached Standby Pool</div>
          <div className="mt-1 text-2xl font-bold font-mono text-[#a855f7]">
            {unitMode === 'binary'
              ? formatBytesBinary(cachedBytes, 2)
              : formatBytesDecimal(cachedBytes, 2)}
          </div>
          <div className="mt-1.5 text-[11px] text-[#71717a]">Reclaimable filesystem cache</div>
        </div>
      </div>

      {/* Visual Allocation Bar */}
      <div className="bg-[#121215] border border-[#27272a] rounded p-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-[#fafafa]">Memory Space Allocation</span>
          <span className="font-mono text-[#a1a1aa]">{snapshot.memoryPercent.toFixed(1)}% Allocated</span>
        </div>
        <div className="h-4 bg-[#09090b] rounded overflow-hidden flex border border-[#27272a]">
          <div
            className={`transition-all duration-300 ${
              isCritical ? 'bg-[#ef4444]' : isPressure ? 'bg-[#eab308]' : 'bg-[#38bdf8]'
            }`}
            style={{ width: `${snapshot.memoryPercent}%` }}
          />
          <div
            className="bg-[#6b21a8] transition-all duration-300"
            style={{ width: `${Math.min(100 - snapshot.memoryPercent, 18)}%` }}
          />
        </div>
        <div className="flex items-center gap-6 mt-3 text-xs text-[#a1a1aa]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#38bdf8]" />
            <span>Active Applications</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#6b21a8]" />
            <span>Cached Standby Cache</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#09090b] border border-[#3f3f46]" />
            <span>Free Unassigned</span>
          </div>
        </div>
      </div>

      {/* Educational Notice on GB vs GiB */}
      <div className="bg-[#121215] border border-[#27272a] rounded p-3.5 text-xs text-[#d4d4d8] flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-[#fafafa]">
            Technical Reference: Binary Gibibytes (GiB) vs Decimal Gigabytes (GB)
          </div>
          <div className="text-[#a1a1aa] mt-0.5 leading-relaxed">
            Windows Task Manager reports memory capacities using powers of 2 (1 GiB = 1,024 MiB = 1,073,741,824 bytes)
            whereas hard disk manufacturers specify decimal units (1 GB = 1,000 MB = 1,000,000,000 bytes). A 16 GB RAM
            module displays in Windows as approximately 15.2 GiB after hardware reservations.
          </div>
        </div>
      </div>
    </div>
  );
};
