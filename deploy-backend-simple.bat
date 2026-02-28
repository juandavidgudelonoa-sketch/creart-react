@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   Deploy Backend CREART a Railway
echo ========================================
echo.

REM Solicitar token si no existe
set /p RAILWAY_TOKEN="Ingresa tu Railway Token (starts with ra_): "

if "%RAILWAY_TOKEN%"=="" (
    echo ERROR: Necesitas un token de Railway
    echo Consigue uno en: https://railway.app/account
    pause
    exit /b 1
)

echo.
echo [1/4] Verificando token...
echo %RAILWAY_TOKEN% | findstr /C:"ra_" >nul
if errorlevel 1 (
    echo ERROR: El token debe comenzar con "ra_"
    pause
    exit /b 1
)

REM Guardar token temporalmente
set RAILWAY_TOKEN=%RAILWAY_TOKEN%

echo [2/4] Iniciando sesion...
railway login --token %RAILWAY_TOKEN% >nul 2>&1
if errorlevel 1 (
    echo ERROR: Token invalido
    pause
    exit /b 1
)

echo [3/4] Subiendo a Railway...
cd /d "%~dp0api"
railway up

echo [4/4] Obteniendo URL...
railway domain

echo.
echo ========================================
echo   Deploy completado!
echo ========================================
echo.
echo URL del backend: 
railway domain
echo.
pause
