# WINDOWS X-RAY
### Real-Time System Monitoring & Diagnostic Tool for Windows 10 / 11 (64-bit)

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%2010%20%2F%2011%2064--bit-0078d7.svg)
![Python](https://img.shields.io/badge/python-3.10%20%7C%203.11-3776ab.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Privacy](https://img.shields.io/badge/telemetry-zero%20cloud%20tracking-success.svg)

---

## 1. Overview & Purpose
**Windows X-Ray** is a lightweight, responsive, technical desktop utility designed for students, power users, and system engineers to monitor hardware telemetry and diagnose potential performance bottlenecks on Windows 10 and 11.

Unlike heavy, opaque commercial utilities, Windows X-Ray adheres strictly to:
- **Zero Cloud Telemetry:** No tracking, no background phone-home beacons, no data harvesting.
- **Read-Only Non-Intrusive Monitoring:** No unnecessary Administrator elevation, no risk of bricking system files.
- **Explainable Rule-Based Diagnostics:** Translates raw hardware readings into plain-English observations, thresholds, evidence, and practical next steps.
- **Instant Portability:** Works out of the box with one-click `.bat` scripts or directly in the browser companion mode with zero complicated installation.

---

## 2. Core Working Features
| Feature Module | Capabilities |
| :--- | :--- |
| **Dashboard** | Real-time aggregate view of CPU, physical RAM, fixed disk capacity, active network deltas, system uptime, and CPU hardware topology. |
| **CPU View** | Overall processor load, per-core utilization meters (physical/logical threads), real-time time-series canvas chart (60s rolling), and sample rate configuration (0.5s - 5s). |
| **Memory View** | Committed vs available RAM, cached standby pool, transparent GB (decimal) vs GiB (binary IEEE 1541) toggle, and high-pressure warnings. |
| **Disk Volumes** | Volume mounts (C:, D:), file system detection (NTFS, exFAT), used/free capacity, and live disk read/write throughput (MB/s). |
| **Network Monitor** | Per-adapter throughput, raw byte transfer deltas, link speeds, connection state, and zero packet sniffing pledge. |
| **Process Manager** | Task table with PID, process name, CPU %, memory working set, user context, search filter, column sorting, and risk-managed termination. |
| **Diagnostics Engine** | Deterministic rule-based observations (sustained CPU >= 85%, memory pressure >= 88%, low disk free space < 12%, heavy I/O saturation). Labeled clearly as potential causes. |
| **Alerts & Anti-Spam** | User-customizable thresholds with mandatory sustained duration (anti-spike) and notification cooldown timers. |
| **History & Reports** | Local SQLite storage with bounded auto-prune retention, clear history action, 1-click CSV metric download, and styled standalone HTML audit report. |
| **Demo Mode** | 1-click synthetic stress telemetry simulation with clear amber warning banners, allowing full testing without exposing hardware. |
| **Offline Local Auth** | Optional local accounts using PBKDF2-HMAC-SHA256 password hashing with unique 32-byte salts; stored strictly offline on this machine only. |

---

## 3. Tech Stack & Dependencies
- **Language:** Python 3.10 / 3.11 (64-bit)
- **GUI Toolkit:** PySide6 (Qt 6 bindings for Python)
- **Telemetry Sensors:** psutil (hardware and process metrics)
- **Packaging:** PyInstaller (stand-alone portable Windows EXE)
- **Storage:** SQLite 3 (built-in standard library)
- **Security:** hashlib + hmac (PBKDF2-HMAC-SHA256 with 120,000 iterations)
- **Web Companion:** React 19, TypeScript, Tailwind CSS, Lucide icons

---

## 4. One-Click Quickstart for Windows Users

### Option A: One-Click Run (Development & Source Mode)
No manual Python environment setup is required:
1. Download or clone this repository and extract the files to any folder (e.g., `C:\WindowsXRay`).
2. Double-click **`Run_Windows_XRay.bat`**.
3. The launcher will automatically:
   - Detect your Python 3.10/3.11 installation.
   - Create an isolated virtual environment (`.venv`) if not present.
   - Install all pinned dependencies from `requirements.txt`.
   - Launch the Windows X-Ray desktop window immediately.

### Option B: One-Click Build (Distributable Portable EXE)
To compile a standalone `.exe` that can be copied to a USB drive or sent to a friend:
1. Double-click **`Build_Windows_XRay.bat`**.
2. PyInstaller will package the application into:
   ```
   dist\WindowsXRay\WindowsXRay.exe
   ```
3. Run `WindowsXRay.exe` on any 64-bit Windows 10/11 system without installing Python.

> **Windows SmartScreen Note:** Because this application is compiled locally without an expensive commercial EV certificate, Windows Defender SmartScreen may display *"Windows protected your PC"*. Click **"More info"** &rarr; **"Run anyway"**.

---

## 5. Project Architecture & File Tree
```
├── main.py                     # Desktop application entry point (GUI + CLI + Test flags)
├── requirements.txt            # Pinned stable dependencies
├── Run_Windows_XRay.bat        # One-click Windows development & execution script
├── Build_Windows_XRay.bat      # One-click PyInstaller EXE builder
├── VERSION                     # Application version (1.0.0)
├── LICENSE                     # MIT open-source license
├── README.md                   # Complete documentation and setup manual
├── .gitignore                  # Git exclusions (caches, .venv, local databases, dist)
├── app/
│   ├── __init__.py             # Package descriptor
│   ├── constants.py            # Operational defaults, theme palette, thresholds
│   ├── models.py               # Dataclass definitions for telemetry and processes
│   ├── config.py               # Settings manager with corruption recovery
│   ├── services/
│   │   ├── system_monitor.py   # Live psutil sensor reader & delta rate calculator
│   │   ├── demo_service.py     # Realistic deterministic demo telemetry generator
│   │   ├── diagnostics_engine.py # Rule-based explainable diagnostics engine
│   │   ├── alert_manager.py    # Sustained duration evaluation & cooldown tracker
│   │   ├── auth_service.py     # Local salted PBKDF2 authentication
│   │   ├── database.py         # SQLite local storage & retention pruner
│   │   └── report_exporter.py  # Path-sanitized CSV and HTML report generators
│   └── ui/
│       ├── main_window.py      # PySide6 desktop window shell
│       └── views/              # View screens (Dashboard, CPU, RAM, Disk, etc.)
└── tests/
    └── test_all_core_logic.py  # Comprehensive automated unit tests
```

---

## 6. Automated Unit Tests

Run the full automated test suite anytime using:
```bash
python main.py --test
```
or
```bash
python -m unittest tests/test_all_core_logic.py
```

### Verified Test Cases:
- Metric calculations and conversions (GB vs GiB, KiB/s vs MB/s).
- Rate delta calculations and counter rollover/reset safety.
- Sustained high CPU, RAM pressure, and low disk space rule triggers.
- Alert sustained duration timers and anti-spam cooldown windows.
- SQLite database storage and bounded retention auto-pruning.
- Corrupted `settings.json` detection and safe recovery to factory defaults.
- Path traversal defense (`../../etc/passwd.csv` attacks blocked).
- PBKDF2-HMAC-SHA256 password salting, hashing, and duplicate account rejection.
- Separation of `is_demo` flags from live hardware readings.

---

## 7. Beginner Guide: Publishing to GitHub

To upload this project to your own GitHub repository:

1. **Install Git** from [git-scm.com](https://git-scm.com/) if not already installed.
2. Open a terminal or Command Prompt inside the project folder:
   ```bash
   # Initialize git repository
   git init

   # Stage all source files (notice .gitignore automatically excludes .venv and local databases)
   git add .

   # Create the initial release commit
   git commit -m "feat: initial release of Windows X-Ray v1.0.0"

   # Rename branch to main
   git branch -M main
   ```
3. Go to [github.com/new](https://github.com/new) and create a new repository named `windows-xray` (leave it empty without initializing a README).
4. Link and push your local project:
   ```bash
   git remote add origin https://github.com/<YOUR_USERNAME>/windows-xray.git
   git push -u origin main
   ```

---

## 8. Privacy, Security & Disclaimers
1. **Privacy Notice:** All collected telemetry remains strictly local on your machine. No telemetry is transmitted to external servers.
2. **Advisory Findings:** Diagnostic results are algorithmic indicators of high resource consumption. They are intended as informational starting points and do not constitute professional hardware warranties or anti-malware guarantees.
3. **Safe Process Termination:** Always save ongoing work before requesting task termination. High CPU consumption is common during normal operations such as video encoding, games, or compiling code.
