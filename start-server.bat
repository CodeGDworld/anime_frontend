@echo off
title Anime Nexus Full Stack Server (Port 3000)
cd /d "%~dp0"
echo ==================================================
echo   ANIME NEXUS - FULL STACK SERVER LAUNCHER
echo   URL: http://localhost:3000
echo ==================================================
node server/index.js
if %errorlevel% neq 0 (
  echo Server exited with code %errorlevel%
  pause
)
