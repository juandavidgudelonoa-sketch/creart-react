#!/data/data/com.termux/files/usr/bin/bash

# Script para configurar ambiente de desarrollo en Termux

echo "📱 Configurando Termux para CREART..."

# Actualizar
pkg update -y

# Instalar Git
pkg install git -y

# Instalar Node.js
pkg install nodejs -y

# Verificar instalación
echo "✅ Instalaciones completadas:"
echo "   - Git: $(git --version)"
echo "   - Node: $(node --version)"
echo "   - NPM: $(npm --version)"

# Clonar repositorio
echo ""
echo "📦 Clonando repositorio..."
cd ~/..
git clone https://github.com/juandavidgudelonoa-sketch/creart-react
cd creart-react

# Instalar dependencias
echo ""
echo "📥 Instalando dependencias..."
npm install

echo ""
echo "🎉 Listo! Para ejecutar:"
echo "   cd creart-react"
echo "   npm run dev"
