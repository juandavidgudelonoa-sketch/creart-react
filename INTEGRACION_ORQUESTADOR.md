# Integracion Orquestador Python + creart-react

## Arquitectura

```
React (Frontend) <--> Python API (Flask) <--> Orquestador Python
                              |
                              v
                    Ollama (Modelos IA)
```

## Archivos Creados

| Archivo | Descripcion |
|---------|-------------|
| `api_server.py` | Servidor Flask con endpoints del Orquestador |
| `src/hooks/useOrquestador.ts` | Hook de React para conectar con la API |
| `src/components/OrquestadorDemo.tsx` | Componente de demo |

## Como Usar

### 1. Iniciar el servidor Python

```bash
cd "C:\Users\equipo\OneDrive\Desktop\Carpinteria creart\creart-react"
python api_server.py
```

El servidor correra en: `http://localhost:5000`

### 2. Usar el hook en React

```tsx
import { useOrquestador } from './hooks/useOrquestador';

function MiComponente() {
  const { procesarPrompt, isLoading, error, resultado } = useOrquestador();
  
  const handleSubmit = async () => {
    const result = await procesarPrompt("crear un boton");
    if (result) {
      console.log("Workflow:", result.workflow);
    }
  };
  
  return (
    <button onClick={handleSubmit} disabled={isLoading}>
      {isLoading ? 'Procesando...' : 'Enviar'}
    </button>
  );
}
```

### 3. Usar el componente de demo

```tsx
import { OrquestadorDemo } from './components/OrquestadorDemo';

function App() {
  return (
    <div>
      <OrquestadorDemo 
        onWorkflowDeterminado={(wf) => console.log(wf)}
        onPromptProcesado={(r) => console.log(r)}
      />
    </div>
  );
}
```

## Endpoints de la API

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/health` | Verificar estado del servidor |
| POST | `/api/process` | Procesar prompt completo |
| POST | `/api/workflow/determinar` | Determinar workflow sin ejecutar |
| POST | `/api/workflow/ejecutar` | Ejecutar workflow especifico |

## Ejemplo de respuesta

```json
{
  "success": true,
  "data": {
    "prompt_original": "crea un boton",
    "ciclos": 1,
    "prompt_final": "Tengo el siguiente objetivo: crea un boton. Como puedo lograrlo?",
    "aprobado": true,
    "workflow": "CREAR",
    "timestamp_inicio": "2026-02-26T12:00:00",
    "timestamp_fin": "2026-02-26T12:00:01"
  }
}
```

## Workflows Disponibles

- **CREAR** - Para prompts de creacion/generacion
- **ANALIZAR** - Para prompts de analisis/revision
- **ORGANIZAR** - Para prompts de organizacion
- **BUSCAR** - Para prompts de busqueda
- **GENERAL** - Para otros tipos de prompts

## Siguientes Pasos

1. Probar la conexion inicianto el servidor y el frontend
2. Integrar con Firebase para guardar historiales
3. Conectar con Ollama para procesamiento de IA
4. Desplegar a produccion (Railway, Cloud Run, etc.)
