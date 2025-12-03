@echo off
echo ========================================
echo  Logs de PostgreSQL
echo ========================================
echo.
echo Mostrando logs en tiempo real...
echo Presiona Ctrl+C para salir
echo.
docker logs -f event_management_db
