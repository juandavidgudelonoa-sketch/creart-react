#!/data/data/com.termux/files/usr/bin/bash

# ============================================
#  SCRIPT DE CONFIGURACIÓN CREART - TERMUX
# ============================================

echo "📱 Configurando entorno CREART en Termux..."
echo "=========================================="

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Actualizar paquetes
echo -e "${YELLOW}📦 Actualizando paquetes...${NC}"
pkg update -y

# Instalar Git
echo -e "${YELLOW}📥 Instalando Git...${NC}"
pkg install git -y

# Instalar Node.js
echo -e "${YELLOW}📥 Instalando Node.js...${NC}"
pkg install nodejs -y

# Verificar instalaciones
echo ""
echo -e "${GREEN}✅ Verificando instalaciones:${NC}"
echo "   Git: $(git --version)"
echo "   Node: $(node --version)"
echo "   NPM: $(npm --version)"

# Ir al directorio home
cd ~

# Clonar repositorio si no existe
if [ ! -d "creart-react" ]; then
    echo -e "${YELLOW}📦 Clonando repositorio...${NC}"
    git clone https://github.com/juandavidgudelonoa-sketch/creart-react
else
    echo -e "${GREEN}✅ Repositorio ya existe${NC}"
fi

cd creart-react

# Instalar dependencias
echo -e "${YELLOW}📥 Instalando dependencias npm...${NC}"
npm install

# Buscar firebaseConfig
echo ""
echo -e "${YELLOW}🔍 Buscando archivos google-services.json...${NC}"
find /sdcard -name "google-services.json" 2>/dev/null

echo ""
echo -e "${GREEN}=========================================="
echo "🎉 Configuración completada!"
echo "=========================================="
echo ""
echo "Para ejecutar el proyecto:"
echo "   cd ~/creart-react"
echo "   npm run dev"
echo ""
echo "Para buscar tu firebaseConfig:"
echo "   find /sdcard -name 'google-services.json'"
echo ""
