@echo off
title Group Order WeChat Share

cd /d "%~dp0"

echo [1/3] Installing dependencies...
python -m pip install -r requirements.txt
if errorlevel 1 (
  echo Failed to install dependencies. Please check Python and network.
  pause
  exit /b 1
)

echo [2/3] Starting share tunnel...
echo Tip: set NGROK_AUTHTOKEN for better stability.
echo The script will open public URL and print QR in terminal.

echo [3/3] Running. Press Ctrl+C to stop sharing.
python share_wechat.py

echo Sharing stopped.
pause
