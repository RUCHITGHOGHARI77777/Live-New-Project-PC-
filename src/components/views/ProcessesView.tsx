import React, { useState, useMemo } from 'react';
import {
  ListFilter,
  Search,
  ArrowUpDown,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { ProcessItem, formatBytesBinary } from '../../logic/metrics';

interface ProcessesViewProps {
  processes: ProcessItem[];
  onSelectProcessToTerminate: (proc: ProcessItem) => void;
}

type SortField = 'pid' | 'name' | 'cpuPercent' | 'memoryBytes';
type SortOrder = 'asc' | 'desc';

export const ProcessesView: React.FC<ProcessesViewProps> = ({
  processes,
  onSelectProcessToTerminate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('cpuPercent');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...processes];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.pid.toString().includes(q) ||
          p.user.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string' && typeof valB === 'string') {
        const cmp = valA.localeCompare(valB);
        return sortOrder === 'asc' ? cmp : -cmp;
      }

      const numA = Number(valA);
      const numB = Number(valB);
      if (numA < numB) return sortOrder === 'asc' ? -1 : 1;
      if (numA > numB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [processes, searchQuery, sortField, sortOrder]);

  return (
    <div className="space-y-4 pb-6">
      {/* Search Bar & Header */}
      <div className="bg-[#10172a] border border-[#1f293d] rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ListFilter className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-slate-100">Process & Task Monitor</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Running tasks, process IDs (PID), memory working set, and processor thread share.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="flex items-center gap-2 bg-[#0b1220] px-3 py-1.5 rounded border border-[#1f293d] w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name or PID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-slate-200 placeholder-slate-500 w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-200"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Process Table */}
      <div className="bg-[#10172a] border border-[#1f293d] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#141e36] text-slate-400 border-b border-[#1f293d]">
                <th
                  onClick={() => handleSort('pid')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1.5">
                    <span>PID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Process Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cpuPercent')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1.5">
                    <span>CPU Load</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('memoryBytes')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Memory Allocation</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">User Context</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f293d]">
              {filteredAndSorted.map((proc) => {
                const isHog = proc.cpuPercent >= 15.0;
                return (
                  <tr
                    key={proc.pid}
                    className="hover:bg-[#15203b] transition-colors font-mono"
                  >
                    <td className="py-2.5 px-4 text-slate-400">{proc.pid}</td>
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-200 flex items-center gap-2">
                      <span>{proc.name}</span>
                      {isHog && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          Active Workload
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-blue-400 font-bold">
                      {proc.cpuPercent.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-4 text-slate-300">
                      {formatBytesBinary(proc.memoryBytes, 1)} ({proc.memoryPercent.toFixed(1)}%)
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-400">{proc.user}</td>
                    <td className="py-2.5 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {proc.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-sans">
                      <button
                        onClick={() => onSelectProcessToTerminate(proc)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-700/60 text-slate-400 border border-slate-700 text-[11px] font-medium transition-colors"
                      >
                        End Task
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
