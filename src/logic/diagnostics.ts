/**
 * Windows X-Ray - Explainable Diagnostics Logic
 */

import { TelemetrySnapshot, ProcessItem } from './metrics';

export interface DiagnosticItem {
  id: string;
  category: 'CPU' | 'Memory' | 'Disk' | 'Network' | 'Process' | 'General';
  title: string;
  severity: 'info' | 'warning' | 'critical';
  evidence: string;
  threshold: string;
  practicalStep: string;
  timestamp: number;
}

export class DiagnosticsEngineWeb {
  private sustainedCpuCount: number = 0;

  public evaluate(snapshot: TelemetrySnapshot, processes: ProcessItem[]): DiagnosticItem[] {
    const findings: DiagnosticItem[] = [];
    const now = Date.now();

    // 1. CPU Rule: Sustained High CPU
    if (snapshot.cpuOverallPercent >= 85.0) {
      this.sustainedCpuCount += 1;
    } else {
      this.sustainedCpuCount = Math.max(0, this.sustainedCpuCount - 1);
    }

    if (this.sustainedCpuCount >= 3) {
      findings.push({
        id: 'diag-cpu-sustained',
        category: 'CPU',
        title: 'Sustained High CPU Utilization',
        severity: snapshot.cpuOverallPercent >= 95 ? 'critical' : 'warning',
        evidence: `Processor overall load is at ${snapshot.cpuOverallPercent.toFixed(1)}% across ${snapshot.logicalCores} logical threads for multiple consecutive intervals.`,
        threshold: 'Trigger threshold: sustained CPU >= 85% for 3+ consecutive readings.',
        practicalStep: 'Examine the active Tasks list in the Processes tab to verify what background worker or compile process is active.',
        timestamp: now,
      });
    }

    // 2. Memory Pressure Rule
    if (snapshot.memoryPercent >= 88.0) {
      const severity = snapshot.memoryPercent >= 95.0 ? 'critical' : 'warning';
      const usedGiB = (snapshot.memoryUsedBytes / Math.pow(1024, 3)).toFixed(2);
      const totalGiB = (snapshot.memoryTotalBytes / Math.pow(1024, 3)).toFixed(2);
      findings.push({
        id: 'diag-mem-pressure',
        category: 'Memory',
        title: 'High RAM Allocation Pressure',
        severity,
        evidence: `Physical RAM usage is at ${snapshot.memoryPercent.toFixed(1)}% (${usedGiB} GiB / ${totalGiB} GiB allocated).`,
        threshold: 'Trigger threshold: system RAM allocation >= 88.0%.',
        practicalStep: 'Close background memory-heavy browser tabs or idle background apps before memory paging causes storage thrashing.',
        timestamp: now,
      });
    }

    // 3. Disk Space Rule
    for (const disk of snapshot.disks) {
      if (disk.percent >= 88.0) {
        const severity = disk.percent >= 95.0 ? 'critical' : 'warning';
        const freeGB = (disk.freeBytes / Math.pow(1000, 3)).toFixed(1);
        findings.push({
          id: `diag-disk-space-${disk.mount.replace(/[^a-zA-Z0-9]/g, '')}`,
          category: 'Disk',
          title: `Low Free Storage Capacity on Volume (${disk.mount})`,
          severity,
          evidence: `Partition ${disk.mount} is ${disk.percent.toFixed(1)}% full with only ${freeGB} GB free storage remaining.`,
          threshold: 'Trigger threshold: volume occupancy >= 88.0%.',
          practicalStep: 'Execute Windows Disk Cleanup (cleanmgr.exe) or inspect large cache directories in %TEMP% and user Downloads.',
          timestamp: now,
        });
      }
    }

    // 4. Heavy Disk I/O Saturation
    const totalIoKbps = snapshot.diskReadKbps + snapshot.diskWriteKbps;
    if (totalIoKbps >= 70000) { // ~70 MB/s
      findings.push({
        id: 'diag-disk-io-heavy',
        category: 'Disk',
        title: 'Heavy Active Storage I/O Operations',
        severity: 'info',
        evidence: `Combined active disk throughput is ${(totalIoKbps / 1024).toFixed(1)} MB/s (Read: ${(snapshot.diskReadKbps / 1024).toFixed(1)} MB/s, Write: ${(snapshot.diskWriteKbps / 1024).toFixed(1)} MB/s).`,
        threshold: 'Trigger threshold: combined storage I/O >= 70.0 MB/s.',
        practicalStep: 'This is expected during file extraction, game updates, or virtual machine disk sync. Check Processes tab if sustained.',
        timestamp: now,
      });
    }

    // 5. Dominant Process Rule
    if (processes.length > 0) {
      const top = processes[0];
      if (top.cpuPercent >= 55.0 && top.name.toLowerCase() !== 'system idle process') {
        findings.push({
          id: `diag-proc-hog-${top.pid}`,
          category: 'Process',
          title: `Resource-Intensive Task: ${top.name}`,
          severity: 'warning',
          evidence: `Process '${top.name}' (PID ${top.pid}) is consuming ${top.cpuPercent.toFixed(1)}% CPU capacity.`,
          threshold: 'Trigger threshold: single application process >= 55.0% CPU load.',
          practicalStep: 'Verify if this task is actively doing requested work. If it is hanging or unresponsive, terminate it from the Processes view.',
          timestamp: now,
        });
      }
    }

    // Fallback if healthy
    if (findings.length === 0) {
      findings.push({
        id: 'diag-nominal',
        category: 'General',
        title: 'System Operating Within Balanced Thresholds',
        severity: 'info',
        evidence: `Processor load (${snapshot.cpuOverallPercent.toFixed(1)}%) and RAM (${snapshot.memoryPercent.toFixed(1)}%) are in normal operating envelopes with no drive bottlenecks.`,
        threshold: 'All monitored hardware metrics remain under configured stress thresholds.',
        practicalStep: 'No action needed. System is running cleanly.',
        timestamp: now,
      });
    }

    return findings;
  }
}
