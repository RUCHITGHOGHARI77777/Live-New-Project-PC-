import React, { useState, useMemo } from 'react';
import { ListFilter, Search, ArrowUpDown, XCircle } from 'lucide-react';
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
      <div className="bg-[#121215] border border-[#27272a] rounded p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ListFilter className="w-5 h-5 text-[#38bdf8]" />
            <h2 className="text-base font-bold text-[#fafafa]">Process & Task Inspection</h2>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-1">
            Running tasks, process IDs (PID), memory working set, and processor thread share.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="flex items-center gap-2 bg-[#09090b] px-3 py-1.5 rounded border border-[#27272a] w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#71717a] shrink-0" />
          <input
            type="text"
            placeholder="Search by name or PID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-[#f4f4f5] placeholder-[#52525b] w-full font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#71717a] hover:text-[#fafafa] cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Process Table */}
      <div className="bg-[#121215] border border-[#27272a] rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#18181b] text-[#a1a1aa] border-b border-[#27272a]">
                <th
                  onClick={() => handleSort('pid')}
                  className="py-2.5 px-4 font-semibold cursor-pointer hover:text-[#fafafa]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>PID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-2.5 px-4 font-semibold cursor-pointer hover:text-[#fafafa]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Process Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cpuPercent')}
                  className="py-2.5 px-4 font-semibold cursor-pointer hover:text-[#fafafa]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>CPU Load</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('memoryBytes')}
                  className="py-2.5 px-4 font-semibold cursor-pointer hover:text-[#fafafa]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Memory Working Set</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-4 font-semibold">Security Context</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
                <th className="py-2.5 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {filteredAndSorted.map((proc) => {
                const isHog = proc.cpuPercent >= 15.0;
                return (
                  <tr
                    key={proc.pid}
                    className="hover:bg-[#18181b] transition-colors font-mono"
                  >
                    <td className="py-2 px-4 text-[#71717a]">{proc.pid}</td>
                    <td className="py-2 px-4 font-sans font-medium text-[#f4f4f5] flex items-center gap-2">
                      <span>{proc.name}</span>
                      {isHog && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#18181b] text-[#38bdf8] border border-[#27272a]">
                          Active Workload
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-[#38bdf8] font-bold">
                      {proc.cpuPercent.toFixed(1)}%
                    </td>
                    <td className="py-2 px-4 text-[#d4d4d8]">
                      {formatBytesBinary(proc.memoryBytes, 1)} ({proc.memoryPercent.toFixed(1)}%)
                    </td>
                    <td className="py-2 px-4 font-sans text-[#71717a]">{proc.user}</td>
                    <td className="py-2 px-4 font-sans">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
                        {proc.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-right font-sans">
                      <button
                        onClick={() => onSelectProcessToTerminate(proc)}
                        className="px-2 py-0.5 rounded bg-[#18181b] hover:bg-rose-950 hover:text-rose-300 hover:border-rose-700/60 text-[#a1a1aa] border border-[#27272a] text-[11px] font-medium transition-colors cursor-pointer"
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
