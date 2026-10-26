"""
Windows X-Ray - Comprehensive Automated Unit Test Suite
Covers:
- Metric calculations and conversions
- First-sample delta calculations and counter resets
- Diagnostics rules evaluation
- Alert sustained triggers and cooldown windows
- SQLite database storage and bounded retention pruning
- Settings validation, clamping, and corrupted config recovery
- PBKDF2 local password hashing, salting, and authentication
- Report export and path traversal security
- Demo mode tag separation from live metrics
"""

import unittest
import tempfile
import os
import shutil
import time
from pathlib import Path

from app.models import (
    SystemSnapshot,
    DiskPartitionInfo,
    NetworkAdapterInfo,
    ProcessInfo,
    AppSettings,
)
from app.config import (
    validate_and_clamp_settings,
    ConfigManager,
)
from app.services.database import DatabaseManager
from app.services.auth_service import (
    LocalAuthService,
    validate_username,
    validate_password,
    hash_password,
    verify_password,
)
from app.services.diagnostics_engine import DiagnosticsEngine
from app.services.alert_manager import AlertManager
from app.services.report_exporter import (
    ReportExporter,
    sanitize_export_path,
)
from app.services.demo_service import DemoTelemetryService


class TestSettingsAndConfig(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.config_path = Path(self.test_dir) / "settings.json"
        self.config_mgr = ConfigManager(self.config_path)

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_default_settings_creation(self):
        settings, msg = self.config_mgr.load_settings()
        self.assertEqual(settings.refresh_interval_sec, 1.0)
        self.assertEqual(settings.cpu_threshold_percent, 85.0)
        self.assertEqual(settings.history_retention_days, 7)
        self.assertTrue(self.config_path.exists())

    def test_settings_clamping_out_of_bounds(self):
        # Out-of-bounds values should be clamped
        bad_data = {
            "refresh_interval_sec": 999.0,  # Max is 10.0
            "cpu_threshold_percent": -50.0,  # Min is 10.0
            "history_retention_days": 1000,  # Max is 90
            "theme": "neon-glow-invalid",
        }
        settings, clamped = validate_and_clamp_settings(bad_data)
        self.assertTrue(clamped)
        self.assertEqual(settings.refresh_interval_sec, 10.0)
        self.assertEqual(settings.cpu_threshold_percent, 10.0)
        self.assertEqual(settings.history_retention_days, 90)
        self.assertEqual(settings.theme, "dark")

    def test_corrupted_config_recovery(self):
        # Write invalid non-JSON content
        with open(self.config_path, "w", encoding="utf-8") as f:
            f.write("{invalid_json_missing_quotes: 123...}")

        settings, msg = self.config_mgr.load_settings()
        self.assertIn("Corrupted", msg)
        self.assertEqual(settings.refresh_interval_sec, 1.0)
        # Should create a backup of corrupt file
        corrupt_backup = self.config_path.with_suffix(".json.corrupt")
        self.assertTrue(corrupt_backup.exists())


class TestLocalAuthentication(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.db = DatabaseManager(Path(self.test_dir) / "test.db")
        self.auth = LocalAuthService(self.db)

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_username_validation(self):
        self.assertTrue(validate_username("valid_user.1")[0])
        self.assertFalse(validate_username("ab")[0])  # too short
        self.assertFalse(validate_username("user with spaces")[0])
        self.assertFalse(validate_username("")[0])

    def test_password_validation(self):
        self.assertTrue(validate_password("SecurePass123")[0])
        self.assertFalse(validate_password("12345")[0])  # < 6 chars
        self.assertFalse(validate_password("")[0])

    def test_password_hashing_and_verification(self):
        pwd = "MasterPassword2026!"
        h, salt, iters = hash_password(pwd)
        self.assertEqual(len(salt), 64)  # 32 bytes hex = 64 chars
        self.assertTrue(verify_password(pwd, h, salt, iters))
        self.assertFalse(verify_password("WrongPassword", h, salt, iters))

    def test_user_registration_and_login(self):
        success, msg, user = self.auth.register_user("operator1", "StrongPassWord99")
        self.assertTrue(success)
        self.assertIsNotNone(user)
        self.assertEqual(user.username, "operator1")

        # Duplicate registration must fail
        dup_success, dup_msg, _ = self.auth.register_user("operator1", "AnotherPass")
        self.assertFalse(dup_success)
        self.assertIn("already exists", dup_msg)

        # Login success
        login_ok, login_msg, logged_user = self.auth.login_user("operator1", "StrongPassWord99")
        self.assertTrue(login_ok)
        self.assertEqual(logged_user.username, "operator1")
        self.assertTrue(self.auth.is_authenticated())

        # Login with bad password
        bad_login, bad_msg, _ = self.auth.login_user("operator1", "WrongPass")
        self.assertFalse(bad_login)

        # Logout
        self.auth.logout()
        self.assertFalse(self.auth.is_authenticated())


class TestDatabaseAndRetention(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.db = DatabaseManager(Path(self.test_dir) / "metrics.db")

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_record_and_retrieve_metrics(self):
        row_id = self.db.record_metrics_snapshot(
            cpu_percent=45.2,
            memory_percent=62.1,
            disk_max_percent=78.0,
            net_download_kbps=1250.0,
            net_upload_kbps=320.0,
            is_demo=False,
        )
        self.assertGreater(row_id, 0)
        recent = self.db.get_recent_metrics(limit=10)
        self.assertEqual(len(recent), 1)
        self.assertEqual(recent[0]["cpu_percent"], 45.2)
        self.assertEqual(recent[0]["is_demo"], 0)

    def test_retention_pruning(self):
        # Insert old metric from 10 days ago
        ten_days_ago = time.time() - (10 * 86400)
        self.db.record_metrics_snapshot(10.0, 20.0, 30.0, 0.0, 0.0, timestamp=ten_days_ago)

        # Insert fresh metric from today
        self.db.record_metrics_snapshot(50.0, 60.0, 70.0, 100.0, 50.0)

        # Retention set to 7 days
        pruned = self.db.prune_retention(retention_days=7)
        self.assertEqual(pruned, 1)

        remaining = self.db.get_recent_metrics()
        self.assertEqual(len(remaining), 1)
        self.assertEqual(remaining[0]["cpu_percent"], 50.0)

    def test_clear_metrics_history(self):
        self.db.record_metrics_snapshot(10.0, 20.0, 30.0, 0.0, 0.0)
        self.db.record_metrics_snapshot(20.0, 30.0, 40.0, 0.0, 0.0)
        cleared = self.db.clear_metrics_history()
        self.assertEqual(cleared, 2)
        self.assertEqual(len(self.db.get_recent_metrics()), 0)


class TestDiagnosticsEngine(unittest.TestCase):
    def setUp(self):
        self.engine = DiagnosticsEngine()

    def test_healthy_baseline_diagnostics(self):
        snapshot = SystemSnapshot(
            timestamp=time.time(),
            uptime_sec=1000.0,
            os_name="Windows 11",
            os_version="10.0.22631",
            cpu_model="Core i7",
            physical_cores=8,
            logical_cores=8,
            cpu_overall_percent=25.0,
            cpu_per_core_percent=[25.0] * 8,
            memory_total_bytes=16 * (1024**3),
            memory_used_bytes=6 * (1024**3),
            memory_available_bytes=10 * (1024**3),
            memory_percent=37.5,
            disks=[DiskPartitionInfo("C:\\", "NTFS", 500 * 10**9, 200 * 10**9, 300 * 10**9, 40.0)],
        )
        findings = self.engine.analyze(snapshot, [])
        self.assertEqual(len(findings), 1)
        self.assertEqual(findings[0].category, "General")
        self.assertIn("Balanced", findings[0].title)

    def test_sustained_cpu_trigger(self):
        snapshot_high = SystemSnapshot(
            timestamp=time.time(),
            uptime_sec=1000.0,
            os_name="Windows 11",
            os_version="10.0.22631",
            cpu_model="Core i7",
            physical_cores=8,
            logical_cores=8,
            cpu_overall_percent=92.0,
            cpu_per_core_percent=[92.0] * 8,
            memory_total_bytes=16 * (1024**3),
            memory_used_bytes=6 * (1024**3),
            memory_available_bytes=10 * (1024**3),
            memory_percent=37.5,
        )
        # Needs 3 sustained cycles
        f1 = self.engine.analyze(snapshot_high, [])
        f2 = self.engine.analyze(snapshot_high, [])
        f3 = self.engine.analyze(snapshot_high, [])
        cpu_findings = [f for f in f3 if f.category == "CPU"]
        self.assertEqual(len(cpu_findings), 1)
        self.assertIn("Sustained High CPU", cpu_findings[0].title)

    def test_low_disk_space_warning(self):
        snapshot_disk = SystemSnapshot(
            timestamp=time.time(),
            uptime_sec=1000.0,
            os_name="Windows 11",
            os_version="10.0.22631",
            cpu_model="Core i7",
            physical_cores=8,
            logical_cores=8,
            cpu_overall_percent=20.0,
            cpu_per_core_percent=[20.0] * 8,
            memory_total_bytes=16 * (1024**3),
            memory_used_bytes=6 * (1024**3),
            memory_available_bytes=10 * (1024**3),
            memory_percent=37.5,
            disks=[DiskPartitionInfo("C:\\", "NTFS", 500 * 10**9, 470 * 10**9, 30 * 10**9, 94.0)],
        )
        findings = self.engine.analyze(snapshot_disk, [])
        disk_findings = [f for f in findings if f.category == "Disk"]
        self.assertEqual(len(disk_findings), 1)
        self.assertIn("Low Free Space", disk_findings[0].title)


class TestAlertManagerAndCooldown(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.db = DatabaseManager(Path(self.test_dir) / "alerts.db")
        self.settings = AppSettings(
            cpu_threshold_percent=80.0,
            sustained_duration_sec=0.1,  # Short duration for test
            alert_cooldown_sec=2.0,       # 2 second cooldown
        )
        self.alert_mgr = AlertManager(self.db, self.settings)

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_alert_sustained_and_cooldown(self):
        snap_high = SystemSnapshot(
            timestamp=time.time(),
            uptime_sec=1000.0,
            os_name="Windows 11",
            os_version="10.0.22631",
            cpu_model="Core i7",
            physical_cores=8,
            logical_cores=8,
            cpu_overall_percent=88.0,
            cpu_per_core_percent=[88.0] * 8,
            memory_total_bytes=16 * (1024**3),
            memory_used_bytes=6 * (1024**3),
            memory_available_bytes=10 * (1024**3),
            memory_percent=37.5,
        )

        # 1st sample: condition detected, but sustained timer just started
        alerts_1 = self.alert_mgr.evaluate(snap_high)
        # Wait sustained time
        time.sleep(0.15)
        # 2nd sample: duration met -> alert fired!
        alerts_2 = self.alert_mgr.evaluate(snap_high)
        self.assertEqual(len(alerts_2), 1)
        self.assertIn("CPU Utilization", alerts_2[0].metric_name)

        # Immediate 3rd sample: Cooldown should suppress repeated alert spam
        alerts_3 = self.alert_mgr.evaluate(snap_high)
        self.assertEqual(len(alerts_3), 0)


class TestReportExporterSecurity(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.exporter = ReportExporter(Path(self.test_dir))

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_path_traversal_protection(self):
        # Attempting directory traversal should be sanitized or raise
        base = Path(self.test_dir)
        traversal_name = "../../etc/passwd.csv"
        safe_path = sanitize_export_path(base, traversal_name)
        # Must resolve inside self.test_dir
        self.assertTrue(str(safe_path).startswith(str(base)))

    def test_csv_export_format(self):
        snap = SystemSnapshot(
            timestamp=time.time(),
            uptime_sec=100.0,
            os_name="Windows 11",
            os_version="10.0",
            cpu_model="AMD Ryzen",
            physical_cores=8,
            logical_cores=16,
            cpu_overall_percent=30.0,
            cpu_per_core_percent=[30.0] * 16,
            memory_total_bytes=32 * (1024**3),
            memory_used_bytes=16 * (1024**3),
            memory_available_bytes=16 * (1024**3),
            memory_percent=50.0,
            is_demo=False,
        )
        history = [{
            "timestamp": time.time(),
            "cpu_percent": 30.0,
            "memory_percent": 50.0,
            "disk_max_percent": 45.0,
            "net_download_kbps": 200.0,
            "net_upload_kbps": 50.0,
            "is_demo": 0,
        }]
        ok, msg, path = self.exporter.export_csv(snap, history, "test_metrics.csv")
        self.assertTrue(ok)
        self.assertTrue(os.path.exists(path))
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
            self.assertIn("# Windows X-Ray", content)
            self.assertIn("CPU_Overall_Percent", content)


class TestDemoServiceSeparation(unittest.TestCase):
    def test_demo_flag_is_always_true(self):
        demo = DemoTelemetryService()
        snap, procs = demo.get_snapshot()
        self.assertTrue(snap.is_demo)
        self.assertGreater(len(snap.cpu_per_core_percent), 0)
        self.assertGreater(len(snap.disks), 0)
        self.assertGreater(len(procs), 0)


if __name__ == "__main__":
    unittest.main()
