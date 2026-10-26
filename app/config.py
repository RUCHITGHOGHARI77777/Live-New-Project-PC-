"""
Windows X-Ray - Settings & Configuration Manager
Handles safe persistent configuration with corruption recovery.
"""

import os
import json
from pathlib import Path
from typing import Tuple
from app.constants import (
    DEFAULT_REFRESH_INTERVAL_SEC,
    MIN_REFRESH_INTERVAL_SEC,
    MAX_REFRESH_INTERVAL_SEC,
    DEFAULT_CPU_THRESHOLD_PERCENT,
    DEFAULT_MEMORY_THRESHOLD_PERCENT,
    DEFAULT_DISK_THRESHOLD_PERCENT,
    DEFAULT_SUSTAINED_DURATION_SEC,
    DEFAULT_ALERT_COOLDOWN_SEC,
    DEFAULT_RETENTION_DAYS,
    MIN_RETENTION_DAYS,
    MAX_RETENTION_DAYS,
)
from app.models import AppSettings


def get_app_data_dir() -> Path:
    """Returns a safe, user-writable directory for config and local database."""
    if os.name == "nt":
        base = os.getenv("APPDATA") or os.path.expanduser("~")
        path = Path(base) / "WindowsXRay"
    else:
        path = Path.home() / ".windows_xray"
    path.mkdir(parents=True, exist_ok=True)
    return path


def validate_and_clamp_settings(data: dict) -> Tuple[AppSettings, bool]:
    """
    Validates dictionary values and clamps to sensible operational ranges.
    Returns (AppSettings, was_clamped_or_defaulted).
    """
    modified = False

    try:
        refresh = float(data.get("refresh_interval_sec", DEFAULT_REFRESH_INTERVAL_SEC))
        if not (MIN_REFRESH_INTERVAL_SEC <= refresh <= MAX_REFRESH_INTERVAL_SEC):
            refresh = max(MIN_REFRESH_INTERVAL_SEC, min(MAX_REFRESH_INTERVAL_SEC, refresh))
            modified = True
    except (ValueError, TypeError):
        refresh = DEFAULT_REFRESH_INTERVAL_SEC
        modified = True

    try:
        cpu_thresh = float(data.get("cpu_threshold_percent", DEFAULT_CPU_THRESHOLD_PERCENT))
        if not (10.0 <= cpu_thresh <= 99.0):
            cpu_thresh = max(10.0, min(99.0, cpu_thresh))
            modified = True
    except (ValueError, TypeError):
        cpu_thresh = DEFAULT_CPU_THRESHOLD_PERCENT
        modified = True

    try:
        mem_thresh = float(data.get("memory_threshold_percent", DEFAULT_MEMORY_THRESHOLD_PERCENT))
        if not (10.0 <= mem_thresh <= 99.0):
            mem_thresh = max(10.0, min(99.0, mem_thresh))
            modified = True
    except (ValueError, TypeError):
        mem_thresh = DEFAULT_MEMORY_THRESHOLD_PERCENT
        modified = True

    try:
        disk_thresh = float(data.get("disk_threshold_percent", DEFAULT_DISK_THRESHOLD_PERCENT))
        if not (10.0 <= disk_thresh <= 99.0):
            disk_thresh = max(10.0, min(99.0, disk_thresh))
            modified = True
    except (ValueError, TypeError):
        disk_thresh = DEFAULT_DISK_THRESHOLD_PERCENT
        modified = True

    try:
        sustained = float(data.get("sustained_duration_sec", DEFAULT_SUSTAINED_DURATION_SEC))
        if not (1.0 <= sustained <= 120.0):
            sustained = max(1.0, min(120.0, sustained))
            modified = True
    except (ValueError, TypeError):
        sustained = DEFAULT_SUSTAINED_DURATION_SEC
        modified = True

    try:
        cooldown = float(data.get("alert_cooldown_sec", DEFAULT_ALERT_COOLDOWN_SEC))
        if not (10.0 <= cooldown <= 600.0):
            cooldown = max(10.0, min(600.0, cooldown))
            modified = True
    except (ValueError, TypeError):
        cooldown = DEFAULT_ALERT_COOLDOWN_SEC
        modified = True

    try:
        retention = int(data.get("history_retention_days", DEFAULT_RETENTION_DAYS))
        if not (MIN_RETENTION_DAYS <= retention <= MAX_RETENTION_DAYS):
            retention = max(MIN_RETENTION_DAYS, min(MAX_RETENTION_DAYS, retention))
            modified = True
    except (ValueError, TypeError):
        retention = DEFAULT_RETENTION_DAYS
        modified = True

    theme = str(data.get("theme", "dark")).lower()
    if theme not in ("dark", "light"):
        theme = "dark"
        modified = True

    is_demo = bool(data.get("is_demo_mode", False))

    settings = AppSettings(
        refresh_interval_sec=refresh,
        cpu_threshold_percent=cpu_thresh,
        memory_threshold_percent=mem_thresh,
        disk_threshold_percent=disk_thresh,
        sustained_duration_sec=sustained,
        alert_cooldown_sec=cooldown,
        history_retention_days=retention,
        theme=theme,
        is_demo_mode=is_demo,
    )
    return settings, modified


class ConfigManager:
    """Manages reading and writing application settings JSON file."""

    def __init__(self, config_path: Path = None):
        if config_path is None:
            self.config_path = get_app_data_dir() / "settings.json"
        else:
            self.config_path = Path(config_path)

    def load_settings(self) -> Tuple[AppSettings, str]:
        """Loads settings, safely falling back to defaults if corrupted."""
        if not self.config_path.exists():
            default_settings = AppSettings()
            self.save_settings(default_settings)
            return default_settings, "Initialized with default settings."

        try:
            with open(self.config_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            settings, clamped = validate_and_clamp_settings(data)
            status = "Settings loaded successfully." if not clamped else "Settings restored with clamped bounds."
            return settings, status
        except Exception as e:
            # Corrupted file: back up and reset to safe defaults
            backup_path = self.config_path.with_suffix(".json.corrupt")
            try:
                if self.config_path.exists():
                    self.config_path.rename(backup_path)
            except Exception:
                pass
            defaults = AppSettings()
            self.save_settings(defaults)
            return defaults, f"Corrupted config recovered to safe defaults ({e})."

    def save_settings(self, settings: AppSettings) -> bool:
        """Saves current settings to disk atomically."""
        try:
            self.config_path.parent.mkdir(parents=True, exist_ok=True)
            data = {
                "refresh_interval_sec": settings.refresh_interval_sec,
                "cpu_threshold_percent": settings.cpu_threshold_percent,
                "memory_threshold_percent": settings.memory_threshold_percent,
                "disk_threshold_percent": settings.disk_threshold_percent,
                "sustained_duration_sec": settings.sustained_duration_sec,
                "alert_cooldown_sec": settings.alert_cooldown_sec,
                "history_retention_days": settings.history_retention_days,
                "theme": settings.theme,
                "is_demo_mode": settings.is_demo_mode,
            }
            tmp_path = self.config_path.with_suffix(".tmp")
            with open(tmp_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            tmp_path.replace(self.config_path)
            return True
        except Exception:
            return False
