@echo off
setlocal enabledelayedexpansion

:: ============================================================================
:: WINDOWS X-RAY - Real-Time System Monitoring & Diagnostic Tool
:: One-Click Development & Launch Script (Windows 10 / 11 64-bit)
:: ============================================================================

title Windows X-Ray - Launcher
cd /d "%~dp0"

echo ============================================================================
echo   WINDOWS X-RAY : System Monitor & Diagnostic Utility
echo ============================================================================
echo.

:: 1. Verify Python availability
where python >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python was not found in your system PATH.
    echo.
    echo Please install Python 3.10 or 3.11 from:
    echo   https://www.python.org/downloads/
    echo.
    echo IMPORTANT: During Python installation, make sure to check:
    echo   [x] "Add python.exe to PATH"
    echo.
    goto :FAIL
)

:: 2. Display Python version
echo [INFO] Detected Python installation:
for /f "tokens=*" %%i in ('python --version 2^>^&1') do echo   %%i
echo.

:: 3. Setup or verify virtual environment in .venv
set VENV_DIR=%~dp0.venv
set PYTHON_EXE=%VENV_DIR%\Scripts\python.exe
set PIP_EXE=%VENV_DIR%\Scripts\pip.exe

if not exist "%PYTHON_EXE%" (
    echo [INFO] Creating clean virtual environment in .venv...
    python -m venv "%VENV_DIR%"
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to create virtual environment.
        goto :FAIL
    )
    echo [OK] Virtual environment created successfully.
    echo.
)

:: 4. Upgrade pip and install pinned dependencies
echo [INFO] Checking and installing dependencies from requirements.txt...
"%PYTHON_EXE%" -m pip install --upgrade pip --quiet
"%PYTHON_EXE%" -m pip install -r "%~dp0requirements.txt"
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install one or more required dependencies.
    echo Check your internet connection or inspect the error messages above.
    goto :FAIL
)
echo [OK] All dependencies are ready.
echo.

:: 5. Launch Windows X-Ray desktop application
echo ============================================================================
echo   Launching Windows X-Ray Desktop Window...
echo ============================================================================
echo.
"%PYTHON_EXE%" "%~dp0main.py"
set APP_EXIT_CODE=%ERRORLEVEL%

if %APP_EXIT_CODE% neq 0 (
    echo.
    echo [WARNING] Windows X-Ray exited with code %APP_EXIT_CODE%.
    goto :FAIL
)

echo [OK] Application closed normally.
goto :END

:FAIL
echo.
echo ============================================================================
echo   Troubleshooting Tips:
echo   1. Ensure Python 3.10+ 64-bit is installed with PATH enabled.
echo   2. Run command prompt as normal user (administrator is NOT required).
echo   3. If PySide6 fails on Windows N edition, install Media Feature Pack.
echo ============================================================================
echo.
pause
exit /b 1

:END
exit /b 0
