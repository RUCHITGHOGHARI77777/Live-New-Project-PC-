import React from 'react';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Wifi,
  EthernetPort,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { TelemetrySnapshot } from '../../logic/metrics';

interface NetworkViewProps {
  snapshot: TelemetrySnapshot;
}

export const NetworkView: React.FC<NetworkViewProps> = ({ snapshot }) => {
  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100">
              Network Interfaces & Real-Time Throughput
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Bandwidth rates calculated from safe hardware counter deltas without payload inspection.
          </p>
        </div>

        {/* Global Transfer Speeds */}
        <div className="flex items-center gap-4 bg-[#0b1220] px-4 py-2 rounded border border-[#1f293d]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-cyan-500/10 text-cyan-400">
              <ArrowDown className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-400">Download Rate</div>
              <div className="text-sm font-bold font-mono text-cyan-400">
                {snapshot.netDownloadKbps.toFixed(1)} KB/s
              </div>
            </div>
          </div>

          <div className="w-[1px] h-8 bg-slate-800" />

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-400">
              <ArrowUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-400">Upload Rate</div>
              <div className="text-sm font-bold font-mono text-indigo-300">
                {snapshot.netUploadKbps.toFixed(1)} KB/s
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Network Adapters List */}
      <div className="space-y-3">
        {snapshot.networks.map((nic) => (
          <div
            key={nic.id}
            className="bg-[#10172a] border border-[#1f293d] rounded-lg p-4 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  {nic.type === 'wifi' ? (
                    <Wifi className="w-5 h-5" />
                  ) : (
                    <Activity className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100">{nic.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                        nic.isUp
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {nic.isUp ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Connected</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-slate-400" />
                          <span>Disconnected</span>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Link Speed: <span className="text-slate-200">{nic.speedMbps > 0 ? `${nic.speedMbps} Mbps` : 'Auto-Negotiated'}</span> • Hardware Interface
                  </div>
                </div>
              </div>

              {/* Per-adapter download/upload rates */}
              <div className="text-right font-mono text-xs">
                <div className="text-cyan-400 font-semibold">
                  Recv: {(nic.bytesRecvPerSec / 1024).toFixed(1)} KB/s
                </div>
                <div className="text-indigo-300 font-medium">
                  Sent: {(nic.bytesSentPerSec / 1024).toFixed(1)} KB/s
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Privacy Guarantee Panel */}
      <div className="bg-[#0e1627] border border-blue-900/30 rounded-lg p-4 text-xs text-slate-300 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-emerald-300">
            Privacy & Non-Intrusive Monitoring Guarantee
          </div>
          <div className="text-slate-400 mt-1 leading-relaxed">
            Windows X-Ray exclusively samples aggregated byte transfer counters provided by the OS network stack.
            It does not packet-sniff, inspect socket payload data, log visited web domains, capture DNS requests,
            or inspect user credentials. Traffic readings represent raw volumetric byte movement only.
          </div>
        </div>
      </div>
    </div>
  );
};
