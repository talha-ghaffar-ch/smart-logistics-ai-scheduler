@echo off
echo ===================================================
echo   Smart Logistics AI Scheduler - Startup
echo ===================================================
echo.

echo [1/4] Installing Python Dependencies...
pip install django djangorestframework django-cors-headers

echo.
echo [2/4] Applying Database Migrations...
python manage.py migrate

echo.
echo [3/4] Installing Frontend Dependencies...
cd frontend
call npm install
cd ..

echo.
echo [4/4] Starting Servers...
echo Starting Django Backend in a new window...
start cmd /k "python manage.py runserver"

echo Starting React Frontend in a new window...
cd frontend
start cmd /k "npm run dev"

echo.
echo ===================================================
echo   Setup Complete! 
echo   The frontend should open automatically, 
echo   or you can visit: http://localhost:5173/
echo ===================================================
pause
