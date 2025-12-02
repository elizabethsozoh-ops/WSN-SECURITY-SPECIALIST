@echo off
echo ============================================
echo   Starting ABC Security Apps + NGROK
echo ============================================
echo.
echo Starting Client App on http://localhost:8080
echo Starting Security Portal on http://localhost:8081
echo.

REM Start Python servers in new windows (minimized)
start "Client App Server" /min cmd /k "cd /d "%~dp0client-app" && python -m http.server 8080"
start "Security Portal Server" /min cmd /k "cd /d "%~dp0security-portal" && python -m http.server 8081"

REM Wait 3 seconds for servers to start
echo Waiting for servers to start...
timeout /t 3 /nobreak >nul

REM Start ngrok tunnels
echo.
echo Starting ngrok tunnels...
echo.
start "Ngrok - Client App" cmd /k "ngrok http 8080 --log=stdout"
start "Ngrok - Security Portal" cmd /k "ngrok http 8081 --log=stdout"

REM Wait for ngrok to start
timeout /t 3 /nobreak >nul

REM Open local versions in browser
start http://localhost:8080
start http://localhost:8081

echo.
echo ============================================
echo   Everything is running!
echo ============================================
echo.
echo LOCAL ACCESS (on this PC):
echo   Client App:       http://localhost:8080
echo   Security Portal:  http://localhost:8081
echo.
echo PHONE ACCESS (use these URLs on your phone):
echo   Look at the ngrok windows for the https://xxxx.ngrok-free.app URLs
echo   You'll see 2 ngrok windows - one for each app
echo.
echo IMPORTANT:
echo   - Keep ALL windows open
echo   - Copy the ngrok URLs to your phone
echo   - The URLs change each time you restart
echo.
pause
