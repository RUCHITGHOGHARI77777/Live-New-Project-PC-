"""
Windows X-Ray - Data Models & Type Definitions
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional
import time


@dataclass
class DiskPartitionInfo:
    mountpoint: str
    fstype: str
    total_bytes: int
    used_bytes: int
    free_bytes: int
    percent: float
    read_bytes_per_sec: float = 0.0
    write_bytes_per_sec: float = 0.0
    status: str = "Healthy"


@dataclass
class NetworkAdapterInfo:
    name: str
    bytes_sent_per_sec: float
    bytes_recv_per_sec: float
    is_up: bool
    speed_mbps: int = 0
    is_loopback: bool = False


@dataclass
class ProcessInfo:
    pid: int
    name: str
    cpu_percent: float
    memory_bytes: int
    memory_percent: float
    status: str
    username: str = "N/A"
    create_time: float = 0.0


@dataclass
class SystemSnapshot:
    timestamp: float
    uptime_sec: float
    os_name: str
    os_version: str
    cpu_model: str
    physical_cores: int
    logical_cores: int
    cpu_overall_percent: float
    cpu_per_core_percent: List[float]
    memory_total_bytes: int
    memory_used_bytes: int
    memory_available_bytes: int
    memory_percent: float
    disks: List[DiskPartitionInfo] = field(default_factory=list)
    networks: List[NetworkAdapterInfo] = field(default_factory=list)
    net_download_kbps: float = 0.0
    net_upload_kbps: float = 0.0
    disk_read_kbps: float = 0.0
    disk_write_kbps: float = 0.0
    is_demo: bool = False


@dataclass
class DiagnosticFinding:
    id: str
    title: str
    severity: str  # "info", "warning", "critical"
    evidence: str
    threshold: str
    timestamp: float
    practical_step: str
    category: str  # "CPU", "Memory", "Disk", "Network", "Process"


@dataclass
class AlertItem:
    id: str
    timestamp: float
    metric_name: str
    current_value: float
    threshold_value: float
    severity: str
    message: str
    dismissed: bool = False


@dataclass
class AppSettings:
    refresh_interval_sec: float = 1.0
    cpu_threshold_percent: float = 85.0
    memory_threshold_percent: float = 90.0
    disk_threshold_percent: float = 90.0
    sustained_duration_sec: float = 5.0
    alert_cooldown_sec: float = 60.0
    history_retention_days: int = 7
    theme: str = "dark"
    is_demo_mode: bool = False


@dataclass
class UserProfile:
    id: int
    username: str
    created_at: float
    last_login: float
    is_local: bool = True
