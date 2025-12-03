@echo off
echo ========================================
echo  Deteniendo PostgreSQL
echo ========================================
echo.

echo Deteniendo contenedor de PostgreSQL...
docker-compose --env-file .env.docker stop postgres

if errorlevel 1 (
    echo.
    echo × Error al detener el contenedor
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✓ PostgreSQL detenido correctamente
echo ========================================
echo.
echo Para reiniciar: db-start.bat
echo Para eliminar datos: db-reset.bat
echo.
pause
