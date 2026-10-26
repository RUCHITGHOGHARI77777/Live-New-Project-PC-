import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { ProcessItem } from '../logic/metrics';

interface SafeTerminateModalProps {
  process: ProcessItem | null;
  onConfirm: (proc: ProcessItem) => void;
  onClose: () => void;
}

export const SafeTerminateModal: React.FC<SafeTerminateModalProps> = ({
  process,
  onConfirm,
  onClose,
}) => {
  if (!process) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-[#2a3854] rounded-lg max-w-md w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#1f293d]">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Confirm Task Termination</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            Are you sure you want to request termination for{' '}
            <strong className="text-slate-100 font-mono">{process.name}</strong> (PID:{' '}
            <span className="font-mono text-blue-300">{process.pid}</span>)?
          </p>

          <div className="p-3 rounded bg-rose-950/30 border border-rose-800/40 text-rose-200 text-[11px] space-y-1">
            <div className="font-bold">Risk Assessment:</div>
            <div>
              • Terminating an active task abruptly may cause unsaved documents or state to be lost.
            </div>
            <div>
              • High CPU or memory usage alone does NOT indicate malicious behavior; the task may simply be compiling, rendering, or compressing.
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1f293d]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(process)}
            className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-sm"
          >
            Terminate Process
          </button>
        </div>
      </div>
    </div>
  );
};
