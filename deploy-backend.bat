@echo off
REM Script para deploy del backend a Railway
REM Ejecutar desde la carpeta del proyecto

echo ========================================
echo   Deploy Backend CREART a Railway
echo ========================================
echo.

REM Verificar si Railway CLI está instalado
where railway >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [1/5] Instalando Railway CLI...
    npm install -g @railway/cli
)

echo [2/5] Verificando login...
railway whoami >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Por favor inicia sesion con: railway login
    echo Luego ejecuta este script de nuevo
    exit /b 1
)

echo [3/5] Vinculando proyecto...
railway init

echo [4/5] Subiendo a Railway...
railway up

echo [5/5] Obteniendo URL...
railway domain

echo.
echo ========================================
echo   Deploy completado!
echo ========================================
echo.
echo No olvides configurar las variables de entorno en Railway Dashboard:
echo   - OLLAMA_API_KEY
echo   - GOOGLE_APPLICATION_CREDENTIALS
echo.
