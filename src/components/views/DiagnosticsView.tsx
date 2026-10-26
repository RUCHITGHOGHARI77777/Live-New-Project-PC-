import React from 'react';
import { Stethoscope, AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';
import { DiagnosticItem } from '../../logic/diagnostics';

interface DiagnosticsViewProps {
  diagnostics: DiagnosticItem[];
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({ diagnostics }) => {
  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="bg-[#121215] border border-[#27272a] rounded p-4">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-[#38bdf8]" />
          <h2 className="text-base font-bold text-[#fafafa]">
            Explainable Diagnostics Engine (Advisory Observations)
          </h2>
        </div>
        <p className="text-xs text-[#a1a1aa] mt-1">
          Automated evaluation of live hardware utilization rules. Observations provide actionable transparency without definitive claims.
        </p>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="bg-[#121215] border border-[#27272a] rounded p-3 text-xs text-[#d4d4d8] flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#fafafa]">Diagnostic Scope & Advisory Statement:</span>{' '}
          <span className="text-[#a1a1aa]">
            All findings listed below are deterministic, rule-based indicators intended to highlight potential resource bottlenecks or heavy workloads.
            They represent possible causes—not definitive hardware failures, infection, or malware.
          </span>
        </div>
      </div>

      {/* Diagnostics Findings Cards */}
      <div className="space-y-3">
        {diagnostics.map((item) => {
          const isCritical = item.severity === 'critical';
          const isWarning = item.severity === 'warning';

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded border transition-colors ${
                isCritical
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : isWarning
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-[#121215] border-[#27272a]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#27272a]">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isCritical
                        ? 'bg-rose-900/40 text-rose-300 border border-rose-500/40'
                        : isWarning
                        ? 'bg-amber-900/40 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {item.severity}
                  </span>
                  <span className="text-xs font-semibold text-[#a1a1aa]">
                    Category: <span className="text-[#fafafa]">{item.category}</span>
                  </span>
                  <span className="font-bold text-sm text-[#fafafa]">{item.title}</span>
                </div>
                <div className="text-[11px] text-[#71717a] font-mono">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </div>
              </div>

              {/* Finding Evidence & Rule Threshold */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-2.5 text-xs">
                <div className="p-2.5 rounded bg-[#09090b] border border-[#27272a]">
                  <div className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wide">
                    Observed Telemetry Evidence
                  </div>
                  <div className="mt-1 text-[#e4e4e7] leading-relaxed font-mono text-[11px]">
                    {item.evidence}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#09090b] border border-[#27272a]">
                  <div className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wide">
                    Evaluation Rule & Threshold
                  </div>
                  <div className="mt-1 text-[#d4d4d8] leading-relaxed">
                    {item.threshold}
                  </div>
                </div>
              </div>

              {/* Practical Next Step */}
              <div className="p-2 rounded bg-[#18181b] border border-[#27272a] text-xs flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-[#38bdf8] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#38bdf8]">Actionable Next Step:</span>{' '}
                  <span className="text-[#d4d4d8]">{item.practicalStep}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
