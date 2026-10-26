#!/usr/bin/env python3
"""
WINDOWS X-RAY
Tagline: Real-Time System Monitoring & Diagnostic Tool
Version: 1.0.0
Entry point for Windows 10/11 desktop application.
"""

import sys
import argparse
import time
from app.constants import APP_NAME, APP_VERSION, APP_TAGLINE
from app.config import ConfigManager
from app.services.database import DatabaseManager
from app.services.system_monitor import SystemMonitorService
from app.services.demo_service import DemoTelemetryService
from app.services.diagnostics_engine import DiagnosticsEngine
from app.services.alert_manager import AlertManager
from app.services.report_exporter import ReportExporter


def run_cli_diagnostic(is_demo: bool = False):
    """Executes a complete command-line diagnostic check."""
    print("=" * 70)
    print(f"  {APP_NAME} v{APP_VERSION} - {APP_TAGLINE}")
    print("=" * 70)
    print(f"Mode: {'DEMO (Simulated Telemetry)' if is_demo else 'LIVE (Hardware Sensors)'}")

    config_mgr = ConfigManager()
    settings, status_msg = config_mgr.load_settings()
    db = DatabaseManager()
    exporter = ReportExporter(config_mgr.config_path.parent / "reports")

    service = DemoTelemetryService() if is_demo else SystemMonitorService()
    snapshot, procs = service.get_snapshot()

    print(f"\n[HOST INFORMATION]")
    print(f"  OS:                 {snapshot.os_name} ({snapshot.os_version})")
    print(f"  CPU Model:          {snapshot.cpu_model}")
    print(f"  Cores:              {snapshot.physical_cores} Physical / {snapshot.logical_cores} Logical")
    print(f"  Overall CPU Load:   {snapshot.cpu_overall_percent:.1f}%")
    print(f"  Total RAM:          {snapshot.memory_total_bytes / (1024**3):.2f} GiB")
    print(f"  RAM Allocated:      {snapshot.memory_used_bytes / (1024**3):.2f} GiB ({snapshot.memory_percent:.1f}%)")
    print(f"  System Uptime:      {int(snapshot.uptime_sec // 3600)}h {int((snapshot.uptime_sec % 3600) // 60)}m")

    print(f"\n[STORAGE VOLUMES]")
    for d in snapshot.disks:
        total_gb = d.total_bytes / (1000**3)
        used_gb = d.used_bytes / (1000**3)
        free_gb = d.free_bytes / (1000**3)
        print(f"  {d.mountpoint:<10} {d.percent:5.1f}% used | Free: {free_gb:6.2f} GB | Total: {total_gb:6.2f} GB ({d.fstype})")

    print(f"\n[NETWORK ACTIVITY]")
    print(f"  Download Throughput: {snapshot.net_download_kbps:.1f} KB/s")
    print(f"  Upload Throughput:   {snapshot.net_upload_kbps:.1f} KB/s")

    print(f"\n[DIAGNOSTIC FINDINGS]")
    engine = DiagnosticsEngine()
    findings = engine.analyze(snapshot, procs)
    for f in findings:
        badge = f"[{f.severity.upper()}]"
        print(f"  {badge:<10} {f.title}")
        print(f"             Evidence:  {f.evidence}")
        print(f"             Next Step: {f.practical_step}\n")

    # Save to SQLite
    db.record_metrics_snapshot(
        cpu_percent=snapshot.cpu_overall_percent,
        memory_percent=snapshot.memory_percent,
        disk_max_percent=max([d.percent for d in snapshot.disks]) if snapshot.disks else 0.0,
        net_download_kbps=snapshot.net_download_kbps,
        net_upload_kbps=snapshot.net_upload_kbps,
        is_demo=is_demo,
    )
    print(f"[OK] Telemetry logged to SQLite local database.")


def main():
    parser = argparse.ArgumentParser(description=f"{APP_NAME} - {APP_TAGLINE}")
    parser.add_argument("--demo", action="store_true", help="Launch in Demo Mode with simulated telemetry")
    parser.add_argument("--cli", action="store_true", help="Run a quick diagnostic audit directly in the console")
    parser.add_argument("--test", action="store_true", help="Run automated unit test suite")
    args = parser.parse_args()

    if args.test:
        import unittest
        suite = unittest.defaultTestLoader.discover("tests")
        runner = unittest.TextTestRunner(verbosity=2)
        res = runner.run(suite)
        sys.exit(0 if res.wasSuccessful() else 1)

    if args.cli:
        run_cli_diagnostic(is_demo=args.demo)
        return

    # Attempt GUI Launch
    try:
        from app.ui.main_window import MainWindow
        win = MainWindow(is_demo_initial=args.demo)
        sys.exit(win.run())
    except Exception as e:
        print(f"[NOTICE] Desktop GUI window could not be opened in this environment ({e}).")
        print("Running in console diagnostic mode instead:\n")
        run_cli_diagnostic(is_demo=args.demo)


if __name__ == "__main__":
    main()
