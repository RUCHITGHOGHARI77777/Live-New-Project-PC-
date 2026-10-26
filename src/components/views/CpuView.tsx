import React, { useEffect, useRef } from 'react';
import { Cpu, Zap, Activity, Sliders } from 'lucide-react';
import { TelemetrySnapshot } from '../../logic/metrics';

interface CpuViewProps {
  snapshot: TelemetrySnapshot;
  historyCpu: number[];
  refreshInterval: number;
  onChangeInterval: (val: number) => void;
}

export const CpuView: React.FC<CpuViewProps> = ({
  snapshot,
  historyCpu,
  refreshInterval,
  onChangeInterval,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render HTML5 Canvas time-series chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#0c1322';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines (25%, 50%, 75%, 100%)
    ctx.strokeStyle = '#1a2438';
    ctx.lineWidth = 1;
    for (let p = 0; p <= 100; p += 25) {
      const y = height - (p / 100) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      // Label
      if (p > 0 && p < 100) {
        ctx.fillStyle = '#475569';
        ctx.font = '10px monospace';
        ctx.fillText(`${p}%`, 6, y - 3);
      }
    }

    if (historyCpu.length < 2) return;

    // Draw CPU load line
    ctx.beginPath();
    const stepX = width / (Math.max(historyCpu.length - 1, 30));
    const startX = width - (historyCpu.length - 1) * stepX;

    historyCpu.forEach((val, idx) => {
      const x = startX + idx * stepX;
      const y = height - (Math.min(100, Math.max(0, val)) / 100) * height;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Area fill gradient
    ctx.lineTo(width, height);
    ctx.lineTo(startX, height);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
    ctx.fillStyle = gradient;
    ctx.fill();
  }, [historyCpu]);

  return (
    <div className="space-y-5 pb-6">
      {/* Header and Controls */}
      <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-slate-100">
              Processor Utilization & Per-Core Telemetry
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {snapshot.cpuModel} • {snapshot.physicalCores} Physical Cores / {snapshot.logicalCores} Logical Threads
          </p>
        </div>

        {/* Sampling Interval Selector */}
        <div className="flex items-center gap-2 text-xs bg-[#0b1220] px-3 py-1.5 rounded border border-[#1f293d]">
          <Sliders className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Sample Rate:</span>
          <select
            value={refreshInterval}
            onChange={(e) => onChangeInterval(parseFloat(e.target.value))}
            aria-label="Processor Sample Rate"
            className="bg-[#162032] border border-[#26354f] text-blue-300 font-semibold rounded px-2 py-0.5 outline-none cursor-pointer"
          >
            <option value="0.5">0.5s (High Frequency)</option>
            <option value="1.0">1.0s (Recommended Standard)</option>
            <option value="2.0">2.0s (Balanced)</option>
            <option value="5.0">5.0s (Low Overhead)</option>
          </select>
        </div>
      </div>

      {/* Main Graph & Big Stats */}
      <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-4">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-slate-200">Real-Time Utilization History (60s)</span>
          </div>
          <div className="font-mono text-slate-400">
            Current Overall: <span className="text-blue-400 font-bold">{snapshot.cpuOverallPercent.toFixed(1)}%</span>
          </div>
        </div>

        {/* Canvas Chart */}
        <div className="w-full h-48 rounded border border-[#1a253a] overflow-hidden bg-[#0c1322]">
          <canvas
            ref={canvasRef}
            width={900}
            height={192}
            className="w-full h-full block"
          />
        </div>
      </div>

      {/* Per-Core Breakdown Grid */}
      <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3 text-xs">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-slate-200 uppercase tracking-wide">
            Individual Thread Utilization
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {snapshot.cpuPerCorePercent.map((coreVal, idx) => (
            <div
              key={idx}
              className="p-3 rounded bg-[#0b1220] border border-[#1a253a] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Core #{idx}</span>
                <span
                  className={`font-mono font-bold ${
                    coreVal >= 90
                      ? 'text-rose-400'
                      : coreVal >= 75
                      ? 'text-amber-400'
                      : 'text-blue-400'
                  }`}
                >
                  {coreVal.toFixed(0)}%
                </span>
              </div>
              <div className="mt-2 bg-slate-800 h-16 rounded overflow-hidden flex flex-col justify-end p-0.5">
                <div
                  className={`w-full rounded-sm transition-all duration-300 ${
                    coreVal >= 90
                      ? 'bg-rose-500'
                      : coreVal >= 75
                      ? 'bg-amber-400'
                      : 'bg-blue-500'
                  }`}
                  style={{ height: `${Math.min(100, Math.max(4, coreVal))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
