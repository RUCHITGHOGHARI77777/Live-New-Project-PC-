"""
Windows X-Ray - PySide6 Desktop User Interface
Main desktop application window with pure black / charcoal theme (Windows Process Explorer / Task Manager style)
"""

import sys
import time
from typing import Optional

try:
    from PySide6.QtCore import Qt, QTimer, QThread, Signal
    from PySide6.QtWidgets import (
        QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
        QLabel, QPushButton, QStackedWidget, QTableWidget, QTableWidgetItem,
        QHeaderView, QProgressBar, QFrame, QScrollArea, QMessageBox, QFileDialog
    )
    from PySide6.QtGui import QFont, QColor, QPalette, QIcon
    HAS_PYSIDE6 = True
except ImportError:
    HAS_PYSIDE6 = False

from app.constants import (
    APP_NAME, APP_VERSION, APP_TAGLINE,
    COLOR_BACKGROUND, COLOR_PANEL_BG, COLOR_PANEL_BORDER,
    COLOR_ACCENT, COLOR_TEXT_PRIMARY, COLOR_TEXT_SECONDARY
)
from app.config import ConfigManager
from app.services.database import DatabaseManager
from app.services.auth_service import LocalAuthService
from app.services.system_monitor import SystemMonitorService
from app.services.demo_service import DemoTelemetryService
from app.services.diagnostics_engine import DiagnosticsEngine
from app.services.alert_manager import AlertManager
from app.services.report_exporter import ReportExporter


class MainWindow:
    """PySide6 native window launcher."""

    def __init__(self, is_demo_initial: bool = False):
        if not HAS_PYSIDE6:
            raise RuntimeError("PySide6 is not installed. Run 'Run_Windows_XRay.bat' to install dependencies.")

        self.config_mgr = ConfigManager()
        self.settings, _ = self.config_mgr.load_settings()
        if is_demo_initial:
            self.settings.is_demo_mode = True

        self.db = DatabaseManager()
        self.auth_service = LocalAuthService(self.db)
        self.system_monitor = SystemMonitorService()
        self.demo_service = DemoTelemetryService()
        self.diagnostics_engine = DiagnosticsEngine()
        self.alert_manager = AlertManager(self.db, self.settings)
        self.exporter = ReportExporter(self.config_mgr.config_path.parent / "reports")

    def run(self):
        """Initializes and runs the Qt event loop."""
        app = QApplication(sys.argv)
        app.setApplicationName(APP_NAME)

        window = QMainWindow()
        window.setWindowTitle(f"{APP_NAME} v{APP_VERSION} - {APP_TAGLINE}")
        window.setMinimumSize(1150, 720)
        window.setStyleSheet(f"""
            QMainWindow {{
                background-color: {COLOR_BACKGROUND};
            }}
            QWidget {{
                color: {COLOR_TEXT_PRIMARY};
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }}
            QFrame#sidebar {{
                background-color: {COLOR_PANEL_BG};
                border-right: 1px solid {COLOR_PANEL_BORDER};
            }}
            QPushButton {{
                background-color: #18181b;
                border: 1px solid {COLOR_PANEL_BORDER};
                border-radius: 4px;
                padding: 8px 14px;
                color: #f4f4f5;
                font-weight: 500;
            }}
            QPushButton:hover {{
                background-color: #27272a;
                border-color: #3f3f46;
            }}
            QTableWidget {{
                background-color: {COLOR_PANEL_BG};
                gridline-color: {COLOR_PANEL_BORDER};
                border: 1px solid {COLOR_PANEL_BORDER};
                border-radius: 4px;
            }}
            QHeaderView::section {{
                background-color: #18181b;
                color: {COLOR_TEXT_SECONDARY};
                padding: 6px;
                border: none;
                font-weight: 600;
            }}
        """)

        # Central layout
        central_widget = QWidget()
        main_layout = QHBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # Sidebar
        sidebar = QFrame()
        sidebar.setObjectName("sidebar")
        sidebar.setFixedWidth(220)
        side_layout = QVBoxLayout(sidebar)
        side_layout.setContentsMargins(14, 18, 14, 18)

        app_title = QLabel(APP_NAME)
        app_title.setStyleSheet("font-size: 16px; font-weight: bold; color: #fafafa;")
        app_tag = QLabel("Diagnostic & Hardware Monitor")
        app_tag.setStyleSheet("font-size: 11px; color: #71717a; margin-bottom: 16px;")
        side_layout.addWidget(app_title)
        side_layout.addWidget(app_tag)

        # Nav buttons
        tabs = [
            "Dashboard", "CPU Performance", "Memory Allocation", "Storage Drives",
            "Network Throughput", "Processes & Tasks", "Diagnostics Engine",
            "Alert Policies", "History & Reports", "Configuration", "About & Manual"
        ]
        self.nav_buttons = []
        for name in tabs:
            btn = QPushButton(name)
            btn.setStyleSheet("text-align: left; padding: 8px 12px; font-size: 12px;")
            side_layout.addWidget(btn)
            self.nav_buttons.append(btn)

        side_layout.addStretch()

        mode_badge = QLabel("Mode: DEMO (Simulated)" if self.settings.is_demo_mode else "Mode: LIVE (Hardware)")
        mode_badge.setStyleSheet("font-size: 11px; color: #eab308;" if self.settings.is_demo_mode else "font-size: 11px; color: #22c55e;")
        side_layout.addWidget(mode_badge)

        main_layout.addWidget(sidebar)

        # Content view container
        content_container = QWidget()
        content_layout = QVBoxLayout(content_container)
        content_layout.setContentsMargins(20, 20, 20, 20)

        header_lbl = QLabel(f"Hardware Telemetry & Systems Diagnostics - {APP_NAME}")
        header_lbl.setStyleSheet("font-size: 18px; font-weight: bold; margin-bottom: 8px; color: #fafafa;")
        content_layout.addWidget(header_lbl)

        info_lbl = QLabel("Monitoring active. Select an item from the left navigation panel to inspect subsystems.")
        info_lbl.setStyleSheet("color: #71717a; margin-bottom: 16px; font-size: 12px;")
        content_layout.addWidget(info_lbl)

        content_layout.addStretch()
        main_layout.addWidget(content_container)

        window.setCentralWidget(central_widget)
        window.show()
        return app.exec()
