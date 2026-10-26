@echo off
setlocal enabledelayedexpansion

:: ============================================================================
:: WINDOWS X-RAY - Distributable Executable Builder (PyInstaller)
:: Produces standalone portable Windows 10/11 64-bit EXE in dist\WindowsXRay
:: ============================================================================

title Windows X-Ray - Build Distributable EXE
cd /d "%~dp0"

echo ============================================================================
echo   WINDOWS X-RAY : Distributable EXE Build Pipeline
echo ============================================================================
echo.

:: 1. Verify virtual environment or python
set VENV_PYTHON="%~dp0.venv\Scripts\python.exe"
if exist %VENV_PYTHON% (
    set BUILD_PY=%VENV_PYTHON%
    echo [INFO] Using virtual environment Python: %BUILD_PY%
) else (
    where python >nul 2>&1
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Python not found. Please run Run_Windows_XRay.bat first to initialize.
        goto :FAIL
    )
    set BUILD_PY=python
    echo [INFO] Using system Python
)

:: 2. Ensure PyInstaller is installed
echo [INFO] Verifying PyInstaller installation...
%BUILD_PY% -m pip install pyinstaller>=6.3.0 --quiet
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install PyInstaller.
    goto :FAIL
)

:: 3. Clean prior build artifacts
echo [INFO] Cleaning old build directories...
if exist "%~dp0build" rmdir /s /q "%~dp0build"
if exist "%~dp0dist\WindowsXRay" rmdir /s /q "%~dp0dist\WindowsXRay"

:: 4. Run PyInstaller
echo.
echo [INFO] Packaging Windows X-Ray with PyInstaller...
%BUILD_PY% -m PyInstaller ^
    --name="WindowsXRay" ^
    --windowed ^
    --noconfirm ^
    --clean ^
    --add-data="VERSION;." ^
    --add-data="LICENSE;." ^
    --distpath="%~dp0dist" ^
    --workpath="%~dp0build" ^
    "%~dp0main.py"

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] PyInstaller build failed. Check the error log above.
    goto :FAIL
)

echo.
echo ============================================================================
echo   [SUCCESS] Windows X-Ray successfully built!
echo   Output location:
echo     %~dp0dist\WindowsXRay\WindowsXRay.exe
echo.
echo   Note on Windows SmartScreen:
echo   Because this executable is not signed with an expensive commercial
echo   EV Code Signing certificate, Windows Defender SmartScreen may display:
echo   "Windows protected your PC". Click "More info" -> "Run anyway".
echo ============================================================================
echo.
pause
goto :END

:FAIL
echo.
echo [BUILD FAILED] An error occurred during the compilation process.
pause
exit /b 1

:END
exit /b 0
