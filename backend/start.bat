@echo off
REM GreenWave Backend Startup Script for Windows

setlocal enabledelayedexpansion

echo.
echo 🚀 Starting GreenWave Backend...
echo.

REM Check if venv exists, create if not
if not exist "venv\" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate venv
call venv\Scripts\activate.bat

REM Install/update dependencies
echo Installing dependencies...
pip install -q -r requirements.txt

REM Initialize database
echo Initializing database...
python -c "from backend.database import init_db; init_db()" >nul 2>&1 || echo Database already initialized

REM Start server
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✓ GreenWave Backend Ready
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📎 API Documentation: http://localhost:8000/docs
echo 🌐 WebSocket: ws://localhost:8000/ws
echo.
echo Starting server...
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

pause
