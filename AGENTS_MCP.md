# MCPs Configurados - CREART

## MCPs Instalados

### 1. Firebase MCP
- **Comando**: `npx -y firebase-tools@latest experimental:mcp`
- **Servicios**: Firestore, Auth, Storage, Cloud Functions
- **Uso**: Gestionar base de datos, usuarios, imágenes

### 2. GitHub MCP
- **Comando**: `npx -y @modelcontextprotocol/server-github`
- **Uso**: Commits, PRs, issues desde AI

## Configuración por IDE

### Cursor
Agregar en `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "firebase": {
      "command": "npx",
      "args": ["-y", "firebase-tools@latest", "experimental:mcp"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}
```

### VS Code (Copilot Free)
Agregar en `mcp.json` en la raíz del proyecto:
```json
{
  "mcpServers": {
    "firebase": {
      "command": "npx",
      "args": ["-y", "firebase-tools@latest", "experimental:mcp"]
    }
  }
}
```

### Windsurf
Igual que Cursor.

## Requisitos

1. Node.js 18+
2. Firebase CLI: `npm i -g firebase-tools`
3. Credenciales de Firebase configuradas (`firebase login`)

## Comandos Firebase Útiles

```bash
# Login
firebase login

# Iniciar emuladores (para desarrollo local)
firebase emulators:start

# Desplegar funciones
firebase deploy --only functions
```
