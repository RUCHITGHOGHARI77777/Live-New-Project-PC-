"""
Windows X-Ray - Report Exporter Service
Generates sanitized CSV and standalone HTML Diagnostic & Performance Reports.
Protects against path traversal attacks.
"""

import os
import csv
import time
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Tuple
from app.models import SystemSnapshot, DiagnosticFinding, ProcessInfo
from app.constants import APP_NAME, APP_VERSION, APP_TAGLINE


def sanitize_export_path(base_folder: Path, filename: str) -> Path:
    """
    Prevents path traversal by resolving the target path and verifying it stays within base folder.
    """
    safe_name = os.path.basename(filename).replace("..", "").replace("/", "").replace("\\", "")
    target = (base_folder / safe_name).resolve()
    base_resolved = base_folder.resolve()
    if not str(target).startswith(str(base_resolved)):
        raise ValueError("Invalid target filename: Path traversal attempt detected.")
    return target


class ReportExporter:
    """Exports metrics history, diagnostics, and machine state."""

    def __init__(self, export_dir: Path):
        self.export_dir = Path(export_dir)
        self.export_dir.mkdir(parents=True, exist_ok=True)

    def export_csv(
        self,
        snapshot: SystemSnapshot,
        metrics_history: List[Dict[str, Any]],
        filename: str = None,
    ) -> Tuple[bool, str, str]:
        """
        Exports metrics history to a structured CSV file with metadata header.
        Returns (success, message, filepath).
        """
        if not filename:
            timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"WindowsXRay_Metrics_{timestamp_str}.csv"

        try:
            target_path = sanitize_export_path(self.export_dir, filename)
            with open(target_path, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                # Metadata header
                writer.writerow([f"# {APP_NAME} v{APP_VERSION} Performance Export"])
                writer.writerow([f"# Export Timestamp: {datetime.now().isoformat()}"])
                writer.writerow([f"# Machine OS: {snapshot.os_name} {snapshot.os_version}"])
                writer.writerow([f"# CPU: {snapshot.cpu_model} ({snapshot.logical_cores} Logical Cores)"])
                writer.writerow([f"# Total Memory: {snapshot.memory_total_bytes / (1024**3):.2f} GiB"])
                writer.writerow([f"# Mode: {'DEMO' if snapshot.is_demo else 'LIVE'}"])
                writer.writerow([])
                # Column headers with explicit units
                writer.writerow([
                    "Timestamp_ISO",
                    "Unix_Timestamp_Seconds",
                    "CPU_Overall_Percent",
                    "Memory_Used_Percent",
                    "Disk_Max_Percent",
                    "Network_Download_KBps",
                    "Network_Upload_KBps",
                    "Is_Demo_Flag"
                ])
                for row in metrics_history:
                    dt = datetime.fromtimestamp(row["timestamp"]).isoformat()
                    writer.writerow([
                        dt,
                        f"{row['timestamp']:.2f}",
                        f"{row['cpu_percent']:.2f}",
                        f"{row['memory_percent']:.2f}",
                        f"{row['disk_max_percent']:.2f}",
                        f"{row['net_download_kbps']:.2f}",
                        f"{row['net_upload_kbps']:.2f}",
                        row.get("is_demo", 0)
                    ])

            return True, f"CSV exported successfully to {target_path.name}", str(target_path)
        except Exception as e:
            return False, f"Failed to export CSV: {e}", ""

    def export_html_report(
        self,
        snapshot: SystemSnapshot,
        diagnostics: List[DiagnosticFinding],
        top_processes: List[ProcessInfo],
        filename: str = None,
    ) -> Tuple[bool, str, str]:
        """
        Exports a self-contained, responsive, printable HTML diagnostic audit report.
        Returns (success, message, filepath).
        """
        if not filename:
            timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"WindowsXRay_Report_{timestamp_str}.html"

        try:
            target_path = sanitize_export_path(self.export_dir, filename)

            # Build diagnostics table rows
            diag_rows_html = ""
            for item in diagnostics:
                badge_color = "#10b981" if item.severity == "info" else ("#f59e0b" if item.severity == "warning" else "#ef4444")
                diag_rows_html += f"""
                <tr style="border-bottom: 1px solid #1f293d;">
                    <td style="padding: 12px; font-weight: bold; color: #f1f5f9;">
                        <span style="display:inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; background: {badge_color}; color: #000; margin-right: 8px;">
                            {item.severity.upper()}
                        </span>
                        {item.title}
                    </td>
                    <td style="padding: 12px; color: #cbd5e1;">{item.evidence}</td>
                    <td style="padding: 12px; color: #94a3b8; font-size: 12px;">{item.threshold}</td>
                    <td style="padding: 12px; color: #60a5fa;">{item.practical_step}</td>
                </tr>
                """

            # Build processes table rows
            proc_rows_html = ""
            for proc in top_processes[:10]:
                mem_mb = proc.memory_bytes / (1024 * 1024)
                proc_rows_html += f"""
                <tr style="border-bottom: 1px solid #1f293d;">
                    <td style="padding: 10px; font-family: monospace; color: #94a3b8;">{proc.pid}</td>
                    <td style="padding: 10px; font-weight: 500; color: #f1f5f9;">{proc.name}</td>
                    <td style="padding: 10px; color: #60a5fa;">{proc.cpu_percent:.1f}%</td>
                    <td style="padding: 10px; color: #cbd5e1;">{mem_mb:.1f} MB ({proc.memory_percent:.1f}%)</td>
                    <td style="padding: 10px; color: #94a3b8;">{proc.status}</td>
                </tr>
                """

            # Build drive details
            disks_html = ""
            for d in snapshot.disks:
                total_gb = d.total_bytes / (1000**3)
                used_gb = d.used_bytes / (1000**3)
                free_gb = d.free_bytes / (1000**3)
                disks_html += f"""
                <div style="background: #111827; border: 1px solid #1f293d; border-radius: 8px; padding: 14px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 6px;">
                        <span>Drive {d.mountpoint} ({d.fstype})</span>
                        <span style="color: #60a5fa;">{d.percent:.1f}% Used</span>
                    </div>
                    <div style="background: #1f293d; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 8px;">
                        <div style="background: #3b82f6; width: {d.percent}%; height: 100%;"></div>
                    </div>
                    <div style="font-size: 12px; color: #94a3b8; display: flex; justify-content: space-between;">
                        <span>Used: {used_gb:.2f} GB</span>
                        <span>Free: {free_gb:.2f} GB</span>
                        <span>Total: {total_gb:.2f} GB</span>
                    </div>
                </div>
                """

            html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{APP_NAME} - Diagnostic Audit Report</title>
    <style>
        body {{
            background-color: #0a0f1d;
            color: #f1f5f9;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 30px;
            line-height: 1.5;
        }}
        .container {{
            max-width: 1000px;
            margin: 0 auto;
        }}
        .header {{
            border-bottom: 2px solid #1f293d;
            padding-bottom: 20px;
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }}
        .title {{
            font-size: 26px;
            font-weight: 800;
            color: #3b82f6;
            margin: 0;
        }}
        .tagline {{
            color: #94a3b8;
            font-size: 13px;
            margin-top: 4px;
        }}
        .meta-card {{
            background: #111827;
            border: 1px solid #1f293d;
            border-radius: 8px;
            padding: 18px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 25px;
        }}
        .meta-item-label {{
            font-size: 11px;
            text-transform: uppercase;
            color: #94a3b8;
            letter-spacing: 0.05em;
        }}
        .meta-item-value {{
            font-size: 15px;
            font-weight: 600;
            color: #f1f5f9;
            margin-top: 4px;
        }}
        .section-title {{
            font-size: 18px;
            font-weight: 700;
            color: #e2e8f0;
            margin: 25px 0 12px 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            background: #111827;
            border: 1px solid #1f293d;
            border-radius: 8px;
            overflow: hidden;
            font-size: 13px;
        }}
        th {{
            background: #162032;
            padding: 12px;
            text-align: left;
            color: #94a3b8;
            font-weight: 600;
            border-bottom: 1px solid #1f293d;
        }}
        .disclaimer {{
            margin-top: 35px;
            padding: 15px;
            background: #111827;
            border-left: 4px solid #3b82f6;
            font-size: 12px;
            color: #94a3b8;
            border-radius: 0 6px 6px 0;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <h1 class="title">{APP_NAME}</h1>
                <div class="tagline">{APP_TAGLINE} v{APP_VERSION}</div>
            </div>
            <div style="text-align: right; font-size: 12px; color: #94a3b8;">
                <div>Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</div>
                <div style="color: {'#f59e0b' if snapshot.is_demo else '#10b981'}; font-weight: bold; margin-top: 4px;">
                    {'[DEMO TELEMETRY]' if snapshot.is_demo else '[LIVE HARDWARE AUDIT]'}
                </div>
            </div>
        </div>

        <div class="meta-card">
            <div>
                <div class="meta-item-label">Host OS</div>
                <div class="meta-item-value">{snapshot.os_name} {snapshot.os_version}</div>
            </div>
            <div>
                <div class="meta-item-label">Processor</div>
                <div class="meta-item-value">{snapshot.cpu_model}</div>
            </div>
            <div>
                <div class="meta-item-label">Physical / Logical Cores</div>
                <div class="meta-item-value">{snapshot.physical_cores} / {snapshot.logical_cores} Cores</div>
            </div>
            <div>
                <div class="meta-item-label">Installed Memory</div>
                <div class="meta-item-value">{snapshot.memory_total_bytes / (1024**3):.2f} GiB RAM</div>
            </div>
        </div>

        <div class="section-title">Diagnostic Findings & Explainable Observations</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 25%;">Observation</th>
                    <th style="width: 30%;">Telemetry Evidence</th>
                    <th style="width: 20%;">Rule Threshold</th>
                    <th style="width: 25%;">Recommended Practical Step</th>
                </tr>
            </thead>
            <tbody>
                {diag_rows_html}
            </tbody>
        </table>

        <div class="section-title">Storage Volumes</div>
        {disks_html}

        <div class="section-title">Top Active Processes</div>
        <table>
            <thead>
                <tr>
                    <th>PID</th>
                    <th>Process Name</th>
                    <th>CPU %</th>
                    <th>Memory Allocation</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {proc_rows_html}
            </tbody>
        </table>

        <div class="disclaimer">
            <strong>Privacy & Security Statement:</strong>
            This report contains only hardware metrics and system resource allocations. No passwords, personal documents,
            browser histories, or network packet contents are inspected or recorded. Findings are rule-based advisory observations,
            not definitive warranties or malware determinations.
        </div>
    </div>
</body>
</html>
"""
            with open(target_path, "w", encoding="utf-8") as f:
                f.write(html_content)

            return True, f"HTML report generated at {target_path.name}", str(target_path)
        except Exception as e:
            return False, f"Failed to generate HTML report: {e}", ""
