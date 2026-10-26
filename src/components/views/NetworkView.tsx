import React from 'react';
import { Activity, ArrowDown, ArrowUp, Wifi, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { TelemetrySnapshot } from '../../logic/metrics';

interface NetworkViewProps {
  snapshot: TelemetrySnapshot;
}

export const NetworkView: React.FC<NetworkViewProps> = ({ snapshot }) => {
  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="bg-[#121215] border border-[#27272a] rounded p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#38bdf8]" />
            <h2 className="text-base font-bold text-[#fafafa]">
              Network Adapters & Throughput Rate
            </h2>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1">
            Real-time link speed and packet bandwidth deltas calculated without socket content snooping.
          </p>
        </div>

        {/* Global Transfer Speeds */}
        <div className="flex items-center gap-4 bg-[#18181b] px-3.5 py-1.5 rounded border border-[#27272a]">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[#09090b] text-[#38bdf8] border border-[#27272a]">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] uppercase text-[#71717a]">Download</div>
              <div className="text-sm font-bold font-mono text-[#38bdf8]">
                {snapshot.netDownloadKbps.toFixed(1)} KB/s
              </div>
            </div>
          </div>

          <div className="w-[1px] h-7 bg-[#27272a]" />

          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[#09090b] text-[#a1a1aa] border border-[#27272a]">
              <ArrowUp className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] uppercase text-[#71717a]">Upload</div>
              <div className="text-sm font-bold font-mono text-[#a1a1aa]">
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
            className="bg-[#121215] border border-[#27272a] rounded p-4 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#18181b] border border-[#27272a] text-[#38bdf8] flex items-center justify-center">
                  {nic.type === 'wifi' ? (
                    <Wifi className="w-4 h-4" />
                  ) : (
                    <Activity className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#fafafa]">{nic.name}</span>
                    <span
                      className={`px-2 py-0.2 rounded text-[10px] font-semibold flex items-center gap-1 ${
                        nic.isUp
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                          : 'bg-[#18181b] text-[#71717a] border border-[#27272a]'
                      }`}
                    >
                      {nic.isUp ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-[#22c55e]" />
                          <span>Connected</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-[#71717a]" />
                          <span>Disconnected</span>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="text-xs text-[#a1a1aa] mt-0.5">
                    Speed: <span className="text-[#f4f4f5]">{nic.speedMbps > 0 ? `${nic.speedMbps} Mbps` : 'Auto-Negotiated'}</span> • Physical Interface
                  </div>
                </div>
              </div>

              {/* Rates */}
              <div className="text-right font-mono text-xs">
                <div className="text-[#38bdf8] font-semibold">
                  Recv: {(nic.bytesRecvPerSec / 1024).toFixed(1)} KB/s
                </div>
                <div className="text-[#a1a1aa] font-medium">
                  Sent: {(nic.bytesSentPerSec / 1024).toFixed(1)} KB/s
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Privacy Guarantee Panel */}
      <div className="bg-[#121215] border border-[#27272a] rounded p-3.5 text-xs text-[#d4d4d8] flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#22c55e] shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-[#fafafa]">
            Privacy & Non-Intrusive Monitoring Assurance
          </div>
          <div className="text-[#a1a1aa] mt-0.5 leading-relaxed">
            Windows X-Ray samples raw byte transfer counters directly from the operating system network stack.
            It does not packet-sniff, inspect socket payload data, log visited web domains, capture DNS requests,
            or inspect user credentials.
          </div>
        </div>
      </div>
    </div>
  );
};
