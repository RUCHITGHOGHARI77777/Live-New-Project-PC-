/**
 * WINDOWS X-RAY - Real-Time System Monitoring & Diagnostic Tool
 * Main Desktop Application Shell with Mandatory Login / Demo Gate
 */

import React, { useState, useEffect, useRef } from 'react';
import { TitleBar } from './components/TitleBar';
import { DemoBanner } from './components/DemoBanner';
import { NavigationSidebar, NavTabId } from './components/NavigationSidebar';
import { LoginGateScreen } from './components/LoginGateScreen';
import { DashboardView } from './components/views/DashboardView';
import { CpuView } from './components/views/CpuView';
import { MemoryView } from './components/views/MemoryView';
import { DiskView } from './components/views/DiskView';
import { NetworkView } from './components/views/NetworkView';
import { ProcessesView } from './components/views/ProcessesView';
import { DiagnosticsView } from './components/views/DiagnosticsView';
import { AlertsView, ActiveAlert } from './components/views/AlertsView';
import { HistoryReportsView, HistoryMetricEntry } from './components/views/HistoryReportsView';
import { SettingsView } from './components/views/SettingsView';
import { AboutView } from './components/views/AboutView';
import { SafeTerminateModal } from './components/SafeTerminateModal';

import { TelemetryService } from './logic/telemetryService';
import { DiagnosticsEngineWeb, DiagnosticItem } from './logic/diagnostics';
import { TelemetrySnapshot, ProcessItem } from './logic/metrics';

export default function App() {
  // Mandatory Login Gate State (Starts unauthenticated by default)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ username: string; isLocal: boolean } | null>(null);

  const [activeTab, setActiveTab] = useState<NavTabId>('dashboard');
  const [isDemo, setIsDemo] = useState(false);

  // Operational Settings State
  const [refreshInterval, setRefreshInterval] = useState(1.0);
  const [cpuThreshold, setCpuThreshold] = useState(85);
  const [ramThreshold, setRamThreshold] = useState(90);
  const [diskThreshold, setDiskThreshold] = useState(90);
  const [sustainedDuration, setSustainedDuration] = useState(5);
  const [cooldownSeconds, setCooldownSeconds] = useState(60);
  const [retentionDays, setRetentionDays] = useState(7);

  // Telemetry & Snapshot State
  const telemetryServiceRef = useRef<TelemetryService>(new TelemetryService(false));
  const diagnosticsEngineRef = useRef<DiagnosticsEngineWeb>(new DiagnosticsEngineWeb());

  const [snapshot, setSnapshot] = useState<TelemetrySnapshot | null>(null);
  const [processes, setProcesses] = useState<ProcessItem[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticItem[]>([]);

  // Rolling History Buffer (for charts)
  const [historyCpu, setHistoryCpu] = useState<number[]>([]);
  const [historyRam, setHistoryRam] = useState<number[]>([]);
  const [historyEntries, setHistoryEntries] = useState<HistoryMetricEntry[]>([]);

  // Alerts Management
  const [alerts, setAlerts] = useState<ActiveAlert[]>([]);
  const alertBreachStarts = useRef<{ [metric: string]: number }>({});
  const lastAlertTimes = useRef<{ [metric: string]: number }>({});

  const [processToTerminate, setProcessToTerminate] = useState<ProcessItem | null>(null);

  // Initialize and sample telemetry stream once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    telemetryServiceRef.current.setDemoMode(isDemo);

    let isMounted = true;

    const sample = async () => {
      try {
        const { snapshot: snap, processes: procs } = await telemetryServiceRef.current.getSnapshot();
        if (!isMounted) return;

        setSnapshot(snap);
        setProcesses(procs);

        // Run Diagnostics
        const findings = diagnosticsEngineRef.current.evaluate(snap, procs);
        setDiagnostics(findings);

        // Update Rolling Charts
        setHistoryCpu((prev) => {
          const next = [...prev, snap.cpuOverallPercent];
          return next.slice(-60);
        });
        setHistoryRam((prev) => {
          const next = [...prev, snap.memoryPercent];
          return next.slice(-60);
        });

        // Record History Entry
        const newEntry: HistoryMetricEntry = {
          id: `metric_${Date.now()}_${Math.random()}`,
          timestamp: Date.now(),
          cpuPercent: snap.cpuOverallPercent,
          memoryPercent: snap.memoryPercent,
          diskPercent: snap.disks.length > 0 ? snap.disks[0].percent : 0,
          netDownKbps: snap.netDownloadKbps,
          netUpKbps: snap.netUploadKbps,
          isDemo: snap.isDemo,
        };
        setHistoryEntries((prev) => [newEntry, ...prev].slice(0, 500));

        // Evaluate Alerts
        evaluateAlertRules(snap);
      } catch (err) {
        console.error('Telemetry sampling error:', err);
      }
    };

    // Initial sample
    sample();

    // Repeating timer
    const timer = setInterval(sample, refreshInterval * 1000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [isAuthenticated, isDemo, refreshInterval, cpuThreshold, ramThreshold, diskThreshold, sustainedDuration, cooldownSeconds]);

  // Alert Rule Evaluator with anti-spam cooldown and sustained duration check
  const evaluateAlertRules = (snap: TelemetrySnapshot) => {
    const now = Date.now();
    const rules = [
      { name: 'CPU Load', current: snap.cpuOverallPercent, threshold: cpuThreshold },
      { name: 'Memory Pressure', current: snap.memoryPercent, threshold: ramThreshold },
    ];
    if (snap.disks.length > 0) {
      rules.push({ name: 'Disk Space', current: snap.disks[0].percent, threshold: diskThreshold });
    }

    rules.forEach(({ name, current, threshold }) => {
      if (current >= threshold) {
        if (!alertBreachStarts.current[name]) {
          alertBreachStarts.current[name] = now;
        }
        const durationSec = (now - alertBreachStarts.current[name]) / 1000;

        if (durationSec >= sustainedDuration) {
          const lastAlert = lastAlertTimes.current[name] || 0;
          if ((now - lastAlert) / 1000 >= cooldownSeconds) {
            const newAlert: ActiveAlert = {
              id: `alert_${Date.now()}_${name.replace(/\s+/g, '_')}`,
              metricName: name,
              currentValue: current,
              thresholdValue: threshold,
              severity: current >= threshold + 7 ? 'critical' : 'warning',
              message: `${name} sustained at ${current.toFixed(1)}% (threshold: ${threshold}%) for ${durationSec.toFixed(0)}s`,
              timestamp: now,
            };
            setAlerts((prev) => [newAlert, ...prev].slice(0, 30));
            lastAlertTimes.current[name] = now;
          }
        }
      } else {
        delete alertBreachStarts.current[name];
      }
    });
  };

  // Safe process termination confirmed
  const handleConfirmTerminateProcess = (proc: ProcessItem) => {
    setProcesses((prev) => prev.filter((p) => p.pid !== proc.pid));
    setProcessToTerminate(null);
  };

  // ZIP Download Handler
  const handleDownloadZip = () => {
    const link = document.createElement('a');
    link.href = '/WindowsXRay-v1.0.0-Source.zip';
    link.download = 'WindowsXRay-v1.0.0-Source.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Safe defaults reset
  const handleResetDefaults = () => {
    setRefreshInterval(1.0);
    setCpuThreshold(85);
    setRamThreshold(90);
    setDiskThreshold(90);
    setSustainedDuration(5);
    setCooldownSeconds(60);
    setRetentionDays(7);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setSnapshot(null);
  };

  // 1. MANDATORY LOGIN / SIGN UP GATE SCREEN
  if (!isAuthenticated) {
    return (
      <LoginGateScreen
        onAuthenticated={(user) => {
          setCurrentUser(user);
          setIsDemo(false);
          setIsAuthenticated(true);
        }}
        onEnterDemo={() => {
          setCurrentUser({ username: 'Evaluator (Demo)', isLocal: true });
          setIsDemo(true);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  // 2. INITIALIZING SCREEN
  if (!snapshot) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-[#f4f4f5] font-sans">
        <div className="flex items-center gap-3 bg-[#121215] border border-[#27272a] px-5 py-3 rounded-lg shadow-xl">
          <div className="w-4 h-4 border-2 border-[#38bdf8] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold tracking-wide text-[#a1a1aa]">
            Initializing Windows X-Ray Hardware Sensors...
          </span>
        </div>
      </div>
    );
  }

  // 3. MAIN AUTHENTICATED DESKTOP UTILITY INTERFACE
  return (
    <div className="h-screen w-screen bg-[#09090b] text-[#f4f4f5] flex flex-col overflow-hidden font-sans select-none">
      {/* Windows Native Title Bar */}
      <TitleBar
        isDemo={isDemo}
        currentUser={currentUser}
        onToggleDemo={() => setIsDemo(!isDemo)}
        onDownloadZip={handleDownloadZip}
        onLogout={handleLogout}
      />

      {/* Mode State Notice Banner */}
      <DemoBanner
        isDemo={isDemo}
        onReturnToLive={() => setIsDemo(false)}
        onSwitchToDemo={() => setIsDemo(true)}
      />

      {/* Main Desktop App Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Nav Sidebar */}
        <NavigationSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          activeAlertCount={alerts.length}
          currentUser={currentUser}
          onLogout={handleLogout}
          onDownloadZip={handleDownloadZip}
        />

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto bg-[#09090b] p-4">
          {activeTab === 'dashboard' && (
            <DashboardView
              snapshot={snapshot}
              processes={processes}
              diagnostics={diagnostics}
              historyCpu={historyCpu}
              historyRam={historyRam}
              onNavigateTab={(tab) => setActiveTab(tab as NavTabId)}
            />
          )}

          {activeTab === 'cpu' && (
            <CpuView
              snapshot={snapshot}
              historyCpu={historyCpu}
              refreshInterval={refreshInterval}
              onChangeInterval={setRefreshInterval}
            />
          )}

          {activeTab === 'memory' && (
            <MemoryView
              snapshot={snapshot}
              memoryThreshold={ramThreshold}
            />
          )}

          {activeTab === 'disk' && (
            <DiskView
              snapshot={snapshot}
              diskThreshold={diskThreshold}
            />
          )}

          {activeTab === 'network' && (
            <NetworkView snapshot={snapshot} />
          )}

          {activeTab === 'processes' && (
            <ProcessesView
              processes={processes}
              onSelectProcessToTerminate={setProcessToTerminate}
            />
          )}

          {activeTab === 'diagnostics' && (
            <DiagnosticsView diagnostics={diagnostics} />
          )}

          {activeTab === 'alerts' && (
            <AlertsView
              alerts={alerts}
              cpuThreshold={cpuThreshold}
              ramThreshold={ramThreshold}
              diskThreshold={diskThreshold}
              sustainedDuration={sustainedDuration}
              cooldownSeconds={cooldownSeconds}
              onDismissAlert={(id) => setAlerts((prev) => prev.filter((a) => a.id !== id))}
              onClearAllAlerts={() => setAlerts([])}
              onChangeCpuThreshold={setCpuThreshold}
              onChangeRamThreshold={setRamThreshold}
              onChangeDiskThreshold={setDiskThreshold}
              onChangeSustainedDuration={setSustainedDuration}
              onChangeCooldown={setCooldownSeconds}
            />
          )}

          {activeTab === 'history' && (
            <HistoryReportsView
              snapshot={snapshot}
              historyEntries={historyEntries}
              diagnostics={diagnostics}
              topProcesses={processes}
              retentionDays={retentionDays}
              onChangeRetentionDays={setRetentionDays}
              onClearHistory={() => setHistoryEntries([])}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              refreshInterval={refreshInterval}
              cpuThreshold={cpuThreshold}
              ramThreshold={ramThreshold}
              diskThreshold={diskThreshold}
              retentionDays={retentionDays}
              sustainedDuration={sustainedDuration}
              cooldownSeconds={cooldownSeconds}
              onChangeInterval={setRefreshInterval}
              onChangeCpuThreshold={setCpuThreshold}
              onChangeRamThreshold={setRamThreshold}
              onChangeDiskThreshold={setDiskThreshold}
              onChangeRetentionDays={setRetentionDays}
              onChangeSustainedDuration={setSustainedDuration}
              onChangeCooldown={setCooldownSeconds}
              onResetDefaults={handleResetDefaults}
            />
          )}

          {activeTab === 'about' && (
            <AboutView onDownloadZip={handleDownloadZip} />
          )}
        </main>
      </div>

      {/* Safe Process Termination Risk Modal */}
      <SafeTerminateModal
        process={processToTerminate}
        onConfirm={handleConfirmTerminateProcess}
        onClose={() => setProcessToTerminate(null)}
      />
    </div>
  );
}
