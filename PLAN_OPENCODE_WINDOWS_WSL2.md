# PLAN: OpenCode + WSL2 + Windows en Paralelo

## Problema Actual
- OpenCode en WSL2 no es accesible desde Windows
- Conflictos de configuración entre entornos
- MCP de MercadoPago causa errores de configuración

## Solución: Arquitectura Dual

### Estructura de Carpetas
```
Carpinteria creart/
├── creart-react/          # Proyecto principal (WSL2)
│   ├── src/
│   ├── functions/         # Firebase Functions
│   ├── opencode.json      # Config de OpenCode
│   └── package.json
└── scripts/               # Scripts compartidos
```

---

## OPCIÓN 1: WSL2 como Servidor (Recomendado)

### Paso 1: Configurar WSL2
```bash
# En WSL2 Ubuntu
cd ~/OneDrive/Desktop/Carpinteria\ creart/creart-react
opencode serve --hostname 0.0.0.0
```

### Paso 2: Port Forward en Windows (PowerShell Admin)
```powershell
# Obtener IP de WSL
wsl hostname -I
# Resultado: 172.x.x.x

# Crear regla firewall
netsh advfirewall firewall add rule name="OpenCode" dir=in action=allow protocol=TCP localport=4096

# Port proxy
netsh interface portproxy add v4tov4 listenport=4096 listenaddress=0.0.0.0 connectport=4096 connectaddress=172.x.x.x
```

### Paso 3: Conectar desde Windows
```powershell
# Conectar cliente OpenCode a:
http://localhost:4096
# ó
http://172.x.x.x:4096
```

---

## OPCIÓN 2: OpenCode Directo en Windows

### Ventajas
- No necesita configuración de red
- Funciona inmediatamente
- Más estable

### Paso 1: Instalar OpenCode en Windows
```powershell
# Con winget
winget install --id=OliveOffice.OpenCode -e
```

### Paso 2: Usar proyecto directamente
```powershell
cd "C:\Users\equipo\OneDrive\Desktop\Carpinteria creart\creart-react"
opencode serve
```

---

## Configuración de opencode.json (Sin MCP Problemático)

### WSL2: ~/.config/opencode/opencode.json
```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {},
  "provider": {
    "ollama": {
      "options": {
        "baseURL": "http://localhost:11434/v1"
      },
      "models": {
        "ollama/qwen3-coder:480b-cloud": {},
        "ollama/deepseek-v3.1:671b-cloud": {}
      }
    }
  },
  "plugin": ["oh-my-opencode@latest"]
}
```

### Windows: Usar el mismo archivo de proyecto
```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "mercadopago": {
      "type": "sse",
      "url": "https://mcp.mercadopago.com/mcp"
    }
  },
  "provider": {
    "ollama-cloud": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Ollama Cloud",
      "options": {
        "baseURL": "https://ollama.com/v1",
        "apiKey": "tu_api_key"
      }
    }
  }
}
```

---

## Scripts de Deploy

### Windows: deploy.bat
```batch
@echo off
cd /d "%~dp0"
npm run build
firebase deploy --only hosting
echo Deploy completado!
pause
```

### WSL2: deploy.sh
```bash
#!/bin/bash
cd ~/OneDrive/Desktop/Carpinteria\ creart/creart-react
npm run build
firebase deploy --only hosting
echo Deploy completado!
```

---

## Comandos Rápidos

### Iniciar Todo (Windows PowerShell)
```powershell
# Terminal 1: Firebase Emulators
cd "C:\Users\equipo\OneDrive\Desktop\Carpinteria creart\creart-react\functions"
npm run serve

# Terminal 2: Frontend
cd "C:\Users\equipo\OneDrive\Desktop\Carpinteria creart\creart-react"
npm run dev
```

### Iniciar Todo (WSL2)
```bash
# Terminal 1: Firebase Emulators
cd ~/OneDrive/Desktop/Carpinteria\ creart/creart-react/functions
npm run serve

# Terminal 2: Frontend
cd ~/OneDrive/Desktop/Carpinteria\ creart/creart-react
npm run dev

# Terminal 3: OpenCode Server
cd ~/OneDrive/Desktop/Carpinteria\ creart/creart-react
opencode serve --hostname 0.0.0.0
```

---

## Notas Importantes

1. **Solo UN OpenCode serve a la vez** - Si tienes 2 servidores, habrá conflicto
2. **MercadoPago MCP** - Solo funciona bien en VS Code, no en OpenCode CLI
3. **Puertos**:
   - 4096: OpenCode Server
   - 5001: Firebase Functions (emulator)
   - 5173/5174: Frontend Vite
   - 4000: Firebase Emulator UI

---

## Checklist Antes de Trabajar

- [ ] Cerrar cualquier servidor OpenCode existente
- [ ] Verificar que no hay procesos en puerto 4096
- [ ] Elegir: ¿Windows o WSL2?
- [ ] Iniciar servicios necesarios
