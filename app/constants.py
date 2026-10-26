"""
Windows X-Ray - Constants & Configuration Defaults
Professional Black / Charcoal Systems Utility Theme (Process Explorer / Task Manager style)
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

# UI Theme Colors (Professional Pure Black & Charcoal System Utility)
COLOR_BACKGROUND = "#09090b"       # Pure Deep Charcoal Black
COLOR_PANEL_BG = "#121215"         # Dark Surface Panel
COLOR_PANEL_BORDER = "#27272a"     # Zinc 800 Border
COLOR_ACCENT = "#38bdf8"           # Clean Ice Blue / Sky Accent (Restrained)
COLOR_ACCENT_HOVER = "#0284c7"     # Darker hover
COLOR_TEXT_PRIMARY = "#f4f4f5"     # Zinc 100 High Contrast Text
COLOR_TEXT_SECONDARY = "#a1a1aa"   # Zinc 400 Readable Neutral
COLOR_SUCCESS = "#22c55e"          # Muted Green
COLOR_WARNING = "#eab308"          # Muted Amber
COLOR_CRITICAL = "#ef4444"         # Muted Red
COLOR_DEMO_BANNER = "#ca8a04"      # Amber
