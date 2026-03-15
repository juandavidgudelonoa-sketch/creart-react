#!/data/data/com.termux/files/usr/bin/bash

# ============================================
#  INSTALAR OPENCODE EN TERMUX
# ============================================

echo "📦 Instalando OpenCode en Termux..."

# Instalar dependencias
pkg update -y
pkg install curl git nodejs -y

# Instalar OpenCode ( método oficial )
# Nota: OpenCode puede requerir características específicas

# Método 1: npm global (si funciona)
npm install -g opencode 2>/dev/null

# Verificar instalación
if command -v opencode &> /dev/null; then
    echo "✅ OpenCode instalado!"
    echo "Para ejecutar: opencode"
else
    echo "⚠️ npm install no funcionó"
    echo "Prueba另一种 método:"
    echo "   curl -fsSL https://opencode.ai/install.sh | sh"
fi

echo ""
echo "📝 Alternativas si no funciona:"
echo "1. Visita https://opencode.ai/docs/installation"
echo "2. O usa directamente desde GitHub"
