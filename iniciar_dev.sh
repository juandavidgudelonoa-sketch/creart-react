#!/bin/bash

# CREART - Script de Inicio para WSL2
# Uso: ./iniciar_dev.sh

PROJECT_DIR="${HOME}/OneDrive/Desktop/Carpinteria creart/creart-react"

echo "========================================"
echo "  INICIANDO SERVICIOS - CREART (WSL2)"
echo "========================================"
echo ""

# Verificar que existe la carpeta
if [ ! -d "$PROJECT_DIR" ]; then
    echo "ERROR: No se encontro el proyecto en:"
    echo "$PROJECT_DIR"
    echo ""
    echo "Edita este script y cambia PROJECT_DIR a tu ruta correcta"
    exit 1
fi

cd "$PROJECT_DIR" || exit 1

echo "[1/4] Verificando npm..."
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm no encontrado. Instala Node.js"
    exit 1
fi

echo "[2/4] Instalando dependencias..."
npm install 2>/dev/null
cd functions && npm install 2>/dev/null && cd ..

echo "[3/4] Verificando Firebase CLI..."
if ! command -v firebase &> /dev/null; then
    echo "ADVERTENCIA: Firebase CLI no instalado"
    echo "Instalar con: npm install -g firebase-tools"
fi

echo "[4/4] Abriendo VS Code..."
code "$PROJECT_DIR" 2>/dev/null

echo ""
echo "========================================"
echo "  COMANDOS MANUALES:"
echo "========================================"
echo ""
echo "Para iniciar el FRONTEND:"
echo "  cd $PROJECT_DIR && npm run dev"
echo ""
echo "Para iniciar FIREBASE EMULATORS:"
echo "  cd $PROJECT_DIR/functions && npm run serve"
echo ""
echo "Para iniciar OPENCODE:"
echo "  cd $PROJECT_DIR && opencode serve"
echo ""
echo "========================================"
