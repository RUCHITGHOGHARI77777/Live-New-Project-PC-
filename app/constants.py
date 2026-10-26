"""
Windows X-Ray - Constants & Configuration Defaults
"""

APP_NAME = "Windows X-Ray"
APP_VERSION = "1.0.0"
APP_TAGLINE = "Real-Time System Monitoring & Diagnostic Tool"

# Default Timers and Intervals (in seconds)
DEFAULT_REFRESH_INTERVAL_SEC = 1.0
MIN_REFRESH_INTERVAL_SEC = 0.5
MAX_REFRESH_INTERVAL_SEC = 10.0

# Alert Threshold Defaults (in percent)
DEFAULT_CPU_THRESHOLD_PERCENT = 85.0
DEFAULT_MEMORY_THRESHOLD_PERCENT = 90.0
DEFAULT_DISK_THRESHOLD_PERCENT = 90.0

# Sustained Duration & Alert Cooldown (in seconds)
DEFAULT_SUSTAINED_DURATION_SEC = 5.0
DEFAULT_ALERT_COOLDOWN_SEC = 60.0

# Retention Defaults
DEFAULT_RETENTION_DAYS = 7
MIN_RETENTION_DAYS = 1
MAX_RETENTION_DAYS = 90

# UI Theme Colors (Dark Navy / Black with restrained blue accent)
COLOR_BACKGROUND = "#0a0f1d"       # Deep Dark Navy/Black
COLOR_PANEL_BG = "#111827"         # Slate Panel Background
COLOR_PANEL_BORDER = "#1f293d"     # Subtle border
COLOR_ACCENT_BLUE = "#3b82f6"      # Restrained Primary Blue
COLOR_ACCENT_HOVER = "#60a5fa"     # Light Blue Hover
COLOR_TEXT_PRIMARY = "#f1f5f9"     # High-contrast slate white
COLOR_TEXT_SECONDARY = "#94a3b8"   # Muted slate secondary text
COLOR_SUCCESS = "#10b981"          # Emerald green
COLOR_WARNING = "#f59e0b"          # Amber warning
COLOR_CRITICAL = "#ef4444"         # Rose red critical
COLOR_DEMO_BANNER = "#f59e0b"      # Amber banner for demo mode
