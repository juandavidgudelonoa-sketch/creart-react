@echo off
echo ========================================
echo BUILD OPTIMIZADO - CREART
echo ========================================
cd /d "%~dp0"

echo.
echo [1/3] Limpiando build anterior...
if exist "dist" rmdir /s /q dist

echo.
echo [2/3] Ejecutando build optimizado...
npm run build:optimized

echo.
echo [3/3] Desplegando a Firebase...
firebase deploy

echo.
echo ========================================
echo COMPLETADO!
echo ========================================
pause
