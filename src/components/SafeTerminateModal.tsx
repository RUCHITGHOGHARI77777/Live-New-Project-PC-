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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#121215] border border-[#27272a] rounded-lg max-w-md w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#27272a]">
          <div className="flex items-center gap-2 text-[#ef4444] font-bold text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Confirm Task Termination</span>
          </div>
          <button onClick={onClose} className="text-[#71717a] hover:text-[#fafafa] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-[#d4d4d8] space-y-2 leading-relaxed">
          <p>
            Are you sure you want to terminate task{' '}
            <strong className="text-[#fafafa] font-mono">{process.name}</strong> (PID:{' '}
            <span className="font-mono text-[#38bdf8]">{process.pid}</span>)?
          </p>

          <div className="p-2.5 rounded bg-rose-950/20 border border-rose-800/30 text-rose-200 text-[11px] space-y-1">
            <div className="font-bold">Risk Assessment:</div>
            <div>
              • Terminating a process abruptly may discard unsaved state in the target application.
            </div>
            <div>
              • Elevated CPU consumption alone does not imply malware; compilation or rendering tasks legitimately utilize processor capacity.
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#27272a]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(process)}
            className="px-3 py-1.5 rounded bg-[#b91c1c] hover:bg-[#dc2626] text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
          >
            Terminate Process
          </button>
        </div>
      </div>
    </div>
  );
};
