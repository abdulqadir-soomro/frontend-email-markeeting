@echo off
cls
echo ================================================
echo    EMAIL MARKETING PLATFORM - FRONTEND
echo ================================================
echo.
echo Starting Next.js Frontend Application...
echo.
cd frontend
echo [1/2] Installing dependencies...
call npm install --silent
echo.
echo [2/2] Starting application on http://localhost:3000
echo.
call npm run dev
