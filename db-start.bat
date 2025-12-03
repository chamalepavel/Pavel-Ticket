@echo off
echo ========================================
echo  Iniciando PostgreSQL con Docker
echo ========================================
echo.

REM Verificar si Docker está instalado
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker no está instalado o no está en el PATH
    echo Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Verificar si Docker está corriendo
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker no está corriendo
    echo Por favor inicia Docker Desktop
    pause
    exit /b 1
)

echo [1/3] Cargando variables de entorno...
if exist .env.docker (
    echo ✓ Archivo .env.docker encontrado
) else (
    echo × Archivo .env.docker no encontrado
    echo Creando .env.docker con valores por defecto...
    copy .env.docker.example .env.docker
)

echo.
echo [2/3] Iniciando contenedor de PostgreSQL...
docker-compose --env-file .env.docker up -d postgres

if errorlevel 1 (
    echo.
    echo × Error al iniciar el contenedor
    pause
    exit /b 1
)

echo.
echo [3/3] Verificando estado del contenedor...
timeout /t 3 /nobreak >nul
docker ps --filter "name=event_management_db" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo ========================================
echo ✓ PostgreSQL iniciado correctamente
echo ========================================
echo.
echo Información de conexión:
echo   Host:     localhost
echo   Puerto:   5432
echo   Base de datos: event_management
echo   Usuario:  event_admin
echo   Password: SecureP@ssw0rd2024
echo.
echo Para ver logs: docker logs event_management_db
echo Para detener:  db-stop.bat
echo.
pause
