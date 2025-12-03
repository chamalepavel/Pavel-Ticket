@echo off
echo ========================================
echo   PAVEL TICKET - Iniciando Aplicacion
echo ========================================
echo.

REM Paso 1: Iniciar Docker (Base de datos)
echo [1/4] Iniciando Base de Datos (Docker)...
docker-compose up -d
if %errorlevel% equ 0 (
    echo     Base de datos iniciada correctamente
    timeout /t 5 >nul
) else (
    echo     ERROR: No se pudo iniciar Docker
    pause
    exit /b 1
)

echo.
echo [2/4] Ejecutando seed de la base de datos...
call npm run seed
echo     Seed completado

echo.
echo [3/4] Iniciando Backend (Puerto 8000)...
start "BACKEND - Puerto 8000" cmd /k "npm run dev"
timeout /t 3 >nul

echo.
echo [4/4] Iniciando Frontend (Puerto 3000)...
start "FRONTEND - Puerto 3000" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo   Aplicacion Iniciada!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo PgAdmin:  http://localhost:5050
echo.
echo Presiona cualquier tecla para abrir el navegador...
pause >nul
start http://localhost:3000
