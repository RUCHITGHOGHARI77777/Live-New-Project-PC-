"""
Windows X-Ray - SQLite Local Metrics & Storage Service
Stores bounded performance logs and local security credentials.
"""

import sqlite3
import time
from pathlib import Path
from typing import List, Dict, Any, Optional
from app.config import get_app_data_dir


class DatabaseManager:
    """Manages SQLite storage for metrics history and bounded retention."""

    def __init__(self, db_path: Optional[Path] = None):
        if db_path is None:
            self.db_path = get_app_data_dir() / "windows_xray.sqlite3"
        else:
            self.db_path = Path(db_path)
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path), timeout=10.0)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        """Initializes tables with proper indexes."""
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        with self._get_connection() as conn:
            cursor = conn.cursor()
            # Metrics history table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS metrics_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp REAL NOT NULL,
                    cpu_percent REAL NOT NULL,
                    memory_percent REAL NOT NULL,
                    disk_max_percent REAL NOT NULL,
                    net_download_kbps REAL NOT NULL,
                    net_upload_kbps REAL NOT NULL,
                    is_demo INTEGER NOT NULL DEFAULT 0
                )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_metrics_time ON metrics_history(timestamp)")

            # Alerts history table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS alerts_history (
                    id TEXT PRIMARY KEY,
                    timestamp REAL NOT NULL,
                    metric_name TEXT NOT NULL,
                    current_value REAL NOT NULL,
                    threshold_value REAL NOT NULL,
                    severity TEXT NOT NULL,
                    message TEXT NOT NULL,
                    dismissed INTEGER NOT NULL DEFAULT 0
                )
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_alerts_time ON alerts_history(timestamp)")

            # Local user accounts table (strictly local, salted & hashed)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    salt TEXT NOT NULL,
                    iterations INTEGER NOT NULL,
                    created_at REAL NOT NULL,
                    last_login REAL NOT NULL
                )
            """)
            conn.commit()

    def record_metrics_snapshot(
        self,
        cpu_percent: float,
        memory_percent: float,
        disk_max_percent: float,
        net_download_kbps: float,
        net_upload_kbps: float,
        is_demo: bool = False,
        timestamp: Optional[float] = None,
    ) -> int:
        """Records a single metrics sample row."""
        ts = timestamp if timestamp is not None else time.time()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO metrics_history (
                    timestamp, cpu_percent, memory_percent, disk_max_percent,
                    net_download_kbps, net_upload_kbps, is_demo
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (ts, cpu_percent, memory_percent, disk_max_percent, net_download_kbps, net_upload_kbps, int(is_demo)))
            conn.commit()
            return cursor.lastrowid

    def get_recent_metrics(self, limit: int = 120, is_demo: Optional[bool] = None) -> List[Dict[str, Any]]:
        """Retrieves most recent metrics ordered by time ascending."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            query = "SELECT * FROM metrics_history"
            params = []
            if is_demo is not None:
                query += " WHERE is_demo = ?"
                params.append(int(is_demo))
            query += " ORDER BY timestamp DESC LIMIT ?"
            params.append(limit)
            cursor.execute(query, params)
            rows = cursor.fetchall()
            # Reverse to chronological ascending
            return [dict(r) for r in reversed(rows)]

    def record_alert(
        self,
        alert_id: str,
        timestamp: float,
        metric_name: str,
        current_value: float,
        threshold_value: float,
        severity: str,
        message: str,
    ):
        """Records an alert incident."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO alerts_history (
                    id, timestamp, metric_name, current_value, threshold_value, severity, message, dismissed
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 0)
            """, (alert_id, timestamp, metric_name, current_value, threshold_value, severity, message))
            conn.commit()

    def get_recent_alerts(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieves recent alerts ordered by time descending."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM alerts_history ORDER BY timestamp DESC LIMIT ?", (limit,))
            return [dict(r) for r in cursor.fetchall()]

    def dismiss_alert(self, alert_id: str):
        """Marks an alert as dismissed."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE alerts_history SET dismissed = 1 WHERE id = ?", (alert_id,))
            conn.commit()

    def prune_retention(self, retention_days: int) -> int:
        """Deletes metrics history older than the configured retention period."""
        if retention_days <= 0:
            return 0
        cutoff_timestamp = time.time() - (retention_days * 86400)
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM metrics_history WHERE timestamp < ?", (cutoff_timestamp,))
            pruned_count = cursor.rowcount
            conn.commit()
            return pruned_count

    def clear_metrics_history(self) -> int:
        """Deletes all recorded metrics history (user requested)."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM metrics_history")
            count = cursor.rowcount
            conn.commit()
            return count
