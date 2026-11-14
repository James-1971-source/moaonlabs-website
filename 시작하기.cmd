@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 24 or later is required.
  pause
  exit /b 1
)
if not exist node_modules (
  call npm ci
  if errorlevel 1 exit /b 1
)
if not exist .next\BUILD_ID (
  call npm run build
  if errorlevel 1 exit /b 1
)
echo Open http://127.0.0.1:8928/ after the server is ready.
call npm run start
pause
