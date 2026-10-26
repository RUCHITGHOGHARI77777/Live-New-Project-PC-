import React from 'react';
import { Stethoscope, AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';
import { DiagnosticItem } from '../../logic/diagnostics';

interface DiagnosticsViewProps {
  diagnostics: DiagnosticItem[];
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({ diagnostics }) => {
  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-blue-400" />
          <h2 className="text-base font-bold text-slate-100">
            Explainable Rule-Based Diagnostics Engine
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Automated evaluation of live hardware utilization rules. Observations provide transparency into system state with actionable next steps.
        </p>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="bg-[#0b1324] border border-blue-900/40 rounded-lg p-3.5 text-xs text-slate-300 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-blue-300">Diagnostic Scope & Advisory Notice:</span>{' '}
          <span className="text-slate-400">
            All findings listed below are deterministic, rule-based indicators intended to highlight potential resource bottlenecks or heavy workloads.
            They represent possible causes—not definitive diagnoses, hardware failures, or security compromises.
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
              className={`p-4 rounded-lg border transition-all ${
                isCritical
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : isWarning
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-[#10172a] border-[#1f293d]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#1f293d]">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {item.severity}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    Category: <span className="text-slate-200">{item.category}</span>
                  </span>
                  <span className="font-bold text-sm text-slate-100">{item.title}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </div>
              </div>

              {/* Finding Evidence & Rule Threshold */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3 text-xs">
                <div className="p-2.5 rounded bg-[#090e1c] border border-[#1a253a]">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    Observed Telemetry Evidence
                  </div>
                  <div className="mt-1 text-slate-200 leading-relaxed font-mono text-[11px]">
                    {item.evidence}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#090e1c] border border-[#1a253a]">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    Evaluation Rule & Trigger Criteria
                  </div>
                  <div className="mt-1 text-slate-300 leading-relaxed">
                    {item.threshold}
                  </div>
                </div>
              </div>

              {/* Practical Next Step */}
              <div className="p-2.5 rounded bg-blue-950/30 border border-blue-800/30 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-blue-300">Actionable Next Step:</span>{' '}
                  <span className="text-slate-300">{item.practicalStep}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
