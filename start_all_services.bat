@echo off
echo Starting Retirement Planning System...
echo.

echo Starting finai-backend (Port 8000)...
start "finai-backend" cmd /k "cd finai-backend && python main.py"

echo Starting simulator (Port 8001)...
start "simulator" cmd /k "cd simulator && python main.py"

echo Starting frontend (Port 3000)...
start "frontend" cmd /k "cd new-frontend/Incuverse_NullPointerz && npm start"

echo.
echo All services are starting...
echo - finai-backend: http://localhost:8000
echo - simulator: http://localhost:8001  
echo - frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul
