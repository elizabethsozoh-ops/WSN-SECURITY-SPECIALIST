@echo off
echo ============================================
echo   Starting ABC Security Apps
echo ============================================
echo.
echo Starting Client App on http://localhost:8080
echo Starting Security Portal on http://localhost:8081
echo.
echo Opening both apps in your browser...
echo.

REM Start Python servers in new windows
start "Client App Server" cmd /k "cd /d "%~dp0client-app" && python -m http.server 8080"
start "Security Portal Server" cmd /k "cd /d "%~dp0security-portal" && python -m http.server 8081"

REM Wait 2 seconds for servers to start
timeout /t 2 /nobreak >nul

REM Open both apps in browser
start http://localhost:8080
start http://localhost:8081

echo.
echo ============================================
echo   Apps are now running!
echo ============================================
echo.
echo Client App:       http://localhost:8080
echo Security Portal:  http://localhost:8081
echo.
echo KEEP THE SERVER WINDOWS OPEN!
echo Close them when you're done testing.
echo.
pause
