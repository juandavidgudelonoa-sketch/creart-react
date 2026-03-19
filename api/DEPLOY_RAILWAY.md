# Railway Deployment Guide para CREART Backend

## Variables de Entorno Requeridas

Debes configurar estas variables en el Dashboard de Railway:

### 1. GOOGLE_APPLICATION_CREDENTIALS (OBLIGATORIO)
**Valor:** El JSON completo del Service Account de Firebase

```json
{
  "type": "service_account",
  "project_id": "creart-313b9",
  "private_key_id": "TU_PRIVATE_KEY_ID",
  "private_key": "-----BEGIN PRIVATE KEY-----\nTU_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@creart-313b9.iam.gserviceaccount.com",
  "client_id": "TU_CLIENT_ID",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40creart-313b9.iam.gserviceaccount.com"
}
```

**Nota:** Debes pegar el JSON completo en UNA SOLA LÍNEA (sin saltos de línea) o usar el formato multilínea correctamente.

### 2. FLASK_ENV
**Valor:** `production`

### 3. SECRET_KEY
**Valor:** Cualquier string aleatoria (ej: `creart-secret-key-2026`)

---

## Variables Opcionales

### OLLAMA_API_KEY
**Valor:** Tu API key de Ollama Cloud (si tienes una)

### GEMINI_API_KEY
**Valor:** Tu API key de Google Gemini (backup para IA)

---

## Pasos para Deploy

1. Ve a https://railway.app
2. Crea un nuevo proyecto: "New Project" → "Deploy from GitHub repo"
3. Selecciona tu repositorio y la rama: `feature/pedidos-firebase-mercadopago`
4. En la sección "Variables", agrega las variables de arriba
5. Railway detectará automáticamente el archivo `railway.json`
6. Click en "Deploy"

---

## Verificar que Funciona

Después del deploy, visita:
```
https://tu-backend-production.up.railway.app/health
```

Debe responder con `{"status": "ok"}`

---

## Notas Importantes

- **NO** guardes las credenciales de Firebase en el código GitHub
- Las credenciales deben	setearse en Railway Dashboard
- Si Firebase no está conectado, el sistema usará datos de demo automáticamente
