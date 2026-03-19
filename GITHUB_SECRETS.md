# Configuración de GitHub Secrets

## Secrets necesarios para el deploy automático

### 1. RAILWAY_TOKEN
- Ve a: https://railway.app/account
- Genera un nuevo token
- Copia el valor (empieza con `ra_`)

### 2. RAILWAY_PROJECT_ID
- Ve a tu proyecto en Railway
- Copia el Project ID de la URL: `railway.app/project/xxxx-xxxx-xxxx`

### 3. OLLAMA_API_KEY (opcional)
- Tu API key de Ollama Cloud

### 4. GOOGLE_APPLICATION_CREDENTIALS (opcional)
- JSON de Firebase Admin en una sola línea

---

## Cómo configurar los secrets:

### Opción 1: GitHub Web
1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Agrega cada uno de los valores acima

### Opción 2: GitHub CLI
```bash
gh secret set RAILWAY_TOKEN
gh secret set RAILWAY_PROJECT_ID  
gh secret set OLLAMA_API_KEY
```

---

## Variables disponibles en el workflow:

| Secret | Requerido | Descripción |
|--------|-----------|-------------|
| RAILWAY_TOKEN | ✅ | Token de Railway |
| RAILWAY_PROJECT_ID | ✅ | ID del proyecto |
| OLLAMA_API_KEY | ❌ | Para IA |
| GOOGLE_APPLICATION_CREDENTIALS | ❌ | Para Firebase |

---

## Trigger del deploy:

El deploy se ejecuta automáticamente cuando:
- Haces push a la rama `main` o `backend-improvements`
- Hay cambios en la carpeta `api/**`

También puedes ejecutarlo manualmente desde GitHub Actions.
