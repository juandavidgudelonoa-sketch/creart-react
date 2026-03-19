# Instrucciones para Deploy del Backend

## Opción 1: Deploy desde tu máquina local

### Prerrequisitos
1. Instala Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`

### Pasos
```bash
# 1. Entra al proyecto
cd "C:\Users\equipo\OneDrive\Desktop\Carpinteria creart\creart-react"

# 2. Inicia sesión en Railway
railway login

# 3. Vincula el proyecto (si ask, usa el proyecto existente o crea uno nuevo)
railway init

# 4. Deploy
railway up
```

### Configurar Variables de Entorno (en Railway Dashboard)
Ve a tu proyecto en Railway y configura:
- `OLLAMA_API_KEY` = tu key de Ollama
- `GOOGLE_APPLICATION_CREDENTIALS` = JSON de Firebase Admin (como una sola línea)

---

## Opción 2: GitHub Integration (Recomendado)

1. Sube el código a GitHub
2. Ve a Railway Dashboard
3. Crea nuevo proyecto desde GitHub
4. Selecciona el repositorio `creart-react`
5. Configura las variables de entorno
6. Railway automáticamente hará deploy

---

## Endpoints del Backend (una vez deployado)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/chat` | Chat con IA |
| GET | `/api/orders` | Listar pedidos |
| PUT | `/api/orders/<id>/status` | Actualizar estado |
| GET | `/api/products` | Listar productos |
| GET | `/api/products/low-stock` | Stock bajo |
| GET | `/api/summary` | Resumen ventas |
| GET | `/api/analysis` | Análisis clientes |
| GET | `/api/recommendations` | Recomendaciones |
| GET | `/api/prediction` | Predicción ventas |
