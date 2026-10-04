@echo off
title Library Management System - Live Public Link
echo ===================================================
echo Starting Library Management System...
echo ===================================================
cd /d "%~dp0server"

REM Start the server in background if not already running
start /b node server.js

echo.
echo Connecting to secure public tunnel...
echo Please wait a few seconds...
echo.

REM Start SSH tunnel
ssh -R 80:127.0.0.1:5000 -o StrictHostKeyChecking=no nokey@localhost.run

pause
