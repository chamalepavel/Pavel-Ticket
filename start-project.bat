@echo off
echo ========================================
echo   Event Management API - Quick Start
echo ========================================
echo.

REM Check if PostgreSQL is running
echo [1/4] Verificando PostgreSQL...
netstat -an | findstr "5432" >nul
if %errorlevel% equ 0 (
    echo     PostgreSQL esta ejecutandose ✓
) else (
    echo     PostgreSQL NO esta ejecutandose ✗
    echo.
    echo     Intentando iniciar PostgreSQL...
    net start postgresql-x64-17 2>nul
    if %errorlevel% equ 0 (
        echo     PostgreSQL iniciado exitosamente ✓
        timeout /t 3 >nul
    ) else (
        echo     ERROR: No se pudo iniciar PostgreSQL
        echo     Por favor, inicia PostgreSQL manualmente como administrador:
        echo     - Ejecuta CMD como administrador
        echo     - Ejecuta: net start postgresql-x64-17
        echo.
        pause
        exit /b 1
    )
)

echo.
echo [2/4] Verificando base de datos...
psql -U postgres -h localhost -lqt 2>nul | findstr "event_management" >nul
if %errorlevel% equ 0 (
    echo     Base de datos 'event_management' existe ✓
) else (
    echo     Base de datos NO existe ✗
    echo     Creando base de datos...
    psql -U postgres -h localhost -c "CREATE DATABASE event_management;" 2>nul
    if %errorlevel% equ 0 (
        echo     Base de datos creada exitosamente ✓
    ) else (
        echo     ERROR: No se pudo crear la base de datos
        echo     Por favor, crea la base de datos manualmente:
        echo     psql -U postgres -h localhost -c "CREATE DATABASE event_management;"
        echo.
        pause
        exit /b 1
    )
)

echo.
echo [3/4] Ejecutando seed de la base de datos...
call npm run seed
if %errorlevel% equ 0 (
    echo     Seed ejecutado exitosamente ✓
) else (
    echo     ADVERTENCIA: El seed podria haber fallado
    echo     Esto es normal si ya se ejecuto anteriormente
)

echo.
echo [4/4] Iniciando servidor...
echo.
echo ========================================
echo   Servidor iniciando en puerto 8000
echo ========================================
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

call npm run dev
