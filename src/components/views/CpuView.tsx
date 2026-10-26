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
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines (25%, 50%, 75%, 100%)
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    for (let p = 0; p <= 100; p += 25) {
      const y = height - (p / 100) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      // Label
      if (p > 0 && p < 100) {
        ctx.fillStyle = '#71717a';
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

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.75;
    ctx.stroke();

    // Area fill gradient
    ctx.lineTo(width, height);
    ctx.lineTo(startX, height);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(56, 189, 248, 0.18)');
    gradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
    ctx.fillStyle = gradient;
    ctx.fill();
  }, [historyCpu]);

  return (
    <div className="space-y-4 pb-6">
      {/* Header and Controls */}
      <div className="bg-[#121215] border border-[#27272a] rounded p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#38bdf8]" />
            <h2 className="text-base font-bold text-[#fafafa]">
              Processor Utilization & Per-Core Telemetry
            </h2>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1">
            {snapshot.cpuModel} • {snapshot.physicalCores} Physical Cores / {snapshot.logicalCores} Logical Threads
          </p>
        </div>

        {/* Sampling Interval Selector */}
        <div className="flex items-center gap-2 text-xs bg-[#18181b] px-3 py-1.5 rounded border border-[#27272a]">
          <Sliders className="w-3.5 h-3.5 text-[#71717a]" />
          <span className="text-[#a1a1aa]">Sample Rate:</span>
          <select
            value={refreshInterval}
            onChange={(e) => onChangeInterval(parseFloat(e.target.value))}
            aria-label="Processor Sample Rate"
            className="bg-[#121215] border border-[#27272a] text-[#f4f4f5] font-semibold rounded px-2 py-0.5 outline-none cursor-pointer"
          >
            <option value="0.5">0.5s (High Frequency)</option>
            <option value="1.0">1.0s (Recommended Standard)</option>
            <option value="2.0">2.0s (Balanced)</option>
            <option value="5.0">5.0s (Low Overhead)</option>
          </select>
        </div>
      </div>

      {/* Main Graph & Big Stats */}
      <div className="bg-[#121215] border border-[#27272a] rounded p-4">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#38bdf8]" />
            <span className="font-semibold text-[#fafafa]">Real-Time Utilization History (60s)</span>
          </div>
          <div className="font-mono text-[#a1a1aa]">
            Current Overall: <span className="text-[#38bdf8] font-bold">{snapshot.cpuOverallPercent.toFixed(1)}%</span>
          </div>
        </div>

        {/* Canvas Chart */}
        <div className="w-full h-48 rounded border border-[#27272a] overflow-hidden bg-[#09090b]">
          <canvas
            ref={canvasRef}
            width={900}
            height={192}
            className="w-full h-full block"
          />
        </div>
      </div>

      {/* Per-Core Breakdown Grid */}
      <div className="bg-[#121215] border border-[#27272a] rounded p-4">
        <div className="flex items-center gap-2 mb-3 text-xs">
          <Zap className="w-4 h-4 text-[#eab308]" />
          <span className="font-bold text-[#fafafa] uppercase tracking-wide">
            Individual Thread Utilization
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {snapshot.cpuPerCorePercent.map((coreVal, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded bg-[#18181b] border border-[#27272a] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-[11px] text-[#a1a1aa]">
                <span>Core #{idx}</span>
                <span
                  className={`font-mono font-bold ${
                    coreVal >= 90
                      ? 'text-[#ef4444]'
                      : coreVal >= 75
                      ? 'text-[#eab308]'
                      : 'text-[#38bdf8]'
                  }`}
                >
                  {coreVal.toFixed(0)}%
                </span>
              </div>
              <div className="mt-2 bg-[#09090b] h-14 rounded overflow-hidden flex flex-col justify-end p-0.5 border border-[#27272a]">
                <div
                  className={`w-full rounded-xs transition-all duration-300 ${
                    coreVal >= 90
                      ? 'bg-[#ef4444]'
                      : coreVal >= 75
                      ? 'bg-[#eab308]'
                      : 'bg-[#38bdf8]'
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
