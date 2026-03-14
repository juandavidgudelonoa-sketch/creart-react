#!/data/data/com.termux/files/usr/bin/bash

echo "🔍 Buscando Firebase..."

# Buscar google-services.json
find /sdcard -name "google-services.json" 2>/dev/null

# Buscar en Downloads
ls /sdcard/Download/ 2>/dev/null

# Buscar en Documents  
ls /sdcard/Documents/ 2>/dev/null

# Buscar .env
find /sdcard -name ".env*" 2>/dev/null

echo "✅ Busqueda completada"
