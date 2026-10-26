"""
Windows X-Ray - Explainable Diagnostics Engine
Evaluates telemetry against deterministic rule sets.
Labels all findings as potential causes, not definitive diagnoses.
"""

import time
from typing import List
from app.models import SystemSnapshot, ProcessInfo, DiagnosticFinding


class DiagnosticsEngine:
    """Evaluates telemetry rules to generate explainable diagnostic findings."""

    def __init__(self):
        self._cpu_sustained_counter = 0

    def analyze(self, snapshot: SystemSnapshot, processes: List[ProcessInfo]) -> List[DiagnosticFinding]:
        findings: List[DiagnosticFinding] = []
        now = time.time()

        # Rule 1: Sustained High CPU Utilization
        if snapshot.cpu_overall_percent >= 85.0:
            self._cpu_sustained_counter += 1
        else:
            self._cpu_sustained_counter = max(0, self._cpu_sustained_counter - 1)

        if self._cpu_sustained_counter >= 3:
            findings.append(DiagnosticFinding(
                id="diag_cpu_sustained",
                title="Sustained High CPU Load Observed",
                severity="warning" if snapshot.cpu_overall_percent < 95.0 else "critical",
                evidence=f"Total CPU load is at {snapshot.cpu_overall_percent:.1f}% across {snapshot.logical_cores} logical threads for consecutive readings.",
                threshold="Threshold: sustained CPU >= 85% for 3+ consecutive samples.",
                timestamp=now,
                practical_step="Check the Processes tab to identify non-essential tasks consuming cycles, or consider cooling airflow if throttling occurs.",
                category="CPU",
            ))

        # Rule 2: High Memory Pressure
        if snapshot.memory_percent >= 88.0:
            severity = "critical" if snapshot.memory_percent >= 94.0 else "warning"
            used_gib = snapshot.memory_used_bytes / (1024 ** 3)
            total_gib = snapshot.memory_total_bytes / (1024 ** 3)
            avail_gib = snapshot.memory_available_bytes / (1024 ** 3)
            findings.append(DiagnosticFinding(
                id="diag_mem_pressure",
                title="Elevated Memory Allocation",
                severity=severity,
                evidence=f"Physical RAM allocation is {snapshot.memory_percent:.1f}% ({used_gib:.2f} GiB used / {total_gib:.2f} GiB total, {avail_gib:.2f} GiB remaining available).",
                threshold="Threshold: RAM usage >= 88.0%.",
                timestamp=now,
                practical_step="Close unused browser tabs, background IDE instances, or virtual machines to free memory before paging spikes disk activity.",
                category="Memory",
            ))

        # Rule 3: Low Disk Free Space
        for disk in snapshot.disks:
            if disk.percent >= 88.0:
                severity = "critical" if disk.percent >= 95.0 else "warning"
                free_gb = disk.free_bytes / (1000 ** 3)
                clean_mount = disk.mountpoint.replace(':', '').replace('\\', '').replace('/', '')
                findings.append(DiagnosticFinding(
                    id=f"diag_disk_low_{clean_mount}",
                    title=f"Low Free Space on Drive ({disk.mountpoint})",
                    severity=severity,
                    evidence=f"Volume {disk.mountpoint} is {disk.percent:.1f}% occupied with only {free_gb:.2f} GB available.",
                    threshold="Threshold: volume utilization >= 88.0%.",
                    timestamp=now,
                    practical_step="Run Windows Disk Cleanup (cleanmgr.exe) to purge temporary files, or relocate large downloads to external storage.",
                    category="Disk",
                ))

        # Rule 4: Heavy Disk I/O Saturation
        total_io_kbps = snapshot.disk_read_kbps + snapshot.disk_write_kbps
        if total_io_kbps >= 80_000.0:  # ~80 MB/s
            findings.append(DiagnosticFinding(
                id="diag_disk_io_heavy",
                title="High Active Disk Throughput",
                severity="info",
                evidence=f"Active disk operations at {total_io_kbps / 1024.0:.1f} MB/s (Read: {snapshot.disk_read_kbps / 1024.0:.1f} MB/s, Write: {snapshot.disk_write_kbps / 1024.0:.1f} MB/s).",
                threshold="Threshold: combined disk I/O >= 80.0 MB/s.",
                timestamp=now,
                practical_step="This is typical during active file transfers, database updates, or game installations. Review Processes tab if unexpected.",
                category="Disk",
            ))

        # Rule 5: Single Process Resource Hog
        for proc in processes[:5]:
            if proc.cpu_percent >= 55.0 and proc.name.lower() not in ("system idle process", "idle"):
                findings.append(DiagnosticFinding(
                    id=f"diag_proc_hog_{proc.pid}",
                    title=f"Dominant Process CPU Consumption: {proc.name}",
                    severity="warning",
                    evidence=f"Process '{proc.name}' (PID: {proc.pid}) is using {proc.cpu_percent:.1f}% of total CPU capacity.",
                    threshold="Threshold: single non-idle process >= 55.0% CPU.",
                    timestamp=now,
                    practical_step="Verify if this application is actively rendering or compiling. If it is unresponsive, save work and close it safely.",
                    category="Process",
                ))
                break

        # Fallback if everything is optimal
        if not findings:
            findings.append(DiagnosticFinding(
                id="diag_all_optimal",
                title="System Operating Within Balanced Thresholds",
                severity="info",
                evidence=f"CPU at {snapshot.cpu_overall_percent:.1f}%, RAM at {snapshot.memory_percent:.1f}%, all monitored disks have adequate headroom.",
                threshold="No active warnings or stress thresholds breached.",
                timestamp=now,
                practical_step="No immediate action required. System resources are operating normally.",
                category="General",
            ))

        return findings
