# Script para renombrar el proyecto de forma segura
# De: "Pavel ticket" a "SistemaEventosPavel"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Renombrar Proyecto a SistemaEventosPavel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Obtener la ruta actual
$currentPath = Get-Location
$parentPath = Split-Path $currentPath -Parent
$currentFolderName = Split-Path $currentPath -Leaf
$newFolderName = "SistemaEventosPavel"
$newPath = Join-Path $parentPath $newFolderName

Write-Host "[INFO] Carpeta actual: $currentFolderName" -ForegroundColor Yellow
Write-Host "[INFO] Nueva carpeta: $newFolderName" -ForegroundColor Green
Write-Host ""

# Verificar si ya existe una carpeta con el nuevo nombre
if (Test-Path $newPath) {
    Write-Host "[ERROR] Ya existe una carpeta llamada '$newFolderName'" -ForegroundColor Red
    Write-Host "[ERROR] Por favor, elimina o renombra la carpeta existente primero." -ForegroundColor Red
    pause
    exit 1
}

Write-Host "[1/4] Deteniendo procesos de Node.js..." -ForegroundColor Yellow
# Intentar detener procesos de node relacionados con el proyecto
Get-Process node -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*$currentPath*"
} | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2
Write-Host "      Procesos detenidos" -ForegroundColor Green
Write-Host ""

Write-Host "[2/4] Cerrando VSCode (si está abierto)..." -ForegroundColor Yellow
Write-Host "      Por favor, cierra Visual Studio Code manualmente si está abierto" -ForegroundColor Yellow
Write-Host "      Presiona cualquier tecla cuando hayas cerrado VSCode..." -ForegroundColor Yellow
pause
Write-Host ""

Write-Host "[3/4] Renombrando carpeta del proyecto..." -ForegroundColor Yellow
try {
    # Subir un nivel
    Set-Location $parentPath
    
    # Renombrar la carpeta
    Rename-Item -Path $currentPath -NewName $newFolderName -ErrorAction Stop
    
    Write-Host "      Carpeta renombrada exitosamente" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "[4/4] Abriendo proyecto con nuevo nombre en VSCode..." -ForegroundColor Yellow
    Set-Location $newPath
    
    # Abrir VSCode en la nueva ubicación
    code .
    
    Write-Host "      VSCode abierto en la nueva ubicación" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Renombrado Completado Exitosamente!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Nueva ubicación: $newPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "PROXIMOS PASOS:" -ForegroundColor Yellow
    Write-Host "1. En VSCode, abre dos terminales nuevas" -ForegroundColor White
    Write-Host "2. En la primera terminal ejecuta: npm run dev" -ForegroundColor White
    Write-Host "3. En la segunda terminal ejecuta: cd frontend && npm start" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "[ERROR] No se pudo renombrar la carpeta: $_" -ForegroundColor Red
    Set-Location $currentPath
    exit 1
}

Write-Host "Presiona cualquier tecla para cerrar..." -ForegroundColor Gray
pause
