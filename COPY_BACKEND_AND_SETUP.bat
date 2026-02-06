@echo off
echo Copying backend to XAMPP...
xcopy /E /Y "%~dp0backend" "C:\xampp\htdocs\backend\"
if %errorlevel% neq 0 (
    echo ERROR: Could not copy. Make sure C:\xampp\htdocs exists and you have permission.
    pause
    exit /b 1
)
echo.
echo Backend copied successfully!
echo.
echo Now open in your browser:
echo   http://localhost:8080/backend/setup_full.php
echo.
echo This will create the "us_nepal_legal_db" database with all tables and data.
echo Then login at: http://localhost:5175/admin (admin / admin123)
echo.
pause
