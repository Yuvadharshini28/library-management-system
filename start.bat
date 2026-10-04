@echo off
title Library Management System
echo ===================================================
echo Starting Library Management System...
echo ===================================================
cd /d "%~dp0server"
start http://localhost:5000
node server.js
pause
