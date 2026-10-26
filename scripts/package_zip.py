"""
Packages the Windows X-Ray repository into a clean, distributable ZIP file.
Excludes git, node_modules, caches, and test artifacts.
"""

import os
import zipfile
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
OUTPUT_ZIP = ROOT_DIR / "WindowsXRay-v1.0.0-Source.zip"
PUBLIC_DIR = ROOT_DIR / "public"
PUBLIC_ZIP = PUBLIC_DIR / "WindowsXRay-v1.0.0-Source.zip"

EXCLUDED_DIRS = {
    ".git", ".venv", "venv", "node_modules", "dist", "build",
    "__pycache__", ".vite", ".idea", ".vscode", "reports"
}
EXCLUDED_EXTS = {".pyc", ".sqlite3", ".log", ".tmp"}


def package():
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    for zip_target in [OUTPUT_ZIP, PUBLIC_ZIP]:
        with zipfile.ZipFile(zip_target, "w", zipfile.ZIP_DEFLATED) as zf:
            for root, dirs, files in os.walk(ROOT_DIR):
                # Filter out excluded directories in place
                dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS and not d.startswith(".")]

                for f in files:
                    if f.endswith(tuple(EXCLUDED_EXTS)) or f.endswith(".zip"):
                        continue
                    full_path = Path(root) / f
                    rel_path = full_path.relative_to(ROOT_DIR)
                    zf.write(full_path, arcname=str(rel_path))
        print(f"[OK] Created distributable archive at: {zip_target}")


if __name__ == "__main__":
    package()
