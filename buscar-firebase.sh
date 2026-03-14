#!/data/data/com.termux/files/usr/bin/bash

# ============================================
#  BUSCAR FIREBASECONFIG EN ANDROID
# ============================================

echo "🔍 Buscando archivos de configuración Firebase..."
echo "================================================"

# Buscar google-services.json (Android)
echo -e "\n📱 Buscando google-services.json (Android):"
find /sdcard -name "google-services.json" 2>/dev/null

# Buscar en descargas
echo -e "\n📥 Buscando en Descargas:"
ls -la /sdcard/Download/ 2>/dev/null | grep -i firebase

# Buscar en documentos
echo -e "\n📄 Buscando en Documentos:"
ls -la /sdcard/Documents/ 2>/dev/null | grep -i firebase

# Buscar config.ts (React)
echo -e "\n🌐 Buscando config.ts (React):"
find /sdcard -name "config.ts" 2>/dev/null | grep -i firebase

# Buscar .env
echo -e "\n⚙️ Buscando archivos .env:"
find /sdcard -name ".env*" 2>/dev/null

echo ""
echo "================================================"
echo "💡 Si no encuentra nada, verifica que el archivo"
echo "   esté en tu dispositivo."
echo "================================================"
