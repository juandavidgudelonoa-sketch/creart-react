@echo off
title CREART - Iniciar Servidores
color 0A

echo ========================================
echo   INICIANDO SERVICIOS - CREART
echo ========================================
echo.

REM Carpeta del proyecto
set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

REM Verificar si npm esta disponible
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm no encontrado. Instala Node.js
    pause
    exit /b 1
)

echo [1/3] Verificando dependencias...
call npm install 2>nul
if %errorlevel% neq 0 (
    echo ADVERTENCIA: Error en npm install (puede que ya esten instaladas)
)

echo.
echo [2/3] Instalando dependencias de Firebase Functions...
cd functions
call npm install 2>nul
cd ..

echo.
echo [3/3] Iniciando Frontend (Vite)...
start "CREART - Frontend" cmd /c "npm run dev"
echo    - Frontend iniciando en http://localhost:5173

echo.
echo ========================================
echo   SERVIDORES INICIADOS
echo ========================================
echo.
echo   Frontend: http://localhost:5173
echo   (Se abrira automaticamente en tu navegador)
echo.
echo   Presiona cualquier tecla para abrir el navegador...
pause >nul

start http://localhost:5173

echo.
echo Listo! El proyecto esta corriendo.
echo.
pause
