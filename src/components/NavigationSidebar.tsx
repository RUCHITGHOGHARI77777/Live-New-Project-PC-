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
  onOpenAuth: () => void;
  onLogout: () => void;
  onDownloadZip: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeTab,
  onSelectTab,
  activeAlertCount,
  currentUser,
  onOpenAuth,
  onLogout,
  onDownloadZip,
}) => {
  const navItems: { id: NavTabId; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cpu', label: 'CPU', icon: Cpu },
    { id: 'memory', label: 'Memory', icon: CircuitBoard },
    { id: 'disk', label: 'Disk Volumes', icon: HardDrive },
    { id: 'network', label: 'Network', icon: Activity },
    { id: 'processes', label: 'Processes', icon: ListFilter },
    { id: 'diagnostics', label: 'Diagnostics', icon: Stethoscope },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: activeAlertCount },
    { id: 'history', label: 'History / Reports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about', label: 'About & Privacy', icon: ShieldAlert },
  ];

  return (
    <aside className="w-56 bg-[#0c1222] border-r border-[#1f293d] flex flex-col justify-between select-none shrink-0">
      {/* Top Nav Items */}
      <div className="py-3 px-2 space-y-0.5">
        <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          System Monitors
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Profile & Download Section */}
      <div className="p-3 border-t border-[#1f293d] bg-[#090d1a] space-y-2">
        {/* Quick Download Button */}
        <button
          onClick={onDownloadZip}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700/90 text-blue-300 border border-slate-700 rounded text-xs font-medium transition-colors"
        >
          <FolderDown className="w-3.5 h-3.5 text-blue-400" />
          <span>Download Source (.zip)</span>
        </button>

        {/* User Account / Auth Status */}
        {currentUser ? (
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {currentUser.username}
                </div>
                <div className="text-[10px] text-emerald-400">Offline Local Profile</div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium transition-colors"
          >
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Local Account / Sign In</span>
          </button>
        )}
      </div>
    </aside>
  );
};
