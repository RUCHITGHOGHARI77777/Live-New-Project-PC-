"""
Windows X-Ray - Alert Manager Service
Tracks sustained metric conditions and manages alert cooldowns to avoid notification spam.
"""

import time
from typing import Dict, List, Optional
from app.models import AlertItem, AppSettings, SystemSnapshot
from app.services.database import DatabaseManager


class AlertManager:
    """Evaluates thresholds against sustained durations and enforces cooldown windows."""

    def __init__(self, db: DatabaseManager, settings: AppSettings):
        self.db = db
        self.settings = settings
        # Track when a condition started: metric_name -> start_timestamp
        self._breach_start_times: Dict[str, float] = {}
        # Track last notification timestamp: metric_name -> last_notified_timestamp
        self._last_alert_times: Dict[str, float] = {}
        # Active in-memory alerts
        self._active_alerts: Dict[str, AlertItem] = {}

    def update_settings(self, new_settings: AppSettings):
        self.settings = new_settings

    def evaluate(self, snapshot: SystemSnapshot) -> List[AlertItem]:
        """Evaluates live snapshot against thresholds and cooldowns."""
        now = time.time()
        new_alerts: List[AlertItem] = []

        metrics_to_check = [
            ("CPU Utilization", snapshot.cpu_overall_percent, self.settings.cpu_threshold_percent, "%"),
            ("Memory Allocation", snapshot.memory_percent, self.settings.memory_threshold_percent, "%"),
        ]

        # Check maximum disk usage across partitions
        if snapshot.disks:
            max_disk = max(snapshot.disks, key=lambda d: d.percent)
            metrics_to_check.append(
                (f"Disk Space ({max_disk.mountpoint})", max_disk.percent, self.settings.disk_threshold_percent, "%")
            )

        for metric_name, current_val, threshold, unit in metrics_to_check:
            if current_val >= threshold:
                # Mark breach start if not already tracking
                if metric_name not in self._breach_start_times:
                    self._breach_start_times[metric_name] = now

                duration = now - self._breach_start_times[metric_name]

                # Check if sustained duration requirement is met
                if duration >= self.settings.sustained_duration_sec:
                    last_alert = self._last_alert_times.get(metric_name, 0.0)

                    # Check cooldown
                    if (now - last_alert) >= self.settings.alert_cooldown_sec:
                        severity = "critical" if current_val >= (threshold + 7.0) else "warning"
                        alert_id = f"alert_{int(now)}_{metric_name.replace(' ', '_').lower()}"
                        msg = f"{metric_name} reached {current_val:.1f}{unit} (sustained for {duration:.1f}s, threshold: {threshold:.1f}{unit})"

                        alert = AlertItem(
                            id=alert_id,
                            timestamp=now,
                            metric_name=metric_name,
                            current_value=current_val,
                            threshold_value=threshold,
                            severity=severity,
                            message=msg,
                            dismissed=False,
                        )
                        self._active_alerts[alert_id] = alert
                        self._last_alert_times[metric_name] = now
                        new_alerts.append(alert)

                        # Record to SQLite database
                        self.db.record_alert(
                            alert_id=alert.id,
                            timestamp=alert.timestamp,
                            metric_name=alert.metric_name,
                            current_value=alert.current_value,
                            threshold_value=alert.threshold_value,
                            severity=alert.severity,
                            message=alert.message,
                        )
            else:
                # Metric dropped below threshold: reset breach start timer
                if metric_name in self._breach_start_times:
                    del self._breach_start_times[metric_name]

        return new_alerts

    def dismiss(self, alert_id: str):
        """Dismisses an active alert."""
        if alert_id in self._active_alerts:
            self._active_alerts[alert_id].dismissed = True
        self.db.dismiss_alert(alert_id)

    def get_active_alerts(self) -> List[AlertItem]:
        """Returns non-dismissed alerts sorted newest first."""
        return [a for a in sorted(self._active_alerts.values(), key=lambda x: x.timestamp, reverse=True) if not a.dismissed]
