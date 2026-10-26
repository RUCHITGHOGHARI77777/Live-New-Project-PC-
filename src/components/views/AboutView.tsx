import React from 'react';
import {
  Download,
  Terminal,
  FolderGit2,
  Lock,
  CheckCircle2,
} from 'lucide-react';

interface AboutViewProps {
  onDownloadZip: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onDownloadZip }) => {
  return (
    <div className="space-y-4 pb-6">
      {/* Hero Header */}
      <div className="bg-[#121215] border border-[#27272a] rounded p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-xl text-[#fafafa] tracking-wider">
                WINDOWS X-RAY
              </span>
              <span className="px-2 py-0.2 rounded text-xs font-mono font-bold bg-[#18181b] text-[#38bdf8] border border-[#27272a]">
                v1.0.0 Release
              </span>
            </div>
            <p className="text-sm text-[#d4d4d8] font-medium mt-1">
              Real-Time Hardware Diagnostics & Systems Monitoring Utility
            </p>
            <p className="text-xs text-[#a1a1aa] mt-1 max-w-xl leading-relaxed">
              Targeted for Windows 10 and Windows 11 (64-bit). Engineered using Python 3.11, PySide6, psutil,
              and rule-based diagnostics for computer science viva, academic evaluation, and professional systems analysis.
            </p>
          </div>

          <button
            onClick={onDownloadZip}
            className="flex items-center gap-2 px-3.5 py-2 rounded bg-[#18181b] hover:bg-[#27272a] text-[#fafafa] font-semibold text-xs border border-[#3f3f46] transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-[#38bdf8]" />
            <span>Download Windows Package (.zip)</span>
          </button>
        </div>
      </div>

      {/* One-Click Quickstart Guide */}
      <div className="bg-[#121215] border border-[#27272a] rounded p-4 space-y-2.5">
        <div className="flex items-center gap-2 font-bold text-sm text-[#fafafa]">
          <Terminal className="w-4 h-4 text-[#22c55e]" />
          <span>One-Click Desktop Running Guide (Windows 10 / 11)</span>
        </div>
        <div className="text-xs text-[#d4d4d8] space-y-2 leading-relaxed">
          <p>
            No complex manual toolchain configuration is required:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-[#a1a1aa] ml-1">
            <li>
              Extract <strong className="text-[#f4f4f5]">WindowsXRay-v1.0.0-Source.zip</strong> into any folder on your Windows PC.
            </li>
            <li>
              Double-click <strong className="text-[#86efac]">Run_Windows_XRay.bat</strong>. It automatically checks Python, creates an isolated virtual environment (<code className="bg-[#09090b] px-1 rounded text-[#e4e4e7]">.venv</code>), installs dependencies, and launches the desktop window immediately!
            </li>
            <li>
              To compile a standalone distributable binary, double-click <strong className="text-[#d8b4fe]">Build_Windows_XRay.bat</strong>. The portable EXE will be built in <code className="bg-[#09090b] px-1 rounded text-[#e4e4e7]">dist\WindowsXRay\WindowsXRay.exe</code>.
            </li>
          </ol>
        </div>
      </div>

      {/* Privacy and Security Policy */}
      <div className="bg-[#121215] border border-[#27272a] rounded p-4 space-y-2.5">
        <div className="flex items-center gap-2 font-bold text-sm text-[#fafafa]">
          <Lock className="w-4 h-4 text-[#38bdf8]" />
          <span>Security & Non-Intrusive Privacy Standard</span>
        </div>
        <div className="text-xs text-[#a1a1aa] space-y-1.5 leading-relaxed">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0 mt-0.5" />
            <span><strong>Read-Only Monitoring:</strong> Windows X-Ray does not modify system files, write to protected registry keys, or alter OS scheduling.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0 mt-0.5" />
            <span><strong>Zero Cloud Telemetry:</strong> No analytics beacons, tracking pixels, ads, crash reporters, or external cloud telemetry calls are ever made.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0 mt-0.5" />
            <span><strong>Local Data Storage:</strong> Metric logs and settings reside strictly on this PC in <code className="text-[#f4f4f5] bg-[#09090b] px-1 rounded">%APPDATA%\WindowsXRay</code> (or local storage).</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0 mt-0.5" />
            <span><strong>No Elevation Required:</strong> Designed to run under standard user privileges without prompting for Administrator access.</span>
          </div>
        </div>
      </div>

      {/* GitHub Setup Instructions */}
      <div className="bg-[#121215] border border-[#27272a] rounded p-4 space-y-2.5">
        <div className="flex items-center gap-2 font-bold text-sm text-[#fafafa]">
          <FolderGit2 className="w-4 h-4 text-[#a855f7]" />
          <span>GitHub Repository Publishing Commands</span>
        </div>
        <div className="text-xs text-[#a1a1aa] space-y-1.5 leading-relaxed">
          <p>To publish this codebase directly to your GitHub repository:</p>
          <pre className="p-3 bg-[#09090b] border border-[#27272a] rounded font-mono text-[11px] text-[#38bdf8] overflow-x-auto">
{`git init
git add .
git commit -m "feat: initial release of Windows X-Ray v1.0.0"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/windows-xray.git
git push -u origin main`}
          </pre>
        </div>
      </div>
    </div>
  );
};
