import React from 'react';
import {
  ShieldAlert,
  Download,
  Terminal,
  FolderGit2,
  Lock,
  Layers,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface AboutViewProps {
  onDownloadZip: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onDownloadZip }) => {
  return (
    <div className="space-y-5 pb-6">
      {/* Hero Header */}
      <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-xl text-blue-400 tracking-wider">
                WINDOWS X-RAY
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                v1.0.0 Release
              </span>
            </div>
            <p className="text-sm text-slate-300 font-medium mt-1">
              Real-Time System Monitoring & Diagnostic Tool
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Engineered for Windows 10 and Windows 11 (64-bit). Built with Python 3.11, PySide6, psutil,
              and rule-based diagnostics for students, power users, and system engineers.
            </p>
          </div>

          <button
            onClick={onDownloadZip}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-blue-900/30"
          >
            <Download className="w-4 h-4" />
            <span>Download Windows Desktop Source (.zip)</span>
          </button>
        </div>
      </div>

      {/* One-Click Quickstart Guide */}
      <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-5 space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-100">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>One-Click Desktop Running Guide (Windows 10 / 11)</span>
        </div>
        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            No complex installations or manual environment setup are required:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-400 ml-1">
            <li>
              Download <strong className="text-blue-300">WindowsXRay-v1.0.0-Source.zip</strong> using the button above and extract it into any folder on your Windows PC.
            </li>
            <li>
              Double-click <strong className="text-emerald-300">Run_Windows_XRay.bat</strong>. It automatically checks Python, creates an isolated virtual environment (<code className="bg-slate-900 px-1 rounded text-slate-300">.venv</code>), installs the pinned dependencies, and launches the desktop window immediately!
            </li>
            <li>
              To compile a standalone distributable executable, double-click <strong className="text-purple-300">Build_Windows_XRay.bat</strong>. The portable EXE will be built in <code className="bg-slate-900 px-1 rounded text-slate-300">dist\WindowsXRay\WindowsXRay.exe</code>.
            </li>
          </ol>
        </div>
      </div>

      {/* Privacy and Security Policy */}
      <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-5 space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-100">
          <Lock className="w-4 h-4 text-blue-400" />
          <span>Security, Privacy & Non-Intrusive Monitoring Pledge</span>
        </div>
        <div className="text-xs text-slate-400 space-y-2 leading-relaxed">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Read-Only Monitoring:</strong> Windows X-Ray does not modify system files, write to protected registry keys, or alter OS scheduling.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Zero Cloud Telemetry:</strong> No analytics beacons, tracking pixels, ads, crash reporters, or external cloud telemetry calls are ever made.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Local Data Storage:</strong> Metric logs and settings reside strictly on this PC in <code className="text-slate-300 bg-slate-900 px-1 rounded">%APPDATA%\WindowsXRay</code> (or local storage).</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>No Elevation Required:</strong> Designed to run under standard user privileges without prompting for Administrator access unless inspecting protected system kernel services.</span>
          </div>
        </div>
      </div>

      {/* GitHub Setup Instructions */}
      <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-5 space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm text-slate-100">
          <FolderGit2 className="w-4 h-4 text-purple-400" />
          <span>GitHub Repository Upload Instructions</span>
        </div>
        <div className="text-xs text-slate-400 space-y-1.5 leading-relaxed">
          <p>To publish this codebase directly to your GitHub account:</p>
          <pre className="p-3 bg-[#080d1a] border border-[#1a253a] rounded font-mono text-[11px] text-blue-300 overflow-x-auto">
{`git init
git add .
git commit -m "Initial release of Windows X-Ray v1.0.0"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/windows-xray.git
git push -u origin main`}
          </pre>
          <p className="text-slate-500 text-[11px]">
            The repository includes a strict <code className="text-slate-300">.gitignore</code> preventing local databases, test caches, reports, or virtual environments from being committed.
          </p>
        </div>
      </div>
    </div>
  );
};
