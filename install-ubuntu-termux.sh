#!/data/data/com.termux/files/usr/bin/bash

# ============================================
#  INSTALAR UBUNTU EN TERMUX
# ============================================

echo "🐧 Instalando Ubuntu en Termux..."
echo "=================================="

# Instalar proot
pkg install proot-distro -y

# Instalar Ubuntu
proot-distro install ubuntu

# Crear acceso directo
echo ""
echo "✅ Ubuntu instalado!"
echo ""
echo "Para iniciar Ubuntu, escribe:"
echo "   proot-distro login ubuntu"
echo ""
echo "O crea un alias agregando esto a ~/.bashrc:"
echo "   alias ubuntu='proot-distro login ubuntu'"
