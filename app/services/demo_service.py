"""
Windows X-Ray - Demo Telemetry Generator
Generates realistic, deterministic simulated Windows telemetry for Demo Mode.
Clearly tags all readings with is_demo = True.
"""

import time
import math
from typing import List, Tuple
from app.models import (
    SystemSnapshot,
    DiskPartitionInfo,
    NetworkAdapterInfo,
    ProcessInfo,
)


class DemoTelemetryService:
    """Produces realistic, continuous telemetry streams for testing and demonstrations."""

    def __init__(self):
        self._start_time = time.time()
        self._step = 0

    def get_snapshot(self) -> Tuple[SystemSnapshot, List[ProcessInfo]]:
        self._step += 1
        now = time.time()
        elapsed = now - self._start_time

        # Smooth cyclic oscillations using sine waves
        cpu_base = 28.0 + 15.0 * math.sin(elapsed / 10.0) + 8.0 * math.sin(elapsed / 3.0)
        cpu_overall = max(5.0, min(96.0, cpu_base))

        # Multi-core simulation (8 cores)
        cores = []
        for i in range(8):
            core_val = cpu_overall + 12.0 * math.sin((elapsed + i * 2) / 4.0)
            cores.append(round(max(2.0, min(100.0, core_val)), 1))

        # Memory simulation (16 GiB total, ~60-70% used)
        total_ram = 16 * 1024 * 1024 * 1024
        mem_percent = 58.0 + 8.0 * math.sin(elapsed / 25.0)
        used_ram = int(total_ram * (mem_percent / 100.0))
        avail_ram = total_ram - used_ram

        # Simulated disks (C: System, D: Games/Data)
        c_total = 512 * 1000 * 1000 * 1000
        c_used = int(c_total * 0.76)
        c_free = c_total - c_used

        d_total = 1000 * 1000 * 1000 * 1000
        d_used = int(d_total * 0.42)
        d_free = d_total - d_used

        # Disk I/O simulation
        disk_read_kbps = max(50.0, 18000.0 * abs(math.sin(elapsed / 6.0)))
        disk_write_kbps = max(20.0, 9500.0 * abs(math.cos(elapsed / 8.0)))

        disks = [
            DiskPartitionInfo(
                mountpoint="C:\\",
                fstype="NTFS",
                total_bytes=c_total,
                used_bytes=c_used,
                free_bytes=c_free,
                percent=76.0,
                read_bytes_per_sec=disk_read_kbps * 1024,
                write_bytes_per_sec=disk_write_kbps * 1024,
                status="Healthy (BitLocker Active)",
            ),
            DiskPartitionInfo(
                mountpoint="D:\\",
                fstype="NTFS",
                total_bytes=d_total,
                used_bytes=d_used,
                free_bytes=d_free,
                percent=42.0,
                read_bytes_per_sec=2400.0 * 1024,
                write_bytes_per_sec=1200.0 * 1024,
                status="Healthy",
            ),
        ]

        # Network simulation
        net_down_kbps = max(120.0, 4800.0 + 3500.0 * math.sin(elapsed / 5.0))
        net_up_kbps = max(40.0, 850.0 + 400.0 * math.cos(elapsed / 7.0))

        networks = [
            NetworkAdapterInfo(
                name="Ethernet (Intel(R) Ethernet Controller I225-V)",
                bytes_sent_per_sec=net_up_kbps * 1024,
                bytes_recv_per_sec=net_down_kbps * 1024,
                is_up=True,
                speed_mbps=1000,
                is_loopback=False,
            ),
            NetworkAdapterInfo(
                name="Wi-Fi (Intel(R) Wi-Fi 6E AX211)",
                bytes_sent_per_sec=0.0,
                bytes_recv_per_sec=0.0,
                is_up=False,
                speed_mbps=0,
                is_loopback=False,
            ),
        ]

        snapshot = SystemSnapshot(
            timestamp=now,
            uptime_sec=84200.0 + elapsed,
            os_name="Windows 11 Pro 64-bit",
            os_version="10.0.22631 Build 22631",
            cpu_model="13th Gen Intel(R) Core(TM) i7-13700K",
            physical_cores=8,
            logical_cores=8,
            cpu_overall_percent=round(cpu_overall, 1),
            cpu_per_core_percent=cores,
            memory_total_bytes=total_ram,
            memory_used_bytes=used_ram,
            memory_available_bytes=avail_ram,
            memory_percent=round(mem_percent, 1),
            disks=disks,
            networks=networks,
            net_download_kbps=round(net_down_kbps, 1),
            net_upload_kbps=round(net_up_kbps, 1),
            disk_read_kbps=round(disk_read_kbps, 1),
            disk_write_kbps=round(disk_write_kbps, 1),
            is_demo=True,
        )

        # Realistic Windows desktop processes
        processes = [
            ProcessInfo(
                pid=4,
                name="System",
                cpu_percent=1.2,
                memory_bytes=48 * 1024 * 1024,
                memory_percent=0.3,
                status="running",
                username="NT AUTHORITY\\SYSTEM",
            ),
            ProcessInfo(
                pid=1048,
                name="explorer.exe",
                cpu_percent=2.4,
                memory_bytes=184 * 1024 * 1024,
                memory_percent=1.1,
                status="running",
                username="Current_User",
            ),
            ProcessInfo(
                pid=4120,
                name="msedge.exe",
                cpu_percent=round(max(4.0, 18.0 + 8.0 * math.sin(elapsed / 4.0)), 1),
                memory_bytes=890 * 1024 * 1024,
                memory_percent=5.4,
                status="running",
                username="Current_User",
            ),
            ProcessInfo(
                pid=8924,
                name="Code.exe",
                cpu_percent=round(max(2.0, 8.5 + 4.0 * math.cos(elapsed / 6.0)), 1),
                memory_bytes=620 * 1024 * 1024,
                memory_percent=3.8,
                status="running",
                username="Current_User",
            ),
            ProcessInfo(
                pid=12040,
                name="WindowsXRay.exe",
                cpu_percent=0.8,
                memory_bytes=72 * 1024 * 1024,
                memory_percent=0.4,
                status="running",
                username="Current_User",
            ),
            ProcessInfo(
                pid=5512,
                name="dwm.exe",
                cpu_percent=1.5,
                memory_bytes=142 * 1024 * 1024,
                memory_percent=0.9,
                status="running",
                username="Window Manager\\DWM-1",
            ),
            ProcessInfo(
                pid=3340,
                name="svchost.exe",
                cpu_percent=0.6,
                memory_bytes=98 * 1024 * 1024,
                memory_percent=0.6,
                status="running",
                username="NT AUTHORITY\\SYSTEM",
            ),
            ProcessInfo(
                pid=14280,
                name="discord.exe",
                cpu_percent=1.1,
                memory_bytes=240 * 1024 * 1024,
                memory_percent=1.5,
                status="running",
                username="Current_User",
            ),
        ]

        # Sort by CPU descending
        processes.sort(key=lambda p: p.cpu_percent, reverse=True)

        return snapshot, processes
