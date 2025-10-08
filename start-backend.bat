@echo off
cls
echo ================================================
echo    EMAIL MARKETING PLATFORM - BACKEND
echo ================================================
echo.
echo Starting Express.js Backend Server...
echo.
cd backend
echo [1/2] Installing dependencies...
call npm install --silent
echo.
echo [2/2] Starting server on http://localhost:5000
echo.
call npm run dev
