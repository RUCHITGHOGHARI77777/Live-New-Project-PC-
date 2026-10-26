import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  CircuitBoard,
  HardDrive,
  Activity,
  ListFilter,
  Stethoscope,
  Bell,
  FileSpreadsheet,
  Settings,
  ShieldAlert,
  User,
  LogOut,
  FolderDown,
} from 'lucide-react';

export type NavTabId =
  | 'dashboard'
  | 'cpu'
  | 'memory'
  | 'disk'
  | 'network'
  | 'processes'
  | 'diagnostics'
  | 'alerts'
  | 'history'
  | 'settings'
  | 'about';

interface NavigationSidebarProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  activeAlertCount: number;
  currentUser: { username: string } | null;
  onLogout: () => void;
  onDownloadZip: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeTab,
  onSelectTab,
  activeAlertCount,
  currentUser,
  onLogout,
  onDownloadZip,
}) => {
  const navItems: { id: NavTabId; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cpu', label: 'CPU Performance', icon: Cpu },
    { id: 'memory', label: 'Memory Allocation', icon: CircuitBoard },
    { id: 'disk', label: 'Storage Drives', icon: HardDrive },
    { id: 'network', label: 'Network Throughput', icon: Activity },
    { id: 'processes', label: 'Processes & Tasks', icon: ListFilter },
    { id: 'diagnostics', label: 'Diagnostics Engine', icon: Stethoscope },
    { id: 'alerts', label: 'Alert Policies', icon: Bell, badge: activeAlertCount },
    { id: 'history', label: 'History & Reports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Configuration', icon: Settings },
    { id: 'about', label: 'About & Manual', icon: ShieldAlert },
  ];

  return (
    <aside className="w-56 bg-[#0c0c0e] border-r border-[#27272a] flex flex-col justify-between select-none shrink-0">
      {/* Top Nav Items */}
      <div className="py-2.5 px-2 space-y-0.5">
        <div className="px-3 py-1.5 text-[11px] font-bold text-[#71717a] uppercase tracking-wider">
          System Monitors
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#18181b] text-[#fafafa] border border-[#3f3f46]'
                  : 'text-[#a1a1aa] hover:bg-[#121215] hover:text-[#f4f4f5] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#38bdf8]' : 'text-[#71717a]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#ef4444] text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Profile & Download Section */}
      <div className="p-2.5 border-t border-[#27272a] bg-[#09090b] space-y-2">
        {/* Quick Download Button */}
        <button
          onClick={onDownloadZip}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#18181b] hover:bg-[#27272a] text-[#e4e4e7] border border-[#27272a] rounded text-xs font-medium transition-colors cursor-pointer"
        >
          <FolderDown className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>Download Package (.zip)</span>
        </button>

        {/* User Account / Auth Status */}
        {currentUser && (
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#121215] border border-[#27272a]">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-6 h-6 rounded bg-[#18181b] text-[#38bdf8] flex items-center justify-center shrink-0 border border-[#27272a]">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-[#f4f4f5] truncate">
                  {currentUser.username}
                </div>
                <div className="text-[10px] text-[#22c55e]">Local Profile</div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1 text-[#71717a] hover:text-[#ef4444] transition-colors cursor-pointer"
              title="Lock / Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
