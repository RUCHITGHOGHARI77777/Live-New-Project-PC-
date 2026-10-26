import React, { useState } from 'react';
import { CircuitBoard, HelpCircle, AlertTriangle, ShieldCheck, Database } from 'lucide-react';
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

  // Cached memory estimation (standard Windows Standby/Cache behavior)
  const cachedBytes = Math.floor(snapshot.memoryAvailableBytes * 0.45);

  return (
    <div className="space-y-5 pb-6">
      {/* Header with Unit Selector */}
      <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CircuitBoard className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">
              System RAM Allocation & Memory Pressure
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Physical RAM usage, availability headroom, and memory pressure warning thresholds.
          </p>
        </div>

        {/* Unit Toggle: GiB (IEEE 1541) vs GB (Decimal) */}
        <div className="flex items-center gap-2 text-xs bg-[#0b1220] px-3 py-1.5 rounded border border-[#1f293d]">
          <span className="text-slate-400">Unit Standard:</span>
          <div className="flex bg-[#162032] p-0.5 rounded border border-[#26354f]">
            <button
              onClick={() => setUnitMode('binary')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                unitMode === 'binary'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Binary (GiB / 1024)
            </button>
            <button
              onClick={() => setUnitMode('decimal')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                unitMode === 'decimal'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Decimal (GB / 1000)
            </button>
          </div>
        </div>
      </div>

      {/* Memory Pressure Status Alert */}
      <div
        className={`p-3.5 rounded-lg border text-xs flex items-center justify-between gap-3 ${
          isCritical
            ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            : isPressure
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {isPressure ? (
            <AlertTriangle className={`w-4 h-4 shrink-0 ${isCritical ? 'text-rose-400' : 'text-amber-400'}`} />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <div>
            <span className="font-bold">
              {isCritical
                ? 'CRITICAL MEMORY EXHAUSTION IMMINENT'
                : isPressure
                ? 'SUSTAINED MEMORY PRESSURE DETECTED'
                : 'RAM ALLOCATION WITHIN BALANCED LIMITS'}
              :
            </span>{' '}
            <span className="text-slate-300">
              {isPressure
                ? `System memory is currently at ${snapshot.memoryPercent.toFixed(1)}%, exceeding configured threshold (${memoryThreshold}%).`
                : `Allocation is currently ${snapshot.memoryPercent.toFixed(1)}% with ample headroom remaining.`}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Stat Breakdown Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total RAM */}
        <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-4">
          <div className="text-xs text-slate-400 font-medium">Installed Physical RAM</div>
          <div className="mt-1 text-2xl font-bold text-slate-100">
            {unitMode === 'binary'
              ? formatBytesBinary(snapshot.memoryTotalBytes, 2)
              : formatBytesDecimal(snapshot.memoryTotalBytes, 2)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Total detected capacity</div>
        </div>

        {/* Used RAM */}
        <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-4">
          <div className="text-xs text-slate-400 font-medium">In Use (Committed)</div>
          <div className="mt-1 text-2xl font-bold text-blue-400">
            {unitMode === 'binary'
              ? formatBytesBinary(snapshot.memoryUsedBytes, 2)
              : formatBytesDecimal(snapshot.memoryUsedBytes, 2)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {snapshot.memoryPercent.toFixed(1)}% of total memory
          </div>
        </div>

        {/* Available RAM */}
        <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-4">
          <div className="text-xs text-slate-400 font-medium">Available Headroom</div>
          <div className="mt-1 text-2xl font-bold text-emerald-400">
            {unitMode === 'binary'
              ? formatBytesBinary(snapshot.memoryAvailableBytes, 2)
              : formatBytesDecimal(snapshot.memoryAvailableBytes, 2)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Free for immediate assignment</div>
        </div>

        {/* Standby / Cached */}
        <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-4">
          <div className="text-xs text-slate-400 font-medium">Cached / Standby Pool</div>
          <div className="mt-1 text-2xl font-bold text-purple-400">
            {unitMode === 'binary'
              ? formatBytesBinary(cachedBytes, 2)
              : formatBytesDecimal(cachedBytes, 2)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">Reclaimable buffer cache</div>
        </div>
      </div>

      {/* Large Visual Allocation Bar */}
      <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-slate-200">Memory Allocation Composition</span>
          <span className="font-mono text-slate-400">{snapshot.memoryPercent.toFixed(1)}% Allocated</span>
        </div>
        <div className="h-6 bg-[#0b1220] rounded-md overflow-hidden flex border border-[#1f293d]">
          <div
            className={`transition-all duration-300 ${
              isCritical ? 'bg-rose-500' : isPressure ? 'bg-amber-400' : 'bg-blue-600'
            }`}
            style={{ width: `${snapshot.memoryPercent}%` }}
            title="Active / Committed RAM"
          />
          <div
            className="bg-purple-600/50 transition-all duration-300"
            style={{ width: `${Math.min(100 - snapshot.memoryPercent, 18)}%` }}
            title="Cached / Standby"
          />
        </div>
        <div className="flex items-center gap-6 mt-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-blue-600" />
            <span>Active Applications & Kernel</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-purple-600/50" />
            <span>Cached Standby Cache</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-[#0b1220] border border-slate-700" />
            <span>Free Unassigned</span>
          </div>
        </div>
      </div>

      {/* Educational Notice on GB vs GiB */}
      <div className="bg-[#0e1627] border border-blue-900/30 rounded-lg p-4 text-xs text-slate-300 flex items-start gap-3">
        <HelpCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-blue-300">
            Technical Note: Binary Gibibytes (GiB) vs Decimal Gigabytes (GB)
          </div>
          <div className="text-slate-400 mt-1 leading-relaxed">
            Windows Task Manager reports memory capacities using powers of 2 (1 GiB = 1,024 MiB = 1,073,741,824 bytes)
            while hardware packaging often lists SI decimal units (1 GB = 1,000 MB = 1,000,000,000 bytes). A 16 GB hardware
            DIMM shows in Windows as approximately 14.9 to 15.2 GiB once hardware-reserved motherboard mappings are subtracted.
            Windows X-Ray lets you inspect both standards consistently.
          </div>
        </div>
      </div>
    </div>
  );
};
