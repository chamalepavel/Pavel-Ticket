@echo off
echo ========================================
echo  RESETEAR Base de Datos PostgreSQL
echo ========================================
echo.
echo ADVERTENCIA: Esta acción eliminará TODOS los datos
echo              de la base de datos y no se puede deshacer.
echo.
set /p confirm="¿Estás seguro? (S/N): "
if /i not "%confirm%"=="S" (
    echo.
    echo Operación cancelada.
    pause
    exit /b 0
)

echo.
echo [1/4] Deteniendo contenedor...
docker-compose --env-file .env.docker down

echo.
echo [2/4] Eliminando volúmenes (datos)...
docker volume rm proyecto-final-tomado-de-github_postgres_data 2>nul
if errorlevel 1 (
    echo Volumen ya estaba eliminado o no existe
)

echo.
echo [3/4] Recreando contenedor...
docker-compose --env-file .env.docker up -d postgres

echo.
echo [4/4] Esperando a que PostgreSQL esté listo...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo ✓ Base de datos reseteada correctamente
echo ========================================
echo.
echo IMPORTANTE: Ahora debes ejecutar el seed:
echo   npm run seed
echo.
pause
